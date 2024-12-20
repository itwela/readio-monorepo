import { colors } from "@/constants/tokens";
import { StyleSheet } from "react-native";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
import { Text, View } from "react-native";

export default function HomeTabOne() {
  return (
    <>
        <View style={styles.container}>
            <Text style={styles.text}>Home</Text>
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
});