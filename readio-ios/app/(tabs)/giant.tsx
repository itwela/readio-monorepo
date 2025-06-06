import LotusGap from "@/components/LotusGap";
import { ReadioTracksList } from "@/components/ReadioTrackList";
import { getLocalImageUri } from "@/constants/imageAssets";
import { buttonStyle, colors, giantFont, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { generateTracksListId } from "@/helpers/misc";
import { useLotusGiantSteps } from "@/helpers/providers/lotusGiantStepsProvider";
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { LotusStepCounter } from "../../components/LotusStepsCounter";
import { LotusStepsContainer } from "@/components/LotusStepsContainer";
import { RootNavigationProp } from "@/types/type";
import { getFocusedRouteNameFromRoute, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import LotusImageWithLoader from "@/components/LotusImageWithLoader";
import { useLotusHaptic } from "@/helpers/providers/lotusHapticProvider";
import { utilsStyles } from "@/styles";
import { useRevenueCat } from "@/helpers/providers/RevenueCatProvider";
import sql from '@/helpers/neonClient';


export default function GiantScreen() {
  const { 
    selection, 
    search, setSearch,
    handleClearSearch,
    handleStartWalk,
    numberToDigits,
    totalStepsFromQuery,
  } = useLotusGiantSteps();
  const navigation = useNavigation<RootNavigationProp>();
  const { userArticles } = useLotusUser();
  
  // 🎯 SIMPLIFIED: Let ReadioTracksList handle all filtering - just like everywhere else
  // Don't pre-filter here, just pass raw tracks and search term to ReadioTracksList
  console.log('🔍 Giant search debug:', {
    search,
    userArticlesCount: userArticles?.length,
    searchActive: search.length > 0,
  });
  
  const { successFeedback, mediumFeedback, stepMilestone} = useLotusHaptic();
  const { userIsSubscribed, userIsOnStarterPlan, userIsAdmin, userIsOnPremiumPlan } = useLotusUser();
 const {subscribeToLotus} = useRevenueCat();

  return (
    <>
    {/* NOTE - GIANT STEPS GIF ASSET */}
      <LotusImageWithLoader
        source={{
          uri: getLocalImageUri("walkingGif"),
        }}
        style={{ zIndex: -2, position: 'absolute', width: '100%', height: '60%', backgroundColor: colors.readioBrown }}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[colors.readioBrown, 'transparent']}
        style={{
          zIndex: -1,
          bottom: '60%',
          position: 'absolute',
          width: '150%',
          height: 450,
          transform: [{ rotate: '-180deg' }],
        }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={{ width: "100%", minHeight: "600%", zIndex: -3, position: "absolute", backgroundColor: colors.readioBrown }} />
      {selection ? (
        <>
          <SafeAreaView style={[styles.safeAreaContainer]}>
            <Animated.View style={styles.container}>
              
              {/* STUB */}
              <StartedWalking
                tracks={userArticles}
                search={search}
                setSearch={setSearch}
                handleClearSearch={handleClearSearch}
              />

            </Animated.View>
          </SafeAreaView>
        </>
      ) : (
        <>
          <SafeAreaView style={{ width: '100%', justifyContent: "space-between", height: '100%', alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 2}}>

            {/* NOTE REVIEW COUNTER */}
            <View style={{ paddingTop: 40}}>
              
                <LotusImageWithLoader useSpinnerLoader loaderSize="small" source={{ uri: getLocalImageUri('whiteLogo') }} style={{  width: 60, height: 60, alignSelf: "center", backgroundColor: "transparent" }} resizeMode="contain" />
                <Text allowFontScaling={false} style={[styles.link, { textAlign: 'center', fontSize: 18 }]}>Lotus</Text>
                <Text allowFontScaling={false} style={[styles.text, { fontFamily: giantFont, fontSize: 35 }]}>GIANT STEPS</Text>

                {/* NOTE : This is the step counter */}
                <View style={[{ display: 'flex', overflow: 'hidden', flexDirection: 'row', gap: 8, justifyContent: 'space-between', marginVertical: 15, paddingHorizontal: 20 }]}>
                  {numberToDigits((totalStepsFromQuery || 0) as number).map((digit: string, index: number) => {
                    return (
                      <View key={index} style={{ borderRadius: 3, borderTopLeftRadius: 10, borderTopRightRadius: 10, opacity: 0.8, width: 32, height: 60, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.readioWhite }}>
                        <Animated.Text allowFontScaling={false} style={[{ color: colors.readioWhite, fontSize: 30, fontFamily: readioBoldFont, fontWeight: 'bold' }]}>
                          {digit}
                        </Animated.Text>
                      </View>
                    );
                  })}
                </View>

                <Text allowFontScaling={false} style={[styles.link, { textAlign: 'center', opacity: 0.5, fontSize: 18 }]}>Every Step Counts.</Text>
                
                <View style={{ width: "100%", backgroundColor: 'transparent', padding: 20, alignItems: 'center' }}>
                
                  <Text allowFontScaling={false} style={[styles.link, { fontSize: 18, textAlign: 'center', marginBottom: 10 }]}>
                    The Giant Steps Campaign is our collective journey to clock 100 million steps, one step at a time.
                  </Text>
                  <Text allowFontScaling={false} style={[styles.link, { fontSize: 18, textAlign: 'center', marginBottom: 20 }]}>
                    Start tracking your steps below to unlock surprises, prizes and access to exclusive rewards.
                  </Text>

                  <LotusGap backgroundColor="transparent" gapNumber={80}/>
              
                </View>


            </View>

            <View style={{paddingHorizontal: 20, alignSelf: 'center', position: 'absolute', bottom: 150, width: '100%'}}>
              
                          {/* FIXME , THIS IS TO TEST THE MODAL */}
            {/* <Pressable
                  onPress={() => {
                    console.log("shoing done modal");
                    navigation.navigate('doneGiantStepsPopup');
                  }}
                style={{
                  backgroundColor: colors.readioOrange,
                  borderRadius: 25,
                  width: 28,
                  height: 28,
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              >
                <Ionicons
                  name="globe"
                  size={20}
                  color={colors.readioWhite}
                />
              </Pressable> */}

              <Pressable 
                  style={[utilsStyles.buttonContainer, buttonStyle.shadowOrange, {
                    width: '70%',
                    backgroundColor: colors.readioOrange,

                }]}
                onPress={() => { 
                  if (!userIsSubscribed) {
                    subscribeToLotus();
                  } else {
                    handleStartWalk(); 
                    successFeedback();
                  }
                }}
              >
                <Text allowFontScaling={false} style={{
                      color: colors.readioDustyWhite,
                      fontSize: 16,
                      fontFamily: readioBoldFont,
                      letterSpacing: 0.3,
                }}>Start</Text>
              </Pressable>
            </View>

          </SafeAreaView>
        </>
      )}
    </>
  );
}

function StartedWalking({tracks, search, setSearch, handleClearSearch,
}: {
  tracks: any; search: any; setSearch: any; handleClearSearch: any;
}) {

  const { user } = useLotusUser();
  const { 
    formatTime, currentStepCount, elapsedTime, walkStartTime,
  } = useLotusGiantSteps();

  const { mediumFeedback } = useLotusHaptic();

  return (
    <>
      <View style={{ width: '100%', height: '100%' }}>
        <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'flex-start' }}>
          <LotusGap backgroundColor="'transparent" gapNumber={50} />

          {/* STUB */} 
          <View style={{width: '100%' }}>
            <Animated.View
              entering={FadeInUp.duration(400)}
              style={{
                display: 'flex',
                flexDirection: 'row',
                opacity: search.length > 0 ? 1 : 0.618,
                backgroundColor: 'transparent',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <TextInput
                allowFontScaling={false}
                style={[
                  styles.searchBar,
                  { width: search.length > 0 ? '84%' : '99%', color: colors.readioWhite },
                ]}
                placeholder="Listen to your articles while you walk:"
                value={search}
                onChangeText={setSearch}
                placeholderTextColor={colors.readioWhite}
              />
              {search.length > 0 && (
                <Pressable onPress={() =>{handleClearSearch(); mediumFeedback();}}>
                  <Text allowFontScaling={false} style={styles.back}>Cancel</Text>
                </Pressable>
              )}
            </Animated.View>
            <View style={{ height: 330, width: '100%' }}>
              <ScrollView showsVerticalScrollIndicator={false} style={{ height: 240, width: '100%', overflow: 'hidden' }}>
                <ReadioTracksList 
                  enablePagination 
                  hideQueueControls 
                  id={generateTracksListId('ssongs', search)} 
                  tracks={tracks} 
                  search={search}
                  scrollEnabled={false} 
                />
              </ScrollView>
            </View>
          </View>
          
          {/* TODO */}
          <View style={{ width: '100%', position: 'absolute', bottom: '15%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30}}>

            
            {/* NOTE : This is the step counter */}
            <LotusStepCounter currentStepCount={currentStepCount} />

            {/* NOTE : This is the steps container */}
            <LotusStepsContainer>

              <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 40, fontFamily: readioBoldFont }}>{formatTime(elapsedTime)}</Text>
              <View style={{paddingHorizontal: 16.18}}>
                <Text allowFontScaling={false} style={{ textAlign: 'center', color: colors.readioWhite, fontFamily: readioRegularFont }}>Your'e taking giant steps!</Text>
              </View>

            </LotusStepsContainer>
          
          </View>

        </View>

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  searchBar: {
    backgroundColor: `${colors.readioBlack}90`,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: `${colors.readioOrange}30`,
    fontFamily: readioRegularFont,
  },
  container: {
    padding: 20,
  },
  text: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.readioWhite,
    textAlign: 'center'
  },
  link: {
    color: colors.readioWhite,
    marginBottom: 10,
    fontFamily: readioRegularFont
  },
  blackStat: {
    color: colors.readioWhite,
    fontSize: 56,
    marginVertical: 5,
    fontFamily: readioBoldFont
  },
  stat: {
    color: colors.readioWhite,
    fontSize: 16,
    marginVertical: 5,
    fontFamily: readioRegularFont,
  },
  timeStat: {
    color: colors.readioWhite,
    fontSize: 100,
    marginVertical: 5,
    fontFamily: readioRegularFont,
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginVertical: 10,
  },
  cancel: {
    color: colors.readioWhite,
    fontFamily: readioRegularFont,
  },
  cancelButton: {
    backgroundColor: colors.readioOrange,
    borderRadius: 5,
    padding: 5,
  },
  back: {
    opacity: 0.5,
    color: `${colors.readioWhite}80`,
    fontFamily: readioBoldFont,
    fontSize: 12,
  },
});

