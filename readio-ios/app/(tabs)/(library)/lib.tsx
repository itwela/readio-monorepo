import { LotusArticleModal } from '@/components/LotusArticleModal';
import LotusComponentObserver from '@/components/LotusComponentObserver';
import LotusGap from '@/components/LotusGap';
import LotusHeader from '@/components/LotusHeader';
import { getLocalImageUri } from '@/constants/imageAssets';
import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { setStateAsync } from '@/constants/utilityFunctions';
import { trackTitleFilter } from '@/helpers/filter';
import { useLotusTabBar } from '@/helpers/providers/lotusTabBarProvider';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { useLastActiveTrack } from '@/hooks/useLastActiveTrack';
import { useNavigationSearch } from '@/hooks/useNavigationSearch';
import { useTracks } from '@/store/library';
import { LotusArticle, RootNavigationProp } from '@/types/type';
import { useNavigation } from "@react-navigation/native";
import { Href, router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';

export default function SignedInLib() {

  const { mostRecentUserArticles, refreshUserData } = useLotusUser()
  // const [articleGenerationStatus, setArticleGenerationStatus] = useState('')
  const {setLinerNoteTopic, setReadioSelectedReadioId, floatingPlayerIsVisible, setCurrentRouteName } = useLotusUtils()
  const { handleScroll, setIsTabBarVisible } = useLotusTabBar()

  const handleGoToSelectedReadio = (readioId: number, name: string) => {
    setReadioSelectedReadioId?.(readioId)
    console.log('handleGoToSelectedReadio', readioId)
    console.log('handleGoToSelectedReadio', name)
    router.push(`/(tabs)/(library)/${readioId}` as Href)
  }

  const handleGoToLinerNotes = async () => {
    TrackPlayer.reset()
    setLinerNoteTopic?.("Lotus Liner Notes")
    router.push('/(tabs)/(home)/linerNotes')
  }

  const activeTrack = useActiveTrack();
  const lastActiveTrack = useLastActiveTrack();
  const displayedTrack = activeTrack ?? lastActiveTrack;

  // useEffect(() => {
  //   refreshUserData()
  // }, [articleGenerationStatus])

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100
  };

  const onViewableItemsChanged = useCallback(({ viewableItems, changed }: {viewableItems: any, changed: any}) => {
    // If the last item becomes visible, hide the tab bar
    const lastItemVisible = viewableItems.some((item: any) => item.index === sections.length - 1);
    setIsTabBarVisible(!lastItemVisible);
  }, []);

  interface Section {
    id: string;
    type: 'display-name' | 'menu' | 'articles' | 'observer';
    data?: LotusArticle[];
  }

  // Create sections for the FlatList with explicit typing
  const sections: Section[] = [
    { id: 'display-name', type: 'display-name' },
    { id: 'menu', type: 'menu' },
    { id: 'articles', type: 'articles', data: mostRecentUserArticles },
    // { id: 'observer', type: 'observer' }
  ];
  

return (
  <>
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
                  Library
                </Animated.Text>
              );
            case 'menu':
              return (
                <>
                <View style={{
                  paddingTop: 5,
                  backgroundColor: "transparent",
                  paddingHorizontal: 20,
                }}>
                  <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.option} onPress={() => router.push('/(tabs)/(library)/(playlist)')}>Playlist</Animated.Text>
                  <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.option} onPress={() => router.push('/(tabs)/(library)/(playlist)/interests')}>Interests</Animated.Text>
                  <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.option} onPress={() => handleGoToLinerNotes()}>Liner Notes</Animated.Text>
                  <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.option} onPress={() => router.push('/all-readios')}>All Articles</Animated.Text>
                  <View style={styles.divider} />
                </View>
                  </>
              );
            case 'articles':
              return (
                <>
                  <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.title}>Recently Saved Articles</Animated.Text>
                  <LotusGap backgroundColor={colors.readioBrown} gapNumber={15} />
                  <View style={styles.recentlySavedContainer}>
                    {item.data && item.data.length > 0 && (
                      <>
                        {item.data.map((readio: LotusArticle, index: number) => (
                          <TouchableOpacity 
                            activeOpacity={0.9} 
                            onPress={() => handleGoToSelectedReadio(readio?.id as number, readio?.title as string)} 
                            key={readio.id} 
                            style={styles.recentlySavedItems}
                          >
                            <Animated.View entering={FadeInUp.duration(300 + (index * 100))} exiting={FadeOutDown.duration(100)}>
                              <View style={styles.recentlySavedImg}>
                                <Image source={{ uri: getLocalImageUri('filter') }} style={[styles.nowPlayingImage, { zIndex: 1, opacity: 0.4 }]} resizeMode='cover' />
                                <Image source={{ uri: readio.image ? readio.image : getLocalImageUri('unknownArticle') }} style={styles.nowPlayingImage} resizeMode='cover' />
                              </View>
                              <Text allowFontScaling={false} numberOfLines={2} style={styles.recentlySavedTItle}>{readio.title}</Text>
                              <Text allowFontScaling={false} numberOfLines={1} style={styles.recentlySavedSubheading}>{readio.topic}</Text>
                            </Animated.View>
                          </TouchableOpacity>
                        ))}
                      </>
                    )}
                  </View>
                  <View style={styles.divider} />
                  <View style={{height: floatingPlayerIsVisible ? 130 : 100}}/>
                </>
              );
            // case 'observer':
            //   return (
            //     <>
            //       <LotusComponentObserver markerColor='transparent' />
            //       <LotusPresenceIntro/>
            //     </>
            //   );
            default:
              return null;
          }
        }}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
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
    marginTop: 110,
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