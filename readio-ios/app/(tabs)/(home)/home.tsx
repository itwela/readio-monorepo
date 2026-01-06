import LotusGap from "@/components/LotusGap";
import { LotusPageDisplayName } from "@/components/LotusPageDisplayName";
import { getLocalImageUri, ImageAssets } from "@/constants/imageAssets";
import { SoundAssets } from "@/constants/soundAssets";
import { colors, giantFont, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { setStateAsync } from "@/constants/utilityFunctions";
import { useLotusModal } from "@/helpers/providers/lotusModalContext";
import { useLotusNotifications } from "@/helpers/providers/LotusNotificationProvider";
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { useLotusUtils } from "@/helpers/providers/lotusUtilsContext";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { LotusArticle, RootNavigationProp } from '@/types/type';
import { useNavigation } from "@react-navigation/native";
import * as Notifications from 'expo-notifications';
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import LotusAppMapModal from '@/components/LotusAppMapModal';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import TrackPlayer, { Track } from "react-native-track-player";
import { VideoView, useVideoPlayer } from 'expo-video';
import { ResizeMode } from 'expo-av';
import Animated, { useSharedValue, FadeIn, FadeInDown, FadeOut, FadeInUp, FadeOutDown, useAnimatedReaction, useAnimatedStyle, withTiming, FadeOutUp } from "react-native-reanimated";
import { LinearGradient } from 'expo-linear-gradient';
import LotusHomeChangingContent from "@/components/LotusHomeChangingContent";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useLotusHaptic } from "@/helpers/providers/lotusHapticProvider";
import LotusImageWithLoader from "@/components/LotusImageWithLoader";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import Purchases, { CustomerInfo, PurchasesError, PurchasesPackage } from "react-native-purchases";
import sql from "@/helpers/neonClient"; // Import the SQL helper
import { ScrollView, RefreshControl } from "react-native"; // Import ScrollView and RefreshControl
import { useRevenueCat } from "@/helpers/providers/RevenueCatProvider";
import { useUpdateError } from '@/helpers/providers/UpdateErrorContext';

// Define a local interface for the expected structure of the paywall result
interface RichPaywallResult {
  paywallResult: PAYWALL_RESULT;
  customerInfo?: CustomerInfo; // Optional, as it might not always be present
  productIdentifier?: string;  // Optional
  errorString?: string;        // Optional, for error cases
}

export default function HomeTabOne() {

  return (
    <>
      <HomeScreen />
    </>
  );
}

function HomeScreen() {
  const { updateError } = useUpdateError(); // Get the error from context
  // 
  const { startPlayingLinerNote, setStartPlayingLinerNote, setNeedsToRefresh, linerNoteArticles, homepageArticle } = useLotusUser()
  const { subscribeToLotus, debugLogAllRevenueCatProductIdentifiers } = useRevenueCat();
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const { user } = useLotusUser()
  // 
  const { clearLastActiveTrack } = useLastActiveTrack()
  const { floatingPlayerIsVisible, setCurrentRouteName } = useLotusUtils()
  const { isArticleModalVisible, setIsArticleModalVisible } = useLotusModal()
  const [screenIsReady, setScreenIsReady] = useState(false)
  const [refreshing, setRefreshing] = useState(false); // For refresh control
  const navigation = useNavigation<RootNavigationProp>();
  const { scheduleNotification, scheduleTimeSensitiveNotification } = useLotusNotifications(); // Add notification hook
  const { debugNotificationWasCLicked } = useLotusNotifications()
  const { lightFeedback } = useLotusHaptic();
  const { waterInspirationalQuote, showWaterInspirationalQuote } = useLotusNotifications();
  const { userIsOnStarterPlan, userIsAdmin, userIsOnPremiumPlan } = useLotusUser();
  const [showAppMap, setShowAppMap] = useState(false);

  // NOTE 🟩 - Is the user a paying customer
  const isUserAPayedSubscriber = user?.subscription_plan !== 'blank';
  // 
  const resetAudio = () => {
    TrackPlayer.pause();
    // console.log("Tp is paused ,")
    TrackPlayer.reset();
    // console.log("Tp is reset ,")
    clearLastActiveTrack();
  }
  //  GOES TO LINER NOTES PAGE
  const handleGoToLinerNotes = async () => {
    if (setStartPlayingLinerNote) {
      // TrackPlayer.reset()
      await setStateAsync(setStartPlayingLinerNote, true)
      router.push('/(tabs)/(library)/audioLiterature')
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
      const trackIndex = linerNoteArticles?.findIndex((track: any) => track.url === selectedTrack.url);

      // Validate the track
      if (trackIndex === -1 || !selectedTrack?.url) {
        // console.log("Invalid track selection:", selectedTrack);
        return;
      }

      // Play the track directly
      await TrackPlayer.skip(trackIndex as number);
      // console.log("\n\n\n\n\n-------------about to play track")
      await TrackPlayer.play();

      // console.log(`Now playing: ${selectedTrack.title}`);
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

    if (startPlayingLinerNote === true) {
      {
        handlePlayLineNote()
      }
    }

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
  // 
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
  // REVIEW -----NOTI TEST
  // Test notification function
  const handleTestNotification = async () => {

    // console.log("Test notification starting....");
    const trigger = { seconds: 1 }; // Trigger after 1 second for demo purposes
    try {
      await scheduleTimeSensitiveNotification(
        "Test Notification",
        "This is a test notification from Lotus!",
        trigger,
        { type: "test" },
        SoundAssets.waterSound.name // Use the water sound for testing
      );
    } catch (error) {
      // console.log("Test notification failed....");
    }
    // try {
    //   console.log("Test notification scheduled");
    // } catch (error) {
    //   console.error("Error scheduling test notification:", error);
    // }
  };
  // old components
  const FeaturedArticle = ({ data }: { data: any }) => {
    return (
      <>
        <View style={styles.carouselItem}>

          <Image source={{ uri: getLocalImageUri('filter') }} resizeMode='stretch' style={styles.filterImage} />
          <Image source={{ uri: data?.articleImage }} resizeMode='cover' style={styles.articleImage} />

          <View style={{ width: '100%', display: 'flex', padding: 5, paddingHorizontal: 10, backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', alignItems: 'center' }}>

            <Pressable style={styles.adminFeaturedButton}>
              <Text allowFontScaling={false} style={styles.adminButtonText}>{data.headline}</Text>
            </Pressable>

            <Image source={{ uri: getLocalImageUri('whiteLogo') }} style={styles.logoImage} resizeMode='contain' />

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
  // 
  const FeaturedPromotion = ({ data }: { data: any }) => {
    return (
      <>
        <View style={styles.carouselItem}>


        </View>
      </>
    )
  }
  // 
  const NewStuffScrollable = () => {
    return (
      <>
        <LotusGap backgroundColor={'transparent'} gapNumber={15} />
        <Animated.ScrollView
          entering={FadeInUp.duration(200)}
          exiting={FadeOutDown.duration(200)}
          showsHorizontalScrollIndicator={false}
          horizontal
          style={[styles.carouselContainer, { paddingTop: 5, }]}
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
    )
  }
  // 
  const handleGetStartedPress = async () => {
    lightFeedback();
    setShowAppMap(true);
  }

  // const videoPlayer = useVideoPlayer(ImageAssets.aliVideo, player => {
  //   player.muted = true;
  //   player.loop = true;
  //   player.play();
  //   player.staysActiveInBackground = false;
  // });

  return (
    <>
      {/* Display error at the top if it exists */}
      {/* {updateError && (
        <View style={{
          backgroundColor: '#8B0000', // Dark red
          padding: 10,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
          position: 'absolute', // Or relative depending on layout needs
          top: 80, // Adjust if you have a custom header
          zIndex: 9999, // Ensure it's on top
          width: '60%',
        }}>
          <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>
            {updateError}
          </Text>
        </View>
      )} */}

      <LinearGradient
        colors={[colors.readioBrown, 'transparent']}
        style={{
          zIndex: -1,
          position: 'absolute',
          width: '100%',
          height: '80%',
          opacity: 0.618
        }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Animated.View style={{ zIndex: -2, opacity: 1, position: 'absolute', width: '100%', height: '100%', }} entering={FadeIn.duration(600)} exiting={FadeOut.duration(600)}>

        {/* NOTE - HOME GIF ASSET */}
        <LotusImageWithLoader
          source={{
            // uri: getLocalImageUri("manDrinkWater"),
            uri: getLocalImageUri("sticMeditating"),
          }}
          style={{ zIndex: -3, position: 'absolute', width: '100%', height: '100%', backgroundColor: colors.readioBrown }}
          resizeMode="cover"
        />

        {/* NOTE - ARCHIVED HOME VIDEO ASSET */}
        {/* <VideoView
          player={videoPlayer}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: -80,
            // zIndex: 10,
            backgroundColor: 'transparent',
            transform: [{ scale: 1 }]
          }}
        /> */}
      </Animated.View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }} // Ensures content can grow to fill screen if needed
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.readioWhite} // Optional: for iOS spinner color
            colors={[colors.readioOrange, colors.readioWhite]} // Optional: for Android spinner colors
            progressBackgroundColor={colors.readioBlack} // Optional: for Android spinner background
          />
        }
      >
        <View style={[styles.container, { backgroundColor: 'transparent', justifyContent: 'space-between' }]}>

          <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 5, backgroundColor: 'transparent', width: '80%' }}>

            {showWaterInspirationalQuote && (
              <>
                <IconSymbol
                  name="drop.fill"
                  size={20}
                  color={colors.readioWhite}
                />
                <Text allowFontScaling={false} style={[styles.announcmentSmallText, { fontSize: 18, textAlign: 'center', color: colors.readioWhite }]}>
                  {`'${waterInspirationalQuote}'`}
                </Text>
              </>
            )}

            {/* test notification button */}
            {/* <Pressable onPress={handleTestNotification} style={styles.notificationButton}>
              <Text allowFontScaling={false} style={styles.notificationButtonText}>Test Notification</Text>
            </Pressable> */}
          </View>

          {/* NOTE LOTUS ALWAYS AND THEN MOVING TEXT */}
          <View style={{ alignItems: 'center', flexDirection: 'column' , paddingTop: 230 }}>

              <LotusGap backgroundColor='transparent' gapNumber={50} />

            <LotusImageWithLoader
              useSpinnerLoader
              loaderSize="small"
              source={ImageAssets.goldLogo}
              style={{ width: 150, height: 150, margin: 0, padding: 0, backgroundColor: 'transparent', transform: [{ translateY: 15 }] }}
              resizeMode='contain'
            />
            <Text allowFontScaling={false} style={[styles.announcmentBigText, { fontSize: 75, textAlign: 'center', color: colors.readioWhite, }]}>
            LOTUS
            </Text>
            <Text allowFontScaling={false} style={[styles.announcmentBigText, { fontSize: 30, textAlign: 'center', color: colors.readioGold, lineHeight: 30 }]}>
              Always Growing
            </Text>
            <LotusGap backgroundColor='transparent' gapNumber={10} />
            <Pressable onPress={() => handleGetStartedPress()} style={{ backgroundColor: `${colors.readioBlack}99`, padding: 10, paddingHorizontal: 20, borderRadius: 50, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', alignItems: 'center', gap: 5 }}>
              <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 18, fontWeight: 'bold' }}>Tap In</Text>
              {/* <IconSymbol name='chevron.forward' size={20} color={colors.readioWhite} /> */}
            </Pressable>

           
            <LotusGap backgroundColor='transparent' gapNumber={100} />
          </View>

          {/* NOTE GETTING STARTED CONTAINER */}
          {/* <View>

            <LotusGap backgroundColor='transparent' gapNumber={30} />

          </View> */}


        </View>


      </ScrollView>

      <LinearGradient
        colors={[
          '#272121',
          '#272121',
          '#27212180',  // Semi-transparent version of #272121 (50% opacity)
          'transparent',
          'transparent',
          'transparent',
          'transparent',
        ]}
        style={{
          zIndex: -1,
          bottom: '0%',
          position: 'absolute',
          width: '150%',
          height: 1000,
          transform: [{ rotate: '-180deg' }]
        }}
        start={{ x: 0.5, y: -0.06 }}
        end={{ x: 0.5, y: 1.3 }}
      />

      <LotusAppMapModal
        visible={showAppMap}
        onClose={() => setShowAppMap(false)}
      />

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'center',

    width: "100%",
    height: '75%',
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    marginTop: 120,
  },
  bettertittle: {
    fontSize: 35,
    fontWeight: 'bold',
    fontFamily: giantFont,
    color: colors.readioWhite,
    paddingHorizontal: 20,
  },
  smallertext: {
    fontSize: 15, // Example size, adjust as needed
    color: `${colors.readioWhite}`, // Use themed color
    textAlign: 'center',
    fontFamily: readioRegularFont, // Use themed font
    // Add other default text styles
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
  notificationButton: {
    backgroundColor: colors.readioOrange,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  notificationButtonText: {
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
    fontSize: 16,
  },
});
