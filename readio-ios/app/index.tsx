import { useAuth } from "@clerk/clerk-expo";
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import { Redirect } from "expo-router";
import { tokenCache } from "@/lib/auth";
import { useEffect, useState } from "react";
import sql from "@/helpers/neonClient";
import { setStateAsync } from "@/constants/utilityFunctions";
import Animated, { FadeOut } from "react-native-reanimated";
import { View, Image } from "react-native";
import { colors } from "@/constants/tokens";
import { ImageAssets } from "@/constants/imageAssets";
import { useLotusUtils } from "@/helpers/providers/lotusUtilsContext";

const Page = () => {

  const { user, setUser, isSignedIn, setIsSignedIn, setNeedsToRefresh, hasAccount, setHasAccount } = useLotusUser();
  const [isLoading, setIsLoading] = useState(true);
  const {setSignUpBannerIsVisible} = useLotusUtils()

  const getUserInfo = async (hash: string) => {
    const userInfo = await sql`
        SELECT * FROM users 
        WHERE jwt = ${hash}
        LIMIT 1
      `;
    if (userInfo && setUser) {
      await setStateAsync(setUser, userInfo[0], 'backendData');
      return true;
    } else {
      return false;
    }
  };
  
  const checkSignInStatus = async () => {

    const savedHash = await tokenCache.getToken('lotusJWTAlwaysGrowingToken');

    if (savedHash) {

      console.log('page.tsx initial found user')
      await setStateAsync(setIsSignedIn as Function, true, 'backendData');

      /*  NOTE - For Line 60 through 61:
      Double verification of user authentication:
      1. First check: User has a valid hash in storage (indicating previous successful login)
      2. Second check: User exists in our database with active account data
      
      This two-step verification ensures we have both valid authentication AND 
      existing user data before proceeding to the main app. This prevents edge cases 
      where a user might have auth credentials but missing account data.
      */

      const userExists = await getUserInfo(savedHash);
      await setStateAsync(setHasAccount as Function, userExists, 'backendData');

    } else {
      await setStateAsync(setIsSignedIn as Function, false, 'backendData');
      await setStateAsync(setHasAccount as Function, false, 'backendData');
    }

  };

  // this ensures that there evne is a user
  useEffect(() => {

    const initializeData = async () => {
      await checkSignInStatus();
      setIsLoading(false);
      setSignUpBannerIsVisible?.(false)
    };

    initializeData();

  }, [user]);

  // this ensures that the user data actually loads BEFORE we redirect to the app
  useEffect(() => {
    if (isSignedIn && hasAccount) {
      setNeedsToRefresh?.(true);
    }
  }, [isSignedIn, hasAccount]);


  if (isLoading) {
    return (
      <Animated.View 
        exiting={FadeOut.duration(200)}
        style={{ 
          flex: 1, 
          backgroundColor: colors.readioWhite,
          justifyContent: 'center', 
          alignItems: 'center' 
        }}
      >
        <Image
          source={ImageAssets.blackLogo}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
      </Animated.View>
    );
  }

  if (isSignedIn === false || hasAccount === false) {
    return null; 
  }

  if (isSignedIn && hasAccount) {


    return <Redirect href="/(tabs)/(home)/home" />;

  /* NOTE - For Line 97 through 98:
    Additional authentication safeguard:
    This else-if condition serves as a security fallback to handle edge cases where:
    1. User has valid authentication credentials (isSignedIn)
    2. But lacks an account in our database (!hasAccount)
    
    By redirecting to sign-up in this case, we prevent unauthorized access and
    ensure all authenticated users have proper account records.
  */

  } else if (isSignedIn && !hasAccount) {
      return <Redirect href="/(auth)/sign-up" />;

  } else {
      return <Redirect href="/(auth)/welcome" />;
  }
  
  };

export default Page;