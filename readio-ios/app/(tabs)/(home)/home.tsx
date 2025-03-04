import { LotusArticleModal } from "@/components/LotusArticleModal";
import LotusGap from "@/components/LotusGap";
import LotusHeader from "@/components/LotusHeader";
import { getLocalImageUri } from "@/constants/imageAssets";
import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { setStateAsync } from "@/constants/utilityFunctions";
import { useLotusModal } from "@/helpers/providers/lotusModalContext";
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { useLotusUtils } from "@/helpers/providers/lotusUtilsContext";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { LotusArticle, RootNavigationProp } from '@/types/type';
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES, useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import TrackPlayer, { Track } from "react-native-track-player";

export default function HomeTabOne() {

  return (
    <>
      <SignedInHomeTabOne />
    </>
  );
}

function SignedInHomeTabOne() {

  const { startPlayingLinerNote, setStartPlayingLinerNote, setNeedsToRefresh, linerNoteArticles, homepageArticle, } = useLotusUser()
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const { clearLastActiveTrack } = useLastActiveTrack()
  const {floatingPlayerIsVisible, setCurrentRouteName } = useLotusUtils()
  const { isArticleModalVisible, setIsArticleModalVisible } = useLotusModal()
  const [screenIsReady, setScreenIsReady] = useState(false)
  const [refreshing, setRefreshing] = useState(false); // For refresh control
  const navigation = useNavigation<RootNavigationProp>();

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
  // useEffect(() => {
  //   const silenceAudio = async () => {
  //     resetAudio();
  //   };
  //   silenceAudio();
  // }, []);
  
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
  // 
  const handlePlayLineNote = async () => {

    if (setStartPlayingLinerNote) {
        await handleLinerNoteTrackSelect(homepageArticle)
        setTimeout(() => {
          setStateAsync(setStartPlayingLinerNote, false, 'backendData');
        }, 100)
     }

  }
  // 
  useEffect(() => {
    
      if (startPlayingLinerNote === true) {{
        handlePlayLineNote()
      }}

  }, [startPlayingLinerNote])
  //   

  const featuredSectionData = [
    {
      type: 'article',
      headline: 'Featured Lotus Liner Note',
      imageTextOverlay: 'Lotus Liner Notes is our featured smart audio article series rubricated by Stic of dead prez for instant insights and inspiration.',
      articleName: homepageArticle?.title?.trim(),
      articleImage: homepageArticle?.image,
      function: handleGoToLinerNotes,
    },
    {
      type: 'promotion',
      headline: 'Featured Lotus Liner Note',
      imageTextOverlay: 'Lotus Liner Notes is our featured smart audio article series rubricated by Stic of dead prez for instant insights and inspiration.',
      articleName: homepageArticle?.title?.trim(),
      articleImage: homepageArticle?.image,
      function: handleGoToLinerNotes,
    },
  ]

  const FeaturedArticle = ({ data }: { data: any }) => {
    return (
      <>
        <View style={styles.carouselItem}>

          <Image source={{ uri: getLocalImageUri('filter') }} resizeMode='stretch' style={styles.filterImage}/>
          <Image source={{ uri: data?.articleImage }} resizeMode='cover' style={styles.articleImage} />

          <View style={{ width: '100%', display: 'flex', padding: 5, paddingHorizontal: 10, backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', alignItems: 'center' }}>

            <Pressable style={styles.adminFeaturedButton}>
              <Text allowFontScaling={false} style={styles.adminButtonText}>{data.headline}</Text>
            </Pressable>

            <Image source={{ uri: getLocalImageUri('whiteLogo') }} style={styles.logoImage} resizeMode='contain'/>

          </View>

          <View style={styles.articleDescriptionContainer}>
            <Text allowFontScaling={false} style={styles.announcmentSmallText}>
              {data?.imageTextOverlay}
            </Text>
          </View>

        </View>
      </>
    )
  }

  const FeaturedPromotion = ({ data }: { data: any }) => {
    return (
      <>
        <View style={styles.carouselItem}>


        </View>
      </>
    )
  }

  interface Section {
    id: string;
    type: 'display-name' | 'new';
    data?: LotusArticle[];
  }

  // Create sections for the FlatList with explicit typing
  const sections: Section[] = [
    { id: 'display-name', type: 'display-name' },
    { id: 'new', type: 'new' },
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
                  <>
                  <Animated.Text
                    entering={FadeInUp.duration(300)}
                    exiting={FadeOutDown.duration(100)}
                    allowFontScaling={false}
                    style={[styles.bettertittle, {paddingTop: 30}]}
                    >
                    Home
                  </Animated.Text>
                  </>
                );
              case 'new':
                return (
                  <>
                    <LotusGap backgroundColor={colors.readioBrown} gapNumber={15} />
                    <Animated.ScrollView
                      entering={FadeInUp.duration(200)}
                      exiting={FadeOutDown.duration(200)}
                      showsHorizontalScrollIndicator={false}
                      horizontal
                      style={[styles.carouselContainer, { paddingTop: 5,}]}
                    >
                      {featuredSectionData.map((item, index) => (
                        <Pressable key={index} onPress={item.function}>

                          {item.type === 'article' && (
                            <FeaturedArticle data={item} />
                          )}
                         
                          {item.type === 'promotion' && (
                            <FeaturedPromotion data={item} />
                          )}

                        </Pressable>
                      ))}
                      <View style={styles.carouselEndSpacer} />
                    </Animated.ScrollView>

                    <View style={styles.divider} />
                  </>
                );
              default:
                return null;
            }
          }}
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
  bettertittle: {
    fontSize: 45,
    fontWeight: 'bold',
    fontFamily: readioBoldFont,
    color: colors.readioWhite,
    paddingHorizontal: 20,
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
    zIndex: -1,
    width: "100%",
    height: "100%",
    opacity: 0.6
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
  adminFeaturedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.readioOrange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    borderColor: colors.readioOrange,
  },
  adminButtonText: {
    color: colors.readioDustyWhite,
    fontSize: 14,
    fontWeight: '600',
  },
});