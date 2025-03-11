import { colors, giantFont, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { StyleSheet, Text, View, SafeAreaView, AppState, AppStateStatus, RefreshControl, TouchableOpacity, TextInput, ScrollView, Pressable, Modal, KeyboardAvoidingView, Dimensions, Image } from "react-native";
import { useEffect, useState, useRef, useMemo } from "react";
import { router } from 'expo-router';
import * as Location from 'expo-location';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { defaultStyles } from "@/styles";
import { LotusArticle } from '@/types/type';
import { trackTitleFilter } from '@/helpers/filter';
import { ReadioTracksList } from "@/components/ReadioTrackList";
import { generateTracksListId } from "@/helpers/misc";
import sql from "@/helpers/neonClient";
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import { bookshelfImg, croplogowhite, walkingVideo } from "@/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import createAnimatedComponent, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import { FontAwesome } from "@expo/vector-icons";
import { Pedometer } from 'expo-sensors';
import { Asset } from 'expo-asset';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import { getLocalImageUri } from "@/constants/imageAssets";
import TrackPlayer from "react-native-track-player";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { LotusArticleModal } from "@/components/LotusArticleModal";
import LotusGap from "@/components/LotusGap";
import { useLotusGiantSteps } from "@/helpers/providers/lotusGiantStepsProvider";

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function GiantScreen() {
  const { 
    location, setLocation,
    elapsedTime, setElapsedTime,
    steps, setSteps,
    totalDistance, setTotalDistance,
    previousLocation, setPreviousLocation,
    selection, setSelection,
    appState, setAppState,
    search, setSearch,
    speed, setSpeed,
    fetchingLocation, setFetchingLocation,
    errorMsg, setErrorMsg,
    handleClearSearch,
    requestPermissions,
    startTimer,
    stopTimer,
    intervalRef,
    locationSubscription
  } = useLotusGiantSteps();
  const [status, requestPermission] = Location.useForegroundPermissions()
  const { user, totalSteps, setTotalSteps, userArticles } = useLotusUser();
  const filteredTracks = useMemo(() => (search ? userArticles.filter(trackTitleFilter(search)) : userArticles), [search, userArticles]);

  // const requestPermissions = async () => {
  //   const { status } = await Location.requestForegroundPermissionsAsync();
  //   if (status === 'granted') {
  //     const currentLocation = await Location.getCurrentPositionAsync({});
  //     setLocation(currentLocation);
  //     setPreviousLocation(currentLocation.coords);
  //   } else {
  //     console.log('Permission to access location denied.');
  //   }
  // };

  // const startTimer = () => {
  //   if (!intervalRef.current) {
  //     intervalRef.current = setInterval(() => {
  //       setElapsedTime((prev) => prev + 1);
  //     }, 1000);
  //   }
  // };

  // const stopTimer = () => {
  //   if (intervalRef.current) {
  //     clearInterval(intervalRef.current);
  //     intervalRef.current = null;
  //   }
  // };

  const handleAppStateChange = (nextAppState: string) => {
    if (appState && appState.match(/inactive|background/) && nextAppState === 'active') {
      startTimer();
      console.log('Resumed');
    } else if (nextAppState.match(/inactive|background/)) {
      stopTimer();
      console.log('Paused');
    }
    setAppState(nextAppState as AppStateStatus);
    console.log('AppState changed to', nextAppState);
  };

  const { clearLastActiveTrack  } = useLastActiveTrack()


  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [appState]);

  useEffect(() => {

    if (selection === 'Walking') {
      startTimer();
      const setupSubscription = async () => {
        const subscription = await subscribe();
        return () => subscription && subscription.remove();
      };

      const cleanup = setupSubscription();
      return () => {
        cleanup.then(unsubscribe => unsubscribe && unsubscribe());
      };

    }

    if (selection === 'Done') {
      setIsModalVisible(true)
    }

    else {
      stopTimer();
      setElapsedTime(0);
      setSteps(0);
      setTotalDistance(0);
    }

    return () => {
      stopTimer();
    };

  }, [selection]);


  const runStyles = StyleSheet.create({
    button: {
      padding: 12,
      borderRadius: 100,
      flexDirection: 'row',
      columnGap: 8,
      height: 50,
      backgroundColor: colors.readioOrange,
    },
    buttonText: {
      fontWeight: '600',
      fontSize: 20,
      textAlign: 'center',
      color: colors.readioWhite,
      fontFamily: readioBoldFont
    },
    controlButton: {
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      transform: [{ scale: 1 }]
    },
    playPauseButton: {
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      transform: [{ scale: 1 }],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4
    },
    skipButton: {
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      transform: [{ scale: 1 }],
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }

  })

  const resetAudio = () => {
    TrackPlayer.pause();
    console.log("Tp is paused ,")
    TrackPlayer.reset();
    console.log("Tp is reset ,")
    clearLastActiveTrack();
  }


  const handleStartWalk = () => {
    resetAudio();
    setElapsedTime(0);
    setSteps(0);
    setTotalDistance(0);
    setCurrentStepCount(0)
    setSessionSteps(0)
    setSessionDistance(0)
    setSessionTime(0)

    setSelection('Walking')
    console.log("selection", selection)
  }

  const handleGoHome = () => {
    router.back()
  }

  // PEDOMETER -----------------------------------------------------------------------------------------------------------------


  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [pastStepCount, setPastStepCount] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);

  const [sessionSteps, setSessionSteps] = useState(0)
  const [sessionDistance, setSessionDistance] = useState<any>()
  const [sessionTime, setSessionTime] = useState<any>()

  const subscribe = async () => {
    const isAvailable = await Pedometer.isAvailableAsync();
    setIsPedometerAvailable(String(isAvailable));

    if (isAvailable) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);

      if (pastStepCountResult) {
        setPastStepCount(pastStepCountResult.steps);
      }


      return Pedometer.watchStepCount(result => {
        setCurrentStepCount(result.steps);
      });
    }
  };


  // ==============================================================================================================================

  const [modalVisible, setModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const toggleModal = () => {

    setElapsedTime(0);
    setSteps(0);
    setTotalDistance(0);
    setCurrentStepCount(0)
    setSessionSteps(0)
    setSessionDistance(0)
    setSessionTime(0)

    setSelection('')
    setIsModalVisible(false);
  };

  const numberToDigits = (num: number): string[] => {
    const str = String(num).padStart(9, '0');
    return str.split('')
  };

  const getTotalSteps = async () => {
    const totalStepsId = 1
    const steps = await sql`SELECT * FROM steps WHERE id = ${totalStepsId}`
    setTotalSteps?.(steps[0]?.total)
  }

  useEffect(() => {
    getTotalSteps()
  }, [])

  useEffect(() => {
    const getTotalSteps = async () => {
      const totalStepsId = 1
      const steps = await sql`SELECT * FROM steps WHERE id = ${totalStepsId}`
      setTotalSteps?.(steps[0]?.total)
    }

    getTotalSteps()
  }, [isModalVisible])

  const [refreshing, setRefreshing] = useState(false); // For refresh control
  const onRefresh = () => {
    setRefreshing(true);
    getTotalSteps()  // checkSignInStatus()

    // Add any refresh logic here, such as resetting state or re-fetching data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000); // Simulate an async operation
  };

  return (
    <>
      <Image
        source={{
          uri: getLocalImageUri("walkingGif"),
        }}
        style={{ zIndex: -2, position: 'absolute', width: '100%', height: '40%' }}
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
        <SafeAreaView style={[styles.safeAreaContainer]}>
          <Animated.View style={styles.container}>
            <StartedWalking
              filteredTracks={filteredTracks}
              search={search}
              setSearch={setSearch}
              handleClearSearch={handleClearSearch}
              selection={selection}
              setSelection={setSelection}
              steps={steps}
              elapsedTime={elapsedTime}
              totalDistance={totalDistance}
              location={location}
              setElapsedTime={setElapsedTime as any} // Add this line
              setSteps={setSteps as any}             // Add this line
              setTotalDistance={setTotalDistance as any} // Add this line
              pastStepCount={pastStepCount}
              currentStepCount={currentStepCount}
              setCurrentStepCount={setCurrentStepCount}
              isPedometerAvailable={isPedometerAvailable}
              sessionSteps={sessionSteps}
              setSessionSteps={setSessionSteps}
              sessionDistance={sessionDistance}
              setSessionDistance={setSessionDistance}
              sessionTime={sessionTime}
              setSessionTime={setSessionTime}
            />
          </Animated.View>
        </SafeAreaView>

      ) : (
        <>

          {/* <TouchableOpacity activeOpacity={0.9} style={{ position: 'absolute', left: 20, top: 60, padding: 5, zIndex: 4 }} onPress={() => { handleGoHome() }}>
            <FontAwesome color={colors.readioWhite} size={20} name='chevron-left' />
          </TouchableOpacity> */}

            <SafeAreaView style={{ width: '100%', justifyContent: "space-between", height: '100%', alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 2}}>

              {/* REVIEW COUNTER */}
              <View style={{ paddingTop: 40,}}>
               
                  <Image source={{ uri: getLocalImageUri('whiteLogo') }} style={{  width: 60, height: 60, alignSelf: "center", backgroundColor: "transparent" }} resizeMode="contain" />
                  <Text allowFontScaling={false} style={[styles.link, { textAlign: 'center', fontSize: 18 }]}>Lotus</Text>
                  <Text allowFontScaling={false} style={[styles.text, { fontFamily: giantFont, fontSize: 35 }]}>GIANT STEPS</Text>

                  <View style={[{ display: 'flex', overflow: 'hidden', flexDirection: 'row', gap: 8, justifyContent: 'space-between', marginVertical: 15, paddingHorizontal: 20 }]}>
                    {numberToDigits(totalSteps as number).map((digit: string, index: number) => {
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
                <Pressable 
                  style={{
                    backgroundColor: colors.readioOrange,
                    borderRadius: 100,
                    width: '100%',
                    height: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: colors.readioOrange,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                  }} 
                  onPress={() => { handleStartWalk() }}
                >
                  <Text allowFontScaling={false} style={{
                        color: colors.readioWhite,
                        fontSize: 16,
                        fontFamily: readioBoldFont,
                        letterSpacing: 0.3,
                  }}>Start</Text>
                </Pressable>
              </View>

            </SafeAreaView>

        </>

      )}

      {/* NOTE DONE MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
        style={{ width: '100%', height: '100%' }}
      >


        <SafeAreaView style={{ width: '100%', height: '100%', backgroundColor: colors.readioBrown, }}>
          <View style={{ width: '100%', display: 'flex', paddingHorizontal: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: "transparent" }}>
            <Image
              style={{ width: 50, height: 50 }}
              source={{uri: getLocalImageUri('whiteLogo')}}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={toggleModal}>
              <FontAwesome name="close" size={30} color={colors.readioWhite} />
            </TouchableOpacity>
          </View>
          {/* <DismissPlayerSymbol></DismissPlayerSymbol>   */}
          <Image
            source={{uri: getLocalImageUri('mapImg')}}
            style={{ zIndex: -2, position: 'absolute', width: '100%', height: '30%' }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={[colors.readioBrown, 'transparent']}
            style={{
              zIndex: -1,
              bottom: '75%',
              position: 'absolute',
              width: '150%',
              height: '100%',
              transform: [{ rotate: '-180deg' }],
            }}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1.318 }}
          />

          <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={10} style={{ padding: 20, width: '100%', height: '100%', display: 'flex', justifyContent: "flex-start", }}>


            <View style={{ gap: 30, padding: 10 }}>

              <View style={{ gap: 30, display: 'flex', flexDirection: 'row', width: '100%' }}>

                <View style={{ width: '50%' }}>
                  <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 50, fontFamily: readioBoldFont }} >{sessionSteps}</Text>
                  <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont }}>Steps</Text>
                </View>


                <View style={{ width: '50%' }}>
                  <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 50, fontFamily: readioBoldFont }} >{formatTime(sessionTime)}</Text>
                  </View>
                  <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont }}>Time spent walking</Text>
                </View>

              </View>

              <View style={{ gap: 30, display: 'flex', flexDirection: 'row', width: '100%' }}>

                <View style={{ width: '50%' }}>
                  <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 50, fontFamily: readioBoldFont }} >{sessionDistance?.toFixed(2)}</Text>
                    <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont }}>MI</Text>
                  </View>
                  <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont }}>Miles</Text>
                </View>

                <View style={{ width: '50%' }}>
                  <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 50, fontFamily: readioBoldFont }} >Nice!</Text>
                  <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont }}>Great Session!</Text>
                </View>

              </View>

            </View>

          </KeyboardAvoidingView>

        </SafeAreaView>
      </Modal>

      <LotusArticleModal/>
    </>
  );
}

function StartedWalking({
  filteredTracks,
  search,
  setSearch,
  handleClearSearch,
  selection,
  setSelection,
  steps,
  elapsedTime,
  totalDistance,
  location,
  setElapsedTime,
  setSteps,
  setTotalDistance,
  pastStepCount,
  currentStepCount,
  setCurrentStepCount,
  isPedometerAvailable,
  sessionSteps,
  setSessionSteps,
  sessionDistance,
  setSessionDistance,
  sessionTime,
  setSessionTime
}: {
  filteredTracks: any;
  search: any;
  setSearch: any;
  handleClearSearch: any;
  selection: any;
  setSelection: any;
  steps: any;
  elapsedTime: any;
  totalDistance: any;
  location: any;
  setElapsedTime: React.Dispatch<React.SetStateAction<number>>;
  setSteps: React.Dispatch<React.SetStateAction<number>>;
  setTotalDistance: React.Dispatch<React.SetStateAction<number>>;
  pastStepCount: any;
  currentStepCount: any;
  setCurrentStepCount: any;
  isPedometerAvailable: any;
  sessionSteps: any,
  setSessionSteps: any,
  sessionDistance: any,
  setSessionDistance: any,
  sessionTime: any,
  setSessionTime: any
}) {

  const { user } = useLotusUser()

  const calculateDistance = (steps: any) => {
    const averageStepLengthInMeters = 0.762; // Average step length in meters
    return steps * averageStepLengthInMeters;
  };

  const metersToMiles = (meters: number): number => {
    const miles = meters / 1609.34; // 1 mile = 1609.34 meters
    return miles;
  };

  const handleCalculations = () => {
    setSessionSteps(currentStepCount)
    const stepsInMeters = calculateDistance(currentStepCount)
    const stepsInMiles = metersToMiles(stepsInMeters)
    setSessionDistance(stepsInMiles)
  }

  const handleAddDataToDB = async () => {
    const totalStepsId = 1
    const csc = currentStepCount
    try {
      await sql` UPDATE users SET usersteps = usersteps + ${csc} WHERE clerk_id = ${user?.clerk_id}`;
    } catch (error) {
      console.error('Error updating user steps:', error);
    }

    try {
      await sql` UPDATE steps SET total = total + ${csc} WHERE id = ${totalStepsId}`;
    } catch (error) {
      console.error('Error updating total steps count:', error);
    }
    console.log('step count updated!')
  }

  const handleEndWalk = async () => {
    handleCalculations()
    setSessionTime(elapsedTime)
    handleAddDataToDB()
    setSelection('Done');
  };

  return (
    <>
      <View style={{ width: '100%', height: '100%' }}>
        <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'flex-start' }}>
          <View style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text allowFontScaling={false} style={styles.stat}>Currently {selection}</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleEndWalk}
              style={{
                backgroundColor: colors.readioOrange,
                width: 100,
                paddingHorizontal: 10,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
              }}
            >
              <Text allowFontScaling={false} style={[styles.link, { marginTop: 10 }]}>End Walk</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 20 }} />

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
              <Pressable onPress={handleClearSearch}>
                <Text allowFontScaling={false} style={{ color: colors.readioWhite }}>Clear</Text>
              </Pressable>
            )}
          </Animated.View>
          <View style={{ height: 240, width: '100%' }}>
            <ScrollView style={{ height: 240, width: '100%', overflow: 'hidden' }}>
              <ReadioTracksList hideQueueControls id={generateTracksListId('ssongs', search)} tracks={filteredTracks} scrollEnabled={false} />
            </ScrollView>
          </View>

          <View style={{ height: 20 }} />
          <View style={{ height: 10 }} />


          <View style={{ width: '100%', position: 'absolute', bottom: '15%', }}>


            <View style={{ height: 20 }} />

            <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont }}>Steps</Text>
            <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 60, fontFamily: readioBoldFont }}>{currentStepCount}</Text>
            <Text allowFontScaling={false} style={{ color: 'transparent', fontFamily: readioRegularFont }}>.</Text>

            <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont }}>You've been walking for:</Text>
            <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 60, fontFamily: readioBoldFont }}>{formatTime(elapsedTime)}</Text>
            <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont }}>Your'e taking giant steps!</Text>

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
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 20,
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
  }
});

