import { colors, readioRegularFont } from "@/constants/tokens";
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { router } from 'expo-router';
import * as Location from 'expo-location';
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { defaultStyles } from "@/styles";
const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function GiantScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [steps, setSteps] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [previousLocation, setPreviousLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [selection, setSelection] = useState('')

  // Request location permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
        const initialLocation = await Location.getCurrentPositionAsync({});
        setLocation(initialLocation);
        setPreviousLocation(initialLocation.coords);
        console.log('Initial location:', initialLocation.coords);
        console.log('Previous location:', previousLocation);
        console.log('Has permission:', hasPermission);
        return initialLocation;
      } else {
        setErrorMsg('Permission to access location was denied');
      }
      console.log('Has permission:', hasPermission);
      return 47
    };

    requestPermissions();

  }, []);

  // Start timer and step tracking only when permissions are granted
useEffect(() => {
  if (!hasPermission) return;

  let timer: ReturnType<typeof setInterval> | null = null;
  let clock: ReturnType<typeof setInterval> | null = null;
  let locationSubscription: Promise<Location.LocationSubscription> | null = null;

  if (selection !== '') {
    // Timer for elapsed time
    clock = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // Timer for steps
    timer = setInterval(() => {
      setSteps((prev) => prev + 106); // 106 steps per minute
    }, 60000);

    // Start tracking location
    const updateLocation = async () => {
      const currentLocation = await Location.getCurrentPositionAsync({});
      if (previousLocation) {
        const distance = calculateDistance(previousLocation, currentLocation.coords);
        setTotalDistance((prev) => prev + distance);
      }
      setPreviousLocation(currentLocation.coords);
    };

    locationSubscription = Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 1 },
      updateLocation
    );
  } else {
    // Reset the clock and steps when selection is ''
    setElapsedTime(0);
    setSteps(0);
    setTotalDistance(0);
    setPreviousLocation(null);
  }

  return () => {
    if (timer !== null) clearInterval(timer);
    if (clock !== null) clearInterval(clock);
    if (locationSubscription !== null) {
      locationSubscription.then((sub) => sub.remove());
    }
  };
}, [hasPermission, previousLocation, selection]);

  // Calculate distance between two coordinates
  const calculateDistance = (coords1: Location.LocationObjectCoords, coords2: Location.LocationObjectCoords) => {
    const R = 6371; // Earth radius in kilometers
    const dLat = (coords2.latitude - coords1.latitude) * (Math.PI / 180);
    const dLon = (coords2.longitude - coords1.longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(coords1.latitude * (Math.PI / 180)) *
        Math.cos(coords2.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Convert to meters
  };


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


  return (
    <SafeAreaView style={[styles.safeAreaContainer, { backgroundColor: colors.readioBrown }]}>
      <Animated.View  entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(300)}   style={styles.container}>
       
       { selection === '' && (
        <>
        <Text style={styles.text}>Take a Giant step!</Text>

        <View style={{width: '90%', alignSelf: 'center', display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-start', justifyContent: 'center'}}>
          
          <Text style={[styles.link, {}]}>Will you be walking:</Text>
          
          <View style={{width: '100%', display: 'flex', flexDirection: 'row', gap: 15, alignItems: 'center', justifyContent: 'space-around'}}>

          <TouchableOpacity style={runStyles.button}  activeOpacity={0.9} onPress={() => setSelection('Inside')}>
            <Text style={runStyles.buttonText}>Inside</Text>
          </TouchableOpacity>

          <TouchableOpacity  style={runStyles.button}  activeOpacity={0.9}  onPress={() => setSelection('Outside')}>
          < Text style={runStyles.buttonText}>Outside</Text>
          </TouchableOpacity>

          </View>
          
          
        </View>
          </>
       )}
       

       
        {hasPermission && selection === 'Inside' || selection === 'Outside' ? (
          <>
            <StartedWalking selection={selection} setSelection={setSelection} steps={steps} elapsedTime={elapsedTime} totalDistance={totalDistance} location={location} />
          </>
        ) : (
          <Text style={styles.error}>
            {/* {errorMsg || "Waiting for location permission..."} */}
          </Text>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

function StartedWalking({selection, setSelection, steps, elapsedTime, totalDistance, location}: {selection: any, setSelection: any, steps: any, elapsedTime: any, totalDistance: any, location: any}) {
  return (
    <>
    <View style={{width: '100%', height: "100%"}}>

          <TouchableOpacity activeOpacity={0.9} onPress={() => setSelection('')} style={{backgroundColor: colors.readioOrange, width: 100, paddingHorizontal: 10, alignItems: 'center', borderRadius: 10}}>
            <Text style={styles.link}>End Walk</Text>
          </TouchableOpacity>

          <View style={{width: '100%', height: '50%', alignItems: 'center', justifyContent: 'center'}}>
            <Text style={styles.stat}>Now Playing:</Text>
            <Text style={styles.stat}>Lotus Article</Text>
            <View style={{height: 10}}/>
            <View style={{padding: 10, alignItems: 'center', borderColor: colors.readioOrange, borderWidth: 10, justifyContent: 'center', backgroundColor: colors.readioWhite, borderRadius: 600, width: 150, height: 150}}>
              <Text style={styles.blackStat}>{steps}</Text>
            </View>
            <Text style={styles.stat}>Time: {formatTime(elapsedTime)}</Text>
            <Text style={styles.stat}>Distance: {totalDistance.toFixed(2)} meters</Text>
            {location && (
              <Text style={styles.stat}>Location: {location?.coords?.latitude}, {location?.coords?.longitude} meters</Text>
            )}
            <Text style={styles.stat}>Currently {selection}</Text>
          </View>

          <View style={{width: '100%', height: '50%'}}>
          </View>

    </View>

    </>
  )
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
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
    marginVertical: 10,
    fontFamily: readioRegularFont
  },
  blackStat: {
    color: colors.readioBlack,
    fontSize: 16,
    marginVertical: 5,
  },
  stat: {
    color: colors.readioWhite,
    fontSize: 16,
    marginVertical: 5,
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginVertical: 10,
  },
});