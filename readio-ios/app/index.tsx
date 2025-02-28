import { useAuth } from "@clerk/clerk-expo";
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import { Redirect } from "expo-router";
import { tokenCache } from "@/lib/auth";
import { useEffect, useState } from "react";
import sql from "@/helpers/neonClient";
import { setStateAsync } from "@/constants/utilityFunctions";

const Page = () => {

  const { user, setUser, isSignedIn, setIsSignedIn, hasAccount, setHasAccount } = useLotusUser();

  const getPasswordHashFromNeonDB = async (email: string) => {
    try {
      const result = await sql`
        SELECT pwhash FROM users WHERE email = ${email};
      `;
      console.log('result', result[0]?.email);
      return result[0]?.pwhash;
    } catch (error) {
      console.log('Error retrieving password hash from Neon DB:', error);
      alert('User not found, please sign up');
      return null;
    }
  };

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

  useEffect(() => {

    const initializeData = async () => {
      await checkSignInStatus();
    };

    initializeData();

  }, [user]);

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