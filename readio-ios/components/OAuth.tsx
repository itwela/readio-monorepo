import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Alert, Image, Text, View, StyleSheet, TouchableOpacity } from "react-native";

import { Button } from "react-native";
import { icons } from "@/constants/icons";
import { googleOAuth } from "@/lib/auth";
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { colors } from "@/constants/tokens";

const OAuth = () => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleGoogleSignIn = async () => {
    const result = await googleOAuth(startOAuthFlow);

    if (result.code === "session_exists") {
      Alert.alert("Success", "Session exists. Redirecting to home screen.");
      router.replace("/(tabs)/home");
    }

    Alert.alert(result.success ? "Success" : "Error", result.message);
  };

  return (
    <View style={{display: 'flex', alignItems: 'center', gap: 10, width: '100%'}}>
      
        <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.flexRowCenter, styles.border]}
        >

            <Image
            source={icons.google}
            resizeMode="contain"
            style={styles.image}
            />

        <TouchableOpacity onPress={handleGoogleSignIn}> 
          <Text style={{color: colors.readioWhite, fontFamily: readioBoldFont, fontSize: 20}}>Continue with Google</Text>
        </TouchableOpacity>

        </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  flexRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  border: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderColor: colors.readioWhite,
    borderWidth: 1,
  },
  flexLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d1d1',
    marginHorizontal: 16,
  },
  textLg: {
    fontSize: 18,
    color: colors.readioWhite,
  },
  button: {
    marginTop: 20,
    width: '100%',
    shadowOpacity: 0,
  },
  image: {
    width: 20,
    height: 20,
    marginHorizontal: 8,
  },
});

export default OAuth;