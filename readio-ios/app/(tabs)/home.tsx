import { colors } from "@/constants/tokens";
import { StyleSheet } from "react-native";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
import { Text, View } from "react-native";
import { router } from "expo-router";

export default function HomeTabOne() {
  return (
    <>
        <View style={styles.container}>
            <Text style={styles.text}>Home</Text>
            <Text onPress={() => router.push('/(auth)/welcome')} style={styles.subtext}>
            Back to Welcome           
            </Text>
        </View>
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
  },
  subtext: {
    fontSize: 15,
    opacity: 0.5,
    textAlign: 'center',
    fontFamily: readioRegularFont,
    // color: colors.readioWhite
},
});