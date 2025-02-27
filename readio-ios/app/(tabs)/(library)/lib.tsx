import { LotusArticleModal } from '@/components/LotusArticleModal';
import LotusGap from '@/components/LotusGap';
import LotusHeader from '@/components/LotusHeader';
import { getLocalImageUri } from '@/constants/imageAssets';
import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { trackTitleFilter } from '@/helpers/filter';
import { geminiTest } from '@/helpers/geminiClient';
import sql from "@/helpers/neonClient";
import { pexelsClient } from '@/helpers/pexelsClient';
import { useLotusModal } from '@/helpers/providers/lotusModalContext';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { useLastActiveTrack } from '@/hooks/useLastActiveTrack';
import { useNavigationSearch } from '@/hooks/useNavigationSearch';
import { useTracks } from '@/store/library';
import { LotusArticle, RootNavigationProp } from '@/types/type';
import { useNavigation } from "@react-navigation/native";
import { Href, router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FastImage from 'react-native-fast-image';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';
import { handleGenerateArticleCompletelyFree, handleGenerateArticleCompletelyFreeProps } from '../../../handleArticleGenerations/handleGenerateArticle';
import { useProgressQueue } from '../../../handleArticleGenerations/processingQueue';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';

export default function LibTabTwo() {
  return (
    <>
      <SignedInLib />
    </>
  )
}

function SignedInLib() {
  const { user } = useLotusUser()
  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
  const search = useNavigationSearch({
    searchBarOptions: {
      placeholder: 'Find in songs',
    },
  })

  const tracks = useTracks()

  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])

  const { needsToRefresh, setNeedsToRefresh, userArticles, checkSignInStatus, refreshUserData } = useLotusUser()
  const [articleGenerationStatus, setArticleGenerationStatus] = useState('')
  const {setLinerNoteTopic, setReadioSelectedReadioId,  } = useLotusUtils()
  const { ProgressQueue, setGenerationStarted, setProgressMessage, generationStarted } = useProgressQueue()
  const { isArticleModalVisible, setIsArticleModalVisible } = useLotusModal()

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

  useEffect(() => {
    refreshUserData()
  }, [articleGenerationStatus])


  return (
    <>

      <LotusHeader backgroundColor={colors.readioBrown} />
      
      {/* <LotusGap backgroundColor={colors.readioBrown} gapNumber={30} /> */}
      <View style={styles.container}>
        
        <ScrollView style={styles.fullScrollView}
          showsVerticalScrollIndicator={false}
        >
          <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={[styles.bettertittle, {paddingTop: 30}]}>Library</Animated.Text>
          <View style={{
            paddingVertical: 5,
            backgroundColor: "transparent",
            paddingHorizontal: 20,
          }}>
            <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.option} onPress={() => router.push('/(tabs)/(library)/(playlist)')}>Playlist</Animated.Text>
            <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.option} onPress={() => router.push('/(tabs)/(library)/(playlist)/interests')}>Interests</Animated.Text>
            <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.option} onPress={() => { handleGoToLinerNotes() }}>Liner Notes</Animated.Text>
            <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.option} onPress={() => router.push('/all-readios')}>All Articles</Animated.Text>
          </View>
          <View style={{ marginVertical: 15 }} />
          <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.title}>Recently Saved Articles</Animated.Text>
          <LotusGap backgroundColor={colors.readioBrown}  gapNumber={15} />
          <View style={styles.recentlySavedContainer}>
            {userArticles?.length > 0 && (
              <>
                {userArticles?.map((readio: LotusArticle, index: number) => (
                  <TouchableOpacity activeOpacity={0.9} onPress={() => handleGoToSelectedReadio(readio?.id as number, readio?.title as string)} key={readio.id} style={styles.recentlySavedItems}>
                    <Animated.View entering={FadeInUp.duration(300 + (index * 100))} exiting={FadeOutDown.duration(100)} >
                      <View style={styles.recentlySavedImg}>
                        {/* <Image source={{uri: readio.image}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
                        <FastImage source={{ uri: getLocalImageUri('filter') }} style={[styles.nowPlayingImage, { zIndex: 1, opacity: 0.4 }]} resizeMode='cover' />
                        <FastImage source={{ uri: readio.image ? readio.image : getLocalImageUri('unknownArticle') }} style={styles.nowPlayingImage} resizeMode='cover' />
                        {/* <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
                      </View>
                      <Text allowFontScaling={false} numberOfLines={2} style={styles.recentlySavedTItle}>{readio.title}</Text>
                      <Text allowFontScaling={false} numberOfLines={1} style={styles.recentlySavedSubheading}>{readio.topic}</Text>
                    </Animated.View>
                  </TouchableOpacity>
                ))}
              </>

            )}
          </View>

          {/* <View style={{ height: floatingPlayerIsVisible ? 90 : 60 }} /> */}
          <LotusGap backgroundColor={colors.readioBrown}  gapNumber={300} />

        </ScrollView>
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
  },
  fullScrollView: {
    height: "100%",
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