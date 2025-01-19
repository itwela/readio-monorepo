import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { StyleSheet, Text, View, SafeAreaView,  AppState, AppStateStatus , TouchableOpacity, TextInput, ScrollView, Pressable, Modal, KeyboardAvoidingView } from "react-native";
import { useEffect, useState, useRef, useMemo } from "react";
import { router } from 'expo-router';
import * as Location from 'expo-location';
import Animated, { FadeInDown, FadeInUp, FadeOutDown } from "react-native-reanimated";
import { defaultStyles } from "@/styles";
import { Readio } from '@/types/type';
import { trackTitleFilter } from '@/helpers/filter';
import { ReadioTracksList } from "@/components/ReadioTrackList";
import { generateTracksListId } from "@/helpers/misc";
import sql from "@/helpers/neonClient";
import { useReadio } from "@/constants/readioContext";
import FastImage from "react-native-fast-image";
import { bookshelfImg, whitelogo } from "@/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import createAnimatedComponent, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import { FontAwesome } from "@expo/vector-icons";
import { Pedometer } from 'expo-sensors';
import { Asset } from 'expo-asset';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function GiantScreen() {
  const [location, setLocation] = useState<any>();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [steps, setSteps] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [previousLocation, setPreviousLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [selection, setSelection] = useState('');
  const [appState, setAppState] = useState(AppState.currentState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const [search, setSearch] = useState('');
  const [speed, setSpeed] = useState(0);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const handleClearSearch = () => setSearch('');
  const [status, requestPermission] = Location.useForegroundPermissions()
  const [readios, setReadios] = useState<Readio[]>([]);
  const filteredTracks = useMemo(() => (search ? readios.filter(trackTitleFilter(search)) : readios), [search, readios]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { user, setNeedsToRefresh } = useReadio();

  useEffect(() => {
    let isMounted = true;

    const fetchReadios = async () => {
      const data = await sql`SELECT * FROM readios WHERE clerk_id = ${user?.clerk_id}`;
      if (isMounted) setReadios(data);
    };

    // const requestPermissions = async () => {
    //   const { status } = await Location.requestForegroundPermissionsAsync();
    //   if (status === 'granted') {
    //     console.log('granted')
    //   } else {
    //     setErrorMsg('Permission to access location was denied');
    //   }
    // };

    // requestPermissions();
    fetchReadios();

    return () => { isMounted = false; };
  }, []);

  const requestPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setPreviousLocation(currentLocation.coords);
    } else {
      console.log('Permission to access location denied.');
    }
  };
  
  const startTimer = () => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
  };
  
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  
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
      justifyContent: 'center',
      alignItems: 'center',
      columnGap: 8,
      width: '100%',
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
  }) 

  const handleStartWalk = () => {
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
  setSelection('')
  setIsModalVisible(false);
};



  return (
    <>
      <FastImage
        source={{
          uri: selection === "Inside"
            ? 'https://images.pexels.com/photos/12250460/pexels-photo-12250460.jpeg'
            : selection === "Outside"
            ? "https://gifdb.com/images/high/aesthetic-dreamy-forest-stream-vv4g1awnqk8mxwan.webp"
            : bookshelfImg,
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
      <View style={{width: "100%", minHeight: "600%", zIndex: -3, position: "absolute", backgroundColor: colors.readioBrown }} />   
      <SafeAreaView style={[styles.safeAreaContainer]}>
        <Animated.View style={styles.container}>
          {selection ? (
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
            setElapsedTime={setElapsedTime} // Add this line
            setSteps={setSteps}             // Add this line
            setTotalDistance={setTotalDistance} // Add this line
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
          
          ) : (
            <>

            <View style={{width: '90%', height: '100%',  alignSelf: 'center', display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'center'}}>
              
              
              
              <View style={{width: '100%', height: '100%',  display: 'flex', flexDirection: 'column', gap: 15, alignItems: 'center', justifyContent: 'space-between'}}>
              
                <TouchableOpacity activeOpacity={0.9}  style={{position: 'absolute', left: -20, top: 0, padding: 5}} onPress={() => {handleGoHome()}}>
                  <FontAwesome color={colors.readioWhite}  size={20} name='chevron-left'/>
                </TouchableOpacity>

                <View/>

                <View style={{ marginBottom: 60, }}>
                  <FastImage source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))} style={{position: 'absolute', top: -70, width: 100, height: 100, alignSelf: "center", backgroundColor: "transparent"}} resizeMode="cover" />
                  <Text style={[styles.link, {textAlign: 'center', fontSize: 18}]}>Lotus</Text>
                  <Text style={styles.text}>Giant steps</Text>
                  <Text style={[styles.link, {textAlign: 'center', fontSize: 18}]}>100,000,000 steps and counting.</Text>
                </View>

                <View/>
                
                <View style={{width: '100%',position:'absolute', bottom: '13%', alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 10}}>

                  <TouchableOpacity style={runStyles.button}  activeOpacity={0.9} onPress={() => {handleStartWalk()}}>
                    <Text style={runStyles.buttonText}>Start</Text>
                  </TouchableOpacity>
        
                </View>
    
              </View>
              
              
            </View>
            </>
    
          )}
        </Animated.View>
      </SafeAreaView>
      
      {/* NOTE DONE MODAL */}
      <Modal
          animationType="slide" 
          transparent={true} 
          visible={isModalVisible}
          onRequestClose={toggleModal}
          style={{width: '100%', height: '100%' }}
        >


          <SafeAreaView style={{width: '100%', height: '100%', backgroundColor: colors.readioBrown, }}>
              <View style={{width: '100%', display: 'flex', paddingLeft: 10, paddingRight: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: "transparent"}}> 
                <FastImage
                  style={{ width: 60, height: 60 }}
                  source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))}
                />
                <TouchableOpacity onPress={toggleModal}>
                  <FontAwesome name="close" size={30} color={colors.readioWhite} />
                </TouchableOpacity>
              </View>
              {/* <DismissPlayerSymbol></DismissPlayerSymbol>   */}
              <FastImage
              source={Asset.fromModule(require('@/assets/images/mapImage.png'))}
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

            <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={10} style={{padding: 20, width: '100%', height: '100%', display: 'flex', justifyContent: "flex-start",}}>
              

              <View style={{gap:30, padding: 10}}>

                <View style={{gap: 30, display: 'flex', flexDirection: 'row', width: '100%'}}>
                  
                  <View style={{width: '50%'}}>
                    <Text  style={{color: colors.readioWhite, fontSize: 50, fontFamily: readioBoldFont}} >{sessionSteps}</Text>
                    <Text style={{color: colors.readioWhite, fontFamily: readioRegularFont}}>Steps</Text>
                  </View>


                  <View style={{width: '50%'}}>
                    <View style={{display: 'flex', flexDirection: 'row'}}>
                      <Text  style={{color: colors.readioWhite, fontSize: 50, fontFamily: readioBoldFont}} >{formatTime(sessionTime)}</Text>
                    </View>
                    <Text style={{color: colors.readioWhite, fontFamily: readioRegularFont}}>Time spent walking</Text>
                  </View>

                </View>

                <View style={{gap: 30, display: 'flex', flexDirection: 'row', width: '100%'}}>
                  
                  <View style={{width: '50%'}}>
                    <View style={{display: 'flex', flexDirection: 'row'}}>
                      <Text  style={{color: colors.readioWhite, fontSize: 50, fontFamily: readioBoldFont}} >{sessionDistance?.toFixed(2)}</Text>
                      <Text style={{color: colors.readioWhite, fontFamily: readioRegularFont}}>MI</Text>
                    </View>
                    <Text style={{color: colors.readioWhite, fontFamily: readioRegularFont}}>Miles</Text>
                  </View>

                  <View style={{width: '50%'}}>
                    <Text  style={{color: colors.readioWhite, fontSize: 50, fontFamily: readioBoldFont}} >Nice!</Text>
                    <Text style={{color: colors.readioWhite, fontFamily: readioRegularFont}}>Great Session!</Text>
                  </View>

                </View>

              </View>

            </KeyboardAvoidingView>

          </SafeAreaView>
      </Modal>
    </>
    // <></>
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
  
  const {user} = useReadio()

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

  const handleAddDataTODB = async () => {
    const totalStepsId = 0
    try {
        await sql` UPDATE users SET usersteps = usersteps + ${sessionSteps} WHERE clerk_id = ${user?.clerk_id}`;
    } catch (error) {
        console.error('Error updating user steps:', error);
    }

    try {
        await sql` UPDATE steps SET total = total + ${sessionSteps} WHERE id = ${totalStepsId}`;
    } catch (error) {
        console.error('Error updating total steps count:', error);
    }
    console.log('step count updated!')
  }

  const handleEndWalk = async () => { 
    handleCalculations()
    setSessionTime(elapsedTime)
    handleAddDataTODB()
    setElapsedTime(0);
    setSteps(0);
    setCurrentStepCount(0)
    setTotalDistance(0);
    setSelection('Done');
  };

  return (
    <>
      <View style={{ width: '100%', height: '100%' }}>
        <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'flex-start' }}>
          <View style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* <Text style={{ color: colors.readioWhite }}></Text>s */}
            <Text style={styles.stat}>Currently {selection}</Text>
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
              <Text style={[styles.link, {marginTop: 10}]}>End Walk</Text>
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
                <Text style={{ color: colors.readioWhite }}>Clear</Text>
              </Pressable>
            )}
          </Animated.View>
              <View style={{height: 240, width: '100%'}}>
                <ScrollView style={{height: 240, width: '100%', overflow: 'hidden'}}>
                      <ReadioTracksList hideQueueControls id={generateTracksListId('ssongs', search)} tracks={filteredTracks} scrollEnabled={false}/>
                </ScrollView>
              </View>

  <View style={{height: 20}}/>
<View style={{height: 10}}/>


<View style={{width: '100%', position: 'absolute', bottom: '15%', }}>


<View style={{height: 20}}/>

<Text style={{color: colors.readioWhite, fontFamily: readioRegularFont}}>Steps</Text>
<Text style={{color: colors.readioWhite, fontSize: 60, fontFamily: readioBoldFont}}>{currentStepCount}</Text>
<Text style={{color: 'transparent', fontFamily: readioRegularFont}}>.</Text>

<Text style={{color: colors.readioWhite, fontFamily: readioRegularFont}}>You've been walking for:</Text>
<Text style={{color: colors.readioWhite, fontSize: 60, fontFamily: readioBoldFont}}>{formatTime(elapsedTime)}</Text>
<Text style={{color: colors.readioWhite, fontFamily: readioRegularFont}}>Your'e taking giant steps!</Text>

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
  cancelButton : {
    backgroundColor: colors.readioOrange,
    borderRadius: 5, 
    padding: 5,
  }
});

const DismissPlayerSymbol = () => {

  const { top } = useSafeAreaInsets()

  return (
      <View style={{
          position: 'absolute',
          top: top + 8,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center'
      }}>
          <View accessible={false} style={{
              width: 50,
              height: 8,
              borderRadius: 8,
              backgroundColor: colors.readioWhite,
              opacity: 0.7

          }}/>
      </View>
  )
}