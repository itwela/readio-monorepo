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
      
        <View style={styles.flexRowCenter}>
        <View style={styles.flexLine} />
        <Text style={styles.textLg}>Or</Text>
        <View style={styles.flexLine} />
        </View>

        <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.flexRowCenter, styles.border]}
        >

            <Image
            source={icons.google}
            resizeMode="contain"
            style={styles.image}
            />

        <Button
            title="Log In with Google"
            color={colors.readioWhite}
            
            // style={styles.button}
            // IconLeft={() => (
            //   <Image
            //     source={icons.google}
            //     resizeMode="contain"
            //     style={styles.image}
            //   />
            // )}
            // bgVariant="outline"
            // textVariant="primary"
            onPress={handleGoogleSignIn}
        />

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
    borderRadius: 80,
    borderColor: colors.readioWhite,
    borderWidth: 1,
    padding: 8,
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