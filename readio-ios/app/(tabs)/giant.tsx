import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Pressable } from "react-native";
import { useEffect, useState, useMemo } from "react";
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

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function GiantScreen() {
  const [location, setLocation] = useState<any>()
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [steps, setSteps] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [previousLocation, setPreviousLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [selection, setSelection] = useState('');
  const [search, setSearch] = useState('');
  const [readios, setReadios] = useState<Readio[]>([]);
  const { user, setNeedsToRefresh } = useReadio();
  const filteredTracks = useMemo(() => (search ? readios.filter(trackTitleFilter(search)) : readios), [search, readios]);

  const handleClearSearch = () => setSearch('');
  const [status, requestPermission] = Location.useForegroundPermissions();

  const requestPermissions = async () => {
    console.log('Button clicked, requesting permissions...');
    
    if (status?.status === 'granted') {
      console.log('Permission already granted.');
      setHasPermission(true);
      
      console.log('Fetching last known location...');
      const lastKnownLocation = await Location.getLastKnownPositionAsync({});
      console.log('Last known location:', lastKnownLocation);
      
      console.log('Fetching current location...');
      const currentLocation = await Location.getCurrentPositionAsync({});
      console.log('Current location:', currentLocation);
      
      setLocation(currentLocation);
      console.log('Location state updated.');
      
      setPreviousLocation(currentLocation.coords);
      console.log('Previous location state updated.');
      
      console.log("Permission granted and location set successfully.");
    } else {
      console.log('Permission not granted, requesting permission...');
      const permissionResponse = await Location.requestForegroundPermissionsAsync();
      if (permissionResponse.granted) {
        console.log('Permission granted after request.');
        setHasPermission(true);
        
        console.log('Fetching last known location...');
        const lastKnownLocation = await Location.getLastKnownPositionAsync({});
        console.log('Last known location:', lastKnownLocation);
        
        console.log('Fetching current location...');
        const currentLocation = await Location.getCurrentPositionAsync({});
        console.log('Current location:', currentLocation);
        
        setLocation(currentLocation);
        console.log('Location state updated.');
        
        setPreviousLocation(currentLocation.coords);
        console.log('Previous location state updated.');
        
        console.log("Permission granted and location set successfully.");
      } else {
        setErrorMsg('Permission to access location was denied');
        console.log("Permission denied.");
      }
    }

    console.log('Request permissions function executed.');
  };

  useEffect(() => {

    const fetchReadios = async () => {
      const data = await sql`SELECT * FROM readios WHERE clerk_id = ${user?.clerk_id}`;
      setReadios(data);
    };

    fetchReadios();

  }, []);

  useEffect(() => {
    if (!selection) return;

    let timer: NodeJS.Timeout | null = null;
    let clock: NodeJS.Timeout | null = null;
    let locationSubscription: Location.LocationSubscription | null = null;

    if (selection !== '') {
      // Timer for elapsed time
      clock = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      // Timer for steps
      timer = setInterval(() => {
        setSteps((prev) => prev + 106); // 106 steps per minute
      }, 60000);

      const startLocationTracking = async () => {
        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 1 },
          (currentLocation) => {
            // Handle location updates
            setPreviousLocation(currentLocation.coords);
          }
        );
      };
    
      startLocationTracking();


    } else {
      // Reset the clock and steps when selection is ''
      setElapsedTime(0);
      setSteps(0);
      setTotalDistance(0);
      setPreviousLocation(null);
    }
    
    return () => {
      if (clock) clearInterval(clock);
      if (timer) clearInterval(timer);
      if (locationSubscription) locationSubscription.remove();
    };

  }, [status?.status, selection, previousLocation]);

  const calculateDistance = (coords1: Location.LocationObjectCoords, coords2: Location.LocationObjectCoords) => {
    const R = 6371e3;
    const φ1 = (coords1.latitude * Math.PI) / 180;
    const φ2 = (coords2.latitude * Math.PI) / 180;
    const Δφ = ((coords2.latitude - coords1.latitude) * Math.PI) / 180;
    const Δλ = ((coords2.longitude - coords1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const AnimatedImage = Animated.createAnimatedComponent(FastImage);
  const runStyles = StyleSheet.create({
    button: {
      padding: 12,
      backgroundColor: colors.readioOrange,
      borderRadius: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      columnGap: 8,
      width: '45%'
    },
    buttonText: {
      ...defaultStyles.text,
      color: colors.readioWhite,
      fontWeight: '600',
      fontSize: 20,
      textAlign: 'center',
      fontFamily: readioRegularFont
    },
  }) 

  const handlePress = () => {
    router.push('/(tabs)/(home)/home'); // <-- Using 'player' as screen name
  }




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
          />
          
          ) : (
            <>

            <View style={{width: '90%', height: '100%',  alignSelf: 'center', display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'center'}}>
              
              
              
              <View style={{width: '100%', height: '100%',  display: 'flex', flexDirection: 'column', gap: 15, alignItems: 'center', justifyContent: 'space-around'}}>
              
                <TouchableOpacity activeOpacity={0.9}  style={{position: 'absolute', left: 0, top: 0, padding: 5}} onPress={handlePress}>
                  <FontAwesome color={colors.readioWhite}  size={20} name='chevron-left'/>
                </TouchableOpacity>

                <View style={{}}>
                  <FastImage source={{uri: whitelogo}} style={{position: 'absolute', top: -70, width: 100, height: 100, alignSelf: "center", backgroundColor: "transparent"}} resizeMode="cover" />
                  <Text style={styles.text}>Giant steps</Text>
                  <Text style={[styles.link, {textAlign: 'center', fontSize: 18}]}>Keep Going</Text>
                </View>
                
                <View style={{width: '100%', alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 10}}>

                  {status?.status != 'granted' && (
                    <>
                    <Pressable style={{}} onPress={requestPermissions}>
                      <Text style={[styles.link, {padding: 9, opacity: 0.618}]}>Share Location</Text>
                    </Pressable>
                    </>
                  )}

                  <Text style={[styles.link, {fontSize: 18,}]}>Will you be walking:</Text>
        
                  <TouchableOpacity style={runStyles.button}  activeOpacity={0.9} onPress={() => {status?.status === 'granted' ? setSelection('Inside') : {}}}>
                    <Text style={runStyles.buttonText}>Inside</Text>
                  </TouchableOpacity>
        
                  <TouchableOpacity  style={runStyles.button}  activeOpacity={0.9}  onPress={() => {status?.status === 'granted' ? setSelection('Outside') : {}}}>
                  < Text style={runStyles.buttonText}>Outside</Text>
                  </TouchableOpacity>

                  {location?.coords && <Text style={styles.link}>Location Found</Text>}
                  {/* {!location && <Text style={styles.link}>No Location Found</Text>} */}

   
                  <Text style={styles.link}>{location?.coords.accuracy}</Text>
                  <Text style={styles.link}>{location?.coords.latitude}</Text>
                  <Text style={styles.link}>{location?.coords.longitude}</Text>
                  <Text style={styles.link}>{location?.coords.speed}</Text>

                </View>

                <View style={{height: 1}}>
                </View>
    
              </View>
              
              
            </View>
            </>
    
          )}
        </Animated.View>
      </SafeAreaView>
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
}) {
  const handleEndWalk = () => {
    setElapsedTime(0);
    setSteps(0);
    setTotalDistance(0);
    setSelection('');
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
              placeholder="Listen to an article while you walk:"
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
          <View style={{height: 150, width: '100%'}}>

          <ReadioTracksList hideQueueControls id={generateTracksListId('ssongs', search)} tracks={filteredTracks} scrollEnabled={false}/>

  </View>

  <View style={{height: 20}}/>
<View style={{height: 10}}/>


<View style={{width: '100%', position: 'absolute', bottom: '10%', }}>


<Text style={styles.stat}>Distance: {totalDistance.toFixed(2)} meters</Text>
<Text style={styles.stat}>Steps (Estimate): {steps}</Text>
<View style={{height: 20}}/>
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