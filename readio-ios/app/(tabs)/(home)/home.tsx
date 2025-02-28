import { LotusArticleModal } from "@/components/LotusArticleModal";
import LotusGap from "@/components/LotusGap";
import LotusHeader from "@/components/LotusHeader";
import { getLocalImageUri, preloadImages } from "@/constants/imageAssets";
import NotSignedIn from '@/constants/notSignedIn';
import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { trackTitleFilter } from '@/helpers/filter';
import { geminiTest } from "@/helpers/geminiClient";
import sql from "@/helpers/neonClient";
import { pexelsClient } from "@/helpers/pexelsClient";
import { useLotusModal } from "@/helpers/providers/lotusModalContext";
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { replicate } from "@/helpers/replicateClient";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { useNavigationSearch } from '@/hooks/useNavigationSearch';
import { LotusArticle, RootNavigationProp, Station } from '@/types/type';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Keyboard, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import Animated, { FadeInDown, FadeInUp, FadeOutDown } from "react-native-reanimated";
import TrackPlayer, { Track } from "react-native-track-player";
import { handleGenerateArticleCompletelyFree, handleGenerateArticleCompletelyFreeProps } from "../../../handleArticleGenerations/handleGenerateArticle";
import { useProgressQueue } from "../../../handleArticleGenerations/processingQueue";
import { useLotusUtils } from "@/helpers/providers/lotusUtilsContext";
import { setStateAsync } from "@/constants/utilityFunctions";

export default function HomeTabOne() {

  return (
    <>
      <SignedInHomeTabOne />
    </>
  );
}

function SignedInHomeTabOne() {

  const { user, isSignedIn, needsToRefresh, startPlayingLinerNote, setStartPlayingLinerNote, setNeedsToRefresh, linerNoteArticles, homepageArticle, } = useLotusUser()
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const { clearLastActiveTrack } = useLastActiveTrack()
  const {floatingPlayerIsVisible } = useLotusUtils()
  const { isArticleModalVisible, setIsArticleModalVisible } = useLotusModal()
  const [screenIsReady, setScreenIsReady] = useState(false)
  const [refreshing, setRefreshing] = useState(false); // For refresh control

  // 
  const resetAudio = () => {
    TrackPlayer.pause();
    console.log("Tp is paused ,")
    TrackPlayer.reset();
    console.log("Tp is reset ,")
    clearLastActiveTrack();
  }

  //  GOES TO LINER NOTES PAGE
  const handleGoToLinerNotes = async () => {
    if (setStartPlayingLinerNote) {
      // TrackPlayer.reset()
      await setStateAsync(setStartPlayingLinerNote, true)
      router.push('/(tabs)/(home)/linerNotes')
    }
  }
  // 
  const onRefresh = () => {
    setRefreshing(true);
    setNeedsToRefresh?.(true)
    resetAudio();
    // checkSignInStatus()

    // Add any refresh logic here, such as resetting state or re-fetching data
    setTimeout(() => {
      setRefreshing(false);
      setNeedsToRefresh?.(false)
    }, 1000); // Simulate an async operation
  };

  // 
  useEffect(() => {
    const loadAssets = async () => {
      const loaded = await preloadImages();
      setAssetsLoaded(loaded);
      if (loaded) {
        setScreenIsReady(true);
      }
    };
    loadAssets();
    resetAudio();
  }, []);

  const handleLinerNoteTrackSelect = async (selectedTrack: Track) => {
    try {
      // Ensure the queue is populated if empty
      const currentQueue = await TrackPlayer.getQueue();
      if (currentQueue.length === 0) {
        await TrackPlayer.add(selectedTrack as any);
      }
  
      // Find the index of the selected track in the queue
      const trackIndex = linerNoteArticles.findIndex((track: any) => track.url === selectedTrack.url);
  
      // Validate the track
      if (trackIndex === -1 || !selectedTrack?.url) {
        console.log("Invalid track selection:", selectedTrack);
        return;
      }
  
      // Play the track directly
      await TrackPlayer.skip(trackIndex);
      console.log("\n\n\n\n\n-------------about to play track")
      await TrackPlayer.play();
  
      console.log(`Now playing: ${selectedTrack.title}`);
    } catch (error) {
      console.error("Error playing track:", error);
    }
  };

  const handlePlayLineNote = async () => {

    if (setStartPlayingLinerNote) {
        await handleLinerNoteTrackSelect(homepageArticle)
        setTimeout(() => {
          setStateAsync(setStartPlayingLinerNote, false, 'backendData');
        }, 100)
     }

  }

  useEffect(() => {
    
      if (startPlayingLinerNote === true) {{
        handlePlayLineNote()
      }}

  }, [startPlayingLinerNote])

  //   
  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation  

  return (
    <>


      <LotusHeader backgroundColor={colors.readioBrown} />
      <View style={styles.container}>

        <ScrollView 
          refreshControl={
            <RefreshControl 
              tintColor={colors.readioWhite} 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
            />
          } 
          style={styles.fullScrollView} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.fullWidth}>
            {/* NOTE AD CAROUSEL */}
            <Animated.ScrollView 
              entering={FadeInUp.duration(200)} 
              exiting={FadeOutDown.duration(200)} 
              showsHorizontalScrollIndicator={false} 
              horizontal 
              style={styles.carouselContainer}
            >
              {[1, 2, 3].map((item, index) => (
                <View key={index} style={styles.carouselItem}>
                  <FastImage
                    source={{ uri: getLocalImageUri('whiteLogo') }}
                    style={styles.logoImage}
                    resizeMode='contain'
                  />
                </View>
              ))}
              <View style={styles.carouselEndSpacer} />
            </Animated.ScrollView>

            <View style={styles.divider} />

            {/* NOTE FEATURED ARTICLE */}
            <View>
              <View style={styles.featuredHeaderContainer}>
                <Text allowFontScaling={false} style={[styles.announcmentBigText, { opacity: 0.5 }]}>Featured Lotus Liner Note</Text>
                <Text allowFontScaling={false} style={[styles.announcmentBigText, { fontSize: 25 }]}>{homepageArticle?.title?.trim()}</Text>
                <Text allowFontScaling={false} style={[styles.announcmentSmallText, { opacity: 0.5 }]}>Check out this article and more!</Text>
              </View>

              <Animated.View 
                entering={FadeInDown.duration(200)} 
                exiting={FadeOutDown.duration(200)} 
                style={styles.featuredArticleContainer}
              >
                <Pressable onPress={handleGoToLinerNotes} style={styles.articlePressable}>
                  <FastImage source={{ uri: homepageArticle?.image }} resizeMode='cover' style={styles.articleImage} />
                  <FastImage
                    source={{ uri: getLocalImageUri('filter') }}
                    resizeMode='center' 
                    style={styles.filterImage}
                  />

                  <View style={styles.articleDescriptionContainer}>
                    <Text allowFontScaling={false} style={styles.announcmentSmallText}>
                      Lotus Liner Notes is our featured smart audio article series rubricated by Stic of dead prez for instant insights and inspiration.
                    </Text>
                  </View>
                  <Pressable onPress={handleGoToLinerNotes} style={styles.listenButton}>
                    <Text allowFontScaling={false} style={[styles.announcmentBigText, { color: colors.readioWhite }]}>Listen</Text>
                    <FontAwesome name="chevron-right" style={styles.chevronIcon} />
                  </Pressable>
                </Pressable>
              </Animated.View>
            </View>

            {/* <View style={styles.smallGap} /> */}
            <View style={styles.divider} />

            {/* NOTE CREATE A ARTICLE */}
            <Pressable onPress={() => setIsArticleModalVisible(true)} style={styles.createArticleButton}>
              <Text allowFontScaling={false} style={styles.announcmentBigText}>Create your own article</Text>
              <FontAwesome name="chevron-down" style={styles.createArticleChevron} />
            </Pressable>
          </View>

          <LotusGap backgroundColor={colors.readioBrown}  gapNumber={floatingPlayerIsVisible ? 280 : 230} />
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
    alignItems: 'center',
    backgroundColor: colors.readioBrown,
    width: "100%",
    justifyContent: "space-between",
  },
  fullScrollView: {
    height: "100%",
    width: "100%"
  },
  fullWidth: {
    width: "100%",
    paddingTop: 20,
  },
  carouselContainer: {
    width: "100%",
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    // marginBottom: 20,
    overflow: "hidden"
  },
  carouselItem: {
    width: 300,
    height: 300,
    marginRight: 10,
    backgroundColor: colors.readioBlack,
    borderRadius: 10,
  },
  logoImage: {
    width: 30,
    height: 30,
    alignSelf: 'flex-end',
    position: 'absolute',
    right: 20,
    top: 5
  },
  carouselEndSpacer: {
    width: 30,
    height: 300
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: `${colors.readioWhite}50`,
    marginVertical: 20
  },
  featuredHeaderContainer: {
    width: "90%",
    alignSelf: "center",
    // marginTop: 10
  },
  featuredArticleContainer: {
    width: "90%",
    alignSelf: "center",
    paddingVertical: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 18.84,
    elevation: 5
  },
  articlePressable: {
    display: "flex",
    height: 220,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  articleImage: {
    position: 'absolute',
    zIndex: -2,
    borderRadius: 10,
    width: "100%",
    height: "100%"
  },
  filterImage: {
    position: 'absolute',
    borderRadius: 10,
    zIndex: -2,
    width: "100%",
    height: "100%",
    opacity: 0.4
  },
  articleDescriptionContainer: {
    display: "flex",
    padding: 10,
    backgroundColor: `${colors.readioBlack}50`,
    borderRadius: 10,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 10,
    width: "95%",
    flexDirection: "column"
  },
  listenButton: {
    top: 10,
    position: "absolute",
    right: 10,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: `${colors.readioBlack}50`,
    borderRadius: 10,
    padding: 8,
  },
  chevronIcon: {
    color: colors.readioWhite,
    fontWeight: "bold",
    fontSize: 15
  },
  smallGap: {
    height: 10
  },
  createArticleButton: {
    width: "60%",
    alignSelf: "center",
    display: 'flex',
    flexDirection: "column",
    alignItems: "center",
    gap: 15
  },
  createArticleChevron: {
    color: colors.readioWhite,
    fontWeight: "bold",
    fontSize: 20
  },
  announcmentBigText: {
    fontSize: 18,
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
  },
  announcmentSmallText: {
    color: colors.readioWhite,
    fontFamily: readioRegularFont
  },
});