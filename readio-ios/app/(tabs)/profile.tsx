import { colors } from "@/constants/tokens";
import { SafeAreaView, StyleSheet } from "react-native";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
import { Text } from "react-native";  
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <>
    <SafeAreaView>
      <Text onPress={() => router.push("/(auth)/welcome")}>back to welcome screen</Text>
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
  gap: {
    marginVertical: 20,
  },
  heading: {
    fontSize: 60,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: readioBoldFont
  },
  option: {
    fontSize: 20,
    paddingVertical: 10,
    color: colors.readioWhite,
    fontFamily: readioRegularFont,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

