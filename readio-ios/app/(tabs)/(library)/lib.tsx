import { SafeAreaView } from 'react-native-safe-area-context'; 
import { buttonStyle, utilStyle } from "@/constants/tokens";
import { colors } from "@/constants/tokens";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";

export default function Lib() {
    return (
        <>
      <SafeAreaView style={[utilStyle.safeAreaContainer, {backgroundColor: colors.readioBrown}]}>
      <View style={styles.container}>
        <Text style={styles.text}>Library</Text>
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
    gap: {
      marginVertical: 20,
    },
    text: {
      fontSize: 60,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
      color: colors.readioWhite
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