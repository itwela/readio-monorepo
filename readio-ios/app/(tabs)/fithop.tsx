import { LotusArticleModal } from '@/components/LotusArticleModal';
import LotusComponentObserver from '@/components/LotusComponentObserver';
import LotusGap from '@/components/LotusGap';
import LotusHeader from '@/components/LotusHeader';
import { getLocalImageUri } from '@/constants/imageAssets';
import { LotusArticle } from '@/types/type';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Image, Text, TouchableOpacity, StyleSheet, View } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";

export default function FithopPage() {

  interface Section {
    id: string;
    type: 'display-name' | 'menu' | 'articles' | 'observer';
    data?: LotusArticle[];
  }

  // Create sections for the FlatList with explicit typing
  const sections: Section[] = [
    { id: 'display-name', type: 'display-name' },
    { id: 'menu', type: 'menu' },
    { id: 'articles', type: 'articles', data: [] },
    { id: 'observer', type: 'observer' }
  ];


  return (
    <>
    <LotusHeader backgroundColor={colors.readioBrown} />
    <View style={styles.container}>
      {/* This will be the initial Components, that are rendered before you press start on the meditation or the presents section. I will conditionally render this based on that the person has started a presence session I guess. */}
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
                  Fithop
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
    <LotusArticleModal />
    </>
  );
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
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: `${colors.readioWhite}50`,
    marginVertical: 20
  },
  fullScrollView: {
    flexGrow: 1,
    width: "100%"
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
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.readioWhite,
    zIndex: 1,
    fontFamily: readioBoldFont
  },
  subtext: {
    fontSize: 15,
    opacity: 0.5,
    textAlign: 'center',
    fontFamily: readioRegularFont,
    color: colors.readioWhite
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
    paddingHorizontal: 20,
  },
  bettertittle: {
    fontSize: 45,
    fontWeight: 'bold',
    fontFamily: readioBoldFont,
    color: colors.readioWhite,
    paddingHorizontal: 20,
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
  readioRedTitle: {
    color: colors.readioOrange,
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
    fontFamily: readioBoldFont
  },
  recentlySavedContainer: {
    display: 'flex',
    gap: 10,
    flexDirection: 'row',
    width: '100%',
    minHeight: 'auto',  // Changed from height: 'auto'
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 15,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    flex: 1,  // Add this
    alignContent: 'flex-start',  // Add this
  },
  recentlySavedItems: {
    display: 'flex',
    width: '48%',
    height: 'auto',
    gap: 5,
    borderRadius: 10,
  },
  recentlySavedImg: {
    width: '100%',
    height: 150,
    backgroundColor: colors.readioWhite,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentlySavedTItle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: readioBoldFont
  },
  recentlySavedSubheading: {
    fontSize: 15,
    color: colors.readioDustyWhite,
    fontFamily: readioRegularFont
  },
  nowPlayingImage: {
    width: '100%',
    height: 150,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
    borderRadius: 10
  },
});