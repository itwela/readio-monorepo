import { useAuth } from "@clerk/clerk-expo";
import { useReadio } from "@/constants/readioContext";
import { Redirect } from "expo-router";
import { tokenCache } from "@/lib/auth";
import { useEffect, useState } from "react";
import sql from "@/helpers/neonClient";
import { useLotusAuth } from "@/constants/LotusAuthContext";

const Page = () => {

  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [hasAnAccount, setHasAnAccount] = useState<boolean | null>(null);
  const { initialAuthEmail, setInitialAuthEmail } = useLotusAuth();
  const { user, setUser } = useReadio();

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

  useEffect(() => {
    const checkSignInStatus = async () => {
      const savedHash = await tokenCache.getToken('lotusJWTAlwaysGrowingToken');
      setIsSignedIn(Boolean(savedHash));
      console.log('shhhh', savedHash);
      if (savedHash) {
        const userExists = await getUserInfo(savedHash);
        setHasAnAccount(userExists);
      } else {
        setHasAnAccount(false);
      }
    };

    const getUserInfo = async (hash: string) => {
      const userInfo = await sql`SELECT * FROM users WHERE jwt = ${hash}`;
      if (userInfo) {
        setUser?.(userInfo[0]);
        console.log("userInfo: ", userInfo[0]);
        return true;
      } else {
        return false;
      }
    };

    checkSignInStatus();
  }, [user]);

  if (isSignedIn === null || hasAnAccount === null) {
    return null; // or a loading indicator
  }

  if (isSignedIn && hasAnAccount) {
    return <Redirect href="/(tabs)/(home)/home" />;
  } else if (isSignedIn && !hasAnAccount) {
    return <Redirect href="/(auth)/sign-up" />;
  } else {
    return <Redirect href="/(auth)/welcome" />;
  }
};

export default Page;