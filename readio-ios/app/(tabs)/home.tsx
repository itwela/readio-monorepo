import { colors } from "@/constants/tokens";
import { StyleSheet } from "react-native";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { buttonStyle, utilStyle } from "@/constants/tokens";

export default function HomeTabOne() {
  return (
    <>
      <SafeAreaView style={utilStyle.safeAreaContainer}>
        <View style={styles.container}>
            <Text style={styles.text}>Home</Text>
            <Text onPress={() => router.push('/(auth)/welcome')} style={styles.subtext}>
            Back to Welcome           
            </Text>
        </View>
        </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
  },
  text: {
      fontSize: 60,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
  },
  subtext: {
    fontSize: 15,
    opacity: 0.5,
    textAlign: 'center',
    fontFamily: readioRegularFont,
    // color: colors.readioWhite
},
});