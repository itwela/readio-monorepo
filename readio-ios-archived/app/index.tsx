// import { useAuth } from "@clerk/clerk-expo";
import { useReadio } from "@/constants/readioContext";
import { Redirect } from "expo-router";
import { useState } from "react";

const Page = () => {
  const {isSignedInLotus, setIsSignedInLotus} = useReadio();
  const number = 1;
  // const { isSignedIn } = useAuth();

  if (isSignedInLotus === true) {
    return <Redirect href="/(tabs)/home" />;
  } 

  if (isSignedInLotus === false) {
    return <Redirect href="/(auth)/welcome" />;
  }
  
};

export default Page;