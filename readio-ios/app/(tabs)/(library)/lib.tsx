import LotusGap from '@/components/LotusGap';
import { LotusMenuOption } from '@/components/LotusMenuOption';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';
import { getLocalImageUri, ImageAssets } from '@/constants/imageAssets';
import { colors, giantFont, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { useLotusTabBar } from '@/helpers/providers/lotusTabBarProvider';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { useLastActiveTrack } from '@/hooks/useLastActiveTrack';
import { LotusArticle } from '@/types/type';
import { Href, router } from 'expo-router';
import React, { useCallback } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { shortLengthArticle_Name, shortLengthArticle_Name_DB, shortLengthArticle_Name_NormalCase } from '@/constants/tokens';
import LotusImageWithLoader from '@/components/LotusImageWithLoader';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';
import { useLotusAudiobook } from '@/helpers/providers/lotusAudiobookProvider';
import { LotusUpgradeBlur } from '@/components/LotusUpgradeBlur';
import { createArticleIllustration_Replicate, createArticleWithAi } from '@/handleArticleGenerations/generationUtilities';

export default function SignedInLib() {

  const { userArticles, refreshUserData } = useLotusUser()
  // const [articleGenerationStatus, setArticleGenerationStatus] = useState('')
  const {setLinerNoteTopic, setArticleSelectedId, floatingPlayerIsVisible, setCurrentRouteName } = useLotusUtils()
  const { handleScroll, setIsTabBarVisible } = useLotusTabBar()
  const { user } = useLotusUser()
  const isUserPremium = user?.subscription_plan === 'premium' || user?.user_role === 'admin';
  const {lightFeedback, mediumFeedback} = useLotusHaptic();
  const { userIsNotSubscribed, userIsOnStarterPlan, userIsAdmin, userIsOnPremiumPlan, setNeedsToRefresh } = useLotusUser();

  // Get the most recent articles (first 6) from userArticles
  const mostRecentUserArticles = userArticles?.slice(0, 6) || [];

  const handleGoToSelectedReadio = (readioId: string, name: string) => {

    lightFeedback();

    setArticleSelectedId?.(readioId as any)
    // console.log('handleGoToSelectedReadio', readioId)
    // console.log('handleGoToSelectedReadio', name)
    router.push(`/(tabs)/(library)/${readioId}` as Href)
  }

  const handleGoToLinerNotes = async () => {
    TrackPlayer.reset()
    setLinerNoteTopic?.("Lotus Liner Notes")
    router.push('/(tabs)/(library)/audioLiterature')
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

  const subscribeToLotus = async () => {


    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({
      displayCloseButton: false, 
    });

    // console.log('paywallResult', paywallResult)
    
    switch (paywallResult) { 
      case PAYWALL_RESULT.NOT_PRESENTED:
      case PAYWALL_RESULT.ERROR:
      case PAYWALL_RESULT.CANCELLED:
        return false;
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        // TODO: ADD A SMALL THANK YOU MODAL THAT SHOWS UP ONCE THEY SUBSCRIBE.
        // WHY? I NEED OT REFRESH THE APP RELIABLY. ADDING THIS AN DA SMALL BUTTON OR SOMETHING FOR USERS TO DISMISS THE MESSAGE CAN ALLOW FOR THE APP TO REFRESH
        // - THIS IS WHERE I WILL ADD BABAS'S IMAGE AS WELL :D
        return true;
      default:
        return false;
    }

  }
  
  const [refreshing, setRefreshing] = React.useState(false); // For refresh control
  const onRefresh = () => {
    setRefreshing(true);
    setNeedsToRefresh?.(true)
    // checkSignInStatus()

    // Add any refresh logic here, such as resetting state or re-fetching data
    // With Convex, the data will automatically refresh when the query updates
    setTimeout(() => {
      setRefreshing(false);
      setNeedsToRefresh?.(false)
    }, 1000); // Simulate an async operation
  };

return (
  <>
    <View style={styles.container}>
      <FlatList
        data={sections}
        renderItem={({ item }: { item: Section }) => {
          switch (item.type) {
            case 'display-name':
              return (
                <>
                  <LotusPageDisplayName title="LIBRARY" />
                {/* <TouchableOpacity onPress={() => createArticleWithAi('a ladybug in a rocky cave', 'ladybug adventures')}>
                </TouchableOpacity> */}
                </>
              );
            case 'menu':
              return (
                <>
                <View style={{
                  paddingTop: 5,
                  backgroundColor: "transparent",
                  paddingHorizontal: 20,
                }}>
                  
                  {user?.user_role !== 'admin' && (
                    <>     
                  <LotusUpgradeBlur intensity={0} show={userIsNotSubscribed as boolean}>
                      <LotusMenuOption title="My Articles" route="/my-articles" />
                  </LotusUpgradeBlur>
                  <LotusUpgradeBlur intensity={0} show={userIsNotSubscribed as boolean}>
                    <LotusMenuOption title="My Playlists" route="/(tabs)/(library)/(myplaylist)" />
                  </LotusUpgradeBlur>
                    </>
                  )}

                  {user?.user_role === 'admin' && (
                    <>
                    <LotusMenuOption title="My Articles" route="/my-articles" />
                    <LotusMenuOption title="My Playlists" route="/(tabs)/(library)/(myplaylist)" />
                    </>
                  )}

                  {/* <LotusMenuOption title="Interests" route="/(tabs)/(library)/(myplaylist)/interests" /> */}
                  <LotusMenuOption title={shortLengthArticle_Name_NormalCase} onPress={handleGoToLinerNotes} />
                  {/* TODO */}
                  {/* {!isUserPremium && <LotusMenuOption title="Audio Books" onPress={() => {subscribeToLotus()}} premium />}
                  {isUserPremium && <LotusMenuOption title="Audio Books" route='/audiobooks' />} */}
                  <View style={styles.divider} />
                </View>
                  </>
              );
            case 'articles':
              return (
                <>
                {item.data && item.data.length > 0 && (
                  <>
                  <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.title}>My Recent Articles</Animated.Text>
                  <LotusGap backgroundColor={colors.readioBrown} gapNumber={15} />
                  <View style={styles.recentlySavedContainer}>
                      <>
                        {item.data.map((article: any, index: number) => (
                          <TouchableOpacity 
                            activeOpacity={0.9} 
                            onPress={() => handleGoToSelectedReadio(article?._id as string, article?.title as string)} 
                            key={article._id} 
                            style={styles.recentlySavedItems}
                          >
                            <Animated.View style={{gap: 10}} entering={FadeInUp.duration(300 + (index * 100))} exiting={FadeOutDown.duration(100)}>
                              <View style={styles.recentlySavedImg}>
                                <LotusImageWithLoader source={{ uri: getLocalImageUri('filter') }} style={[styles.nowPlayingImage, { zIndex: 1, opacity: 0.4 }]} resizeMode='cover' />
                                <LotusImageWithLoader source={{ uri: article.artwork ? article.artwork : getLocalImageUri('unknownArticle') }} style={styles.nowPlayingImage} resizeMode='cover' />
                              </View>
                              <View style={{display: 'flex', flexDirection: 'column', height: 58, justifyContent: 'flex-start'}}>
                                <Text allowFontScaling={false} numberOfLines={2} style={styles.recentlySavedTItle}>{article.title}</Text>
                                <Text allowFontScaling={false} numberOfLines={1} style={[styles.recentlySavedSubheading, {opacity: 0.6}]}>{article.topic}</Text>
                              </View>
                            </Animated.View>
                          </TouchableOpacity>
                        ))}
                      </>
                  </View>
                  </>
                )}

                {item.data && item.data.length === 0 && (
                  <>
                  <View style={{paddingHorizontal: 10, opacity: 0.5,  height: '58%', justifyContent: 'center'}}>
                    <LotusImageWithLoader useSpinnerLoader loaderSize='small' source={ImageAssets.whiteLogo} style={{width: 100, height: 100, alignSelf: 'center'}} resizeMode='contain' />
                    <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={[styles.title, {textAlign: 'center'}]}>{`You haven't created or \n saved any articles yet.`}</Animated.Text>
                    <LotusGap backgroundColor={colors.readioBrown} gapNumber={15} />
                    <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={[styles.title, {textAlign: 'center'}]}>Start by pressing the plus, or heading over to "My Playlists."</Animated.Text>
                  </View>
                  </>
                )}

                  <View style={[styles.divider, {opacity: 0}]} />
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
      {/* </ScrollView> */}
    </View>
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
    marginTop: 100,
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
    fontSize: 35,
    fontWeight: 'bold',
    fontFamily: giantFont,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: readioBoldFont
  },
  recentlySavedSubheading: {
    fontSize: 14,
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