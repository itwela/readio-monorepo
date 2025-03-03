import LotusHeader from "@/components/LotusHeader";
import { colors, readioBoldFont } from "@/constants/tokens";
import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import Animated, { FadeInDown, FadeInUp, FadeOutDown } from "react-native-reanimated";

export default function LotusPresencePage() {

  interface Section {
    id: string;
    type: 'display-name' | 'menu' | 'articles' | 'observer';
    // data?: LotusArticle[];
  }

  // Create sections for the FlatList with explicit typing
  const sections: Section[] = [
    { id: 'display-name', type: 'display-name' },
    { id: 'menu', type: 'menu' },
  ];


  return (
    <>
      <LotusHeader backgroundColor={colors.readioBrown} />
      <View style={styles.container}>
      <FlatList
        data={sections}
        renderItem={({ item }: { item: Section }) => {
          switch (item.type) {
            case 'display-name':
              return (
                <Animated.Text 
                  entering={FadeInUp.duration(300)} 
                  exiting={FadeOutDown.duration(100)} 
                  allowFontScaling={false} 
                  style={[styles.bettertittle, {paddingTop: 30}]}
                >
                  Presence
                </Animated.Text>
              );
            case 'menu':
              return (
                <></>
              );
            case 'articles':
              return (
                <>
                  {/* <View style={styles.divider} /> */}
                </>
              );
            case 'observer':
              return (
                <>
                </>
              );
            default:
              return null;
          }
        }}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'center',
    backgroundColor: colors.readioBrown,
    width: "100%",
    justifyContent: "space-between",
    flex: 1,
  },
  bettertittle: {
    fontSize: 45,
    fontWeight: 'bold',
    fontFamily: readioBoldFont,
    color: colors.readioWhite,
    paddingHorizontal: 20,
  },
});