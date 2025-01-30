import { useAuth } from "@clerk/clerk-expo";
import { useReadio } from "@/constants/readioContext";
import { Redirect } from "expo-router";
import { tokenCache } from "@/lib/auth";
import { useEffect, useState } from "react";
import sql from "@/helpers/neonClient";
import { useLotusAuth } from "@/constants/LotusAuthContext";

const Page = () => {

  const { initialAuthEmail, setInitialAuthEmail } = useLotusAuth();
  const { user, setUser, isSignedIn, setIsSignedIn, hasAccount, setHasAccount } = useReadio();

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
      setIsSignedIn?.(Boolean(savedHash));
      console.log('shhhh', savedHash);
      if (savedHash) {
        const userExists = await getUserInfo(savedHash);
        setHasAccount?.(userExists);
      } else {
        setHasAccount?.(false);
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

  if (isSignedIn === null || hasAccount === null) {
    return null; // or a loading indicator
  }

  if (isSignedIn && hasAccount) {
    return <Redirect href="/(tabs)/(home)/home" />;
  } else if (isSignedIn && !hasAccount) {
    return <Redirect href="/(auth)/sign-up" />;
  } else {
    return <Redirect href="/(auth)/welcome" />;
  }
};

export default Page;