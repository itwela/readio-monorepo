import { useAuth } from "@clerk/clerk-expo";
import { useReadio } from "@/constants/readioContext";
import { Redirect } from "expo-router";
import { tokenCache } from "@/lib/auth";
import { useEffect, useState } from "react";
import sql from "@/helpers/neonClient";

const Page = () => {

  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const { user, setUser } = useReadio();
  useEffect(() => {
    const checkSignInStatus = async () => {
      const savedHash = await tokenCache.getToken('userPasswordHash');
      setIsSignedIn(Boolean(savedHash));
      if (savedHash) {
        getUserInfo(savedHash);
      }
    };
    const getUserInfo = async (hash: string) => {
      const userInfo = await sql`SELECT * FROM users WHERE pwhash = ${hash}`
      setUser?.(userInfo[0]);
      console.log("userInfo: ", userInfo[0]);
    }
    checkSignInStatus();
  }, [user]);

  if (isSignedIn === null) {
    return null; // or a loading indicator
  }

  // if (!isSignedIn) {
  //   return <Redirect href="/(tabs)/(home)/home" />;
  // }

  return <Redirect href="/(auth)/welcome" />;
};

export default Page;