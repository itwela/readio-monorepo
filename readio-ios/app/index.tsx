import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import { Redirect } from "expo-router";
import { useLotusUtils } from "@/helpers/providers/lotusUtilsContext";
import { useLotusAuth } from "@/helpers/providers/LotusAuthContext";
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/constants/tokens";

// LINK page that redirects to the app or the auth page!
const Page = () => {
  const { user } = useLotusUser();
  const { isAuthenticated, isLoading } = useLotusAuth();
  const { masterDebugMode } = useLotusUtils();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.readioBrown 
      }}>
        <ActivityIndicator size="large" color={colors.readioWhite} />
      </View>
    );
  }

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/(home)/home" />;
  } else {
    return <Redirect href="/(auth)/welcome" />;
  }
};

export default Page;