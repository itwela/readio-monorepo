import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import sql from '@/helpers/neonClient';
import { setStateAsync } from '@/constants/utilityFunctions';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import { LotusArticle } from '@/types/type';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import TrackPlayer from 'react-native-track-player';
import { Pedometer } from 'expo-sensors';
import { useUser } from '@clerk/clerk-expo';
import { useLotusStreak } from './lotusStreakProvider';

interface LotusGiantStepsContextType {
  // UTILITY FUNCTIONS
  numberToDigits: (num: number) => string[];
  calculateDistance: (steps: number) => number;
  metersToMiles: (meters: number) => number;
  toggleModal: () => Promise<void>;

  // LOCATIONS STUFF
  location: any;
  setLocation: (value: any) => void;
  previousLocation: Location.LocationObjectCoords | null;
  setPreviousLocation: (value: Location.LocationObjectCoords | null) => void;
  selection: string;
  setSelection: (value: string) => void;
  appState: AppStateStatus;
  setAppState: (value: AppStateStatus) => void;
  fetchingLocation: boolean;
  requestPermissions: () => Promise<void>;
  locationSubscription: React.MutableRefObject<Location.LocationSubscription | null>;
  isPedometerAvailable: string;
  setIsPedometerAvailable: (value: string) => void;
  setFetchingLocation: (value: boolean) => void;
  handleAppStateChange: (nextAppState: string) => void;
  errorMsg: string | null;
  setErrorMsg: (value: string | null) => void;

  // SEARCHING ARTICLES STUFF WHILE WALKING
  search: string;
  setSearch: (value: string) => void;
  handleClearSearch: () => void;
  resetAudio: () => void;
  
  // WALKING DATA STUFF
  handleStartWalk: () => Promise<void>;
  elapsedTime: number;
  setElapsedTime: (value: number) => void;
  steps: number;
  setSteps: (value: number) => void;
  totalDistance: number;
  setTotalDistance: (value: number) => void;
  speed: number;
  setSpeed: (value: number) => void;
  startTimer: () => void;
  stopTimer: () => void;
  sessionSteps: number;
  setSessionSteps: (value: number) => void;
  sessionDistance: number;
  setSessionDistance: (value: number) => void;
  sessionTime: number;
  setSessionTime: (value: number) => void;
  currentStepCount: number;
  setCurrentStepCount: (value: number) => void;
  intervalRef: React.MutableRefObject<NodeJS.Timeout | null>;
  pastStepCount: number;
  setPastStepCount: (value: number) => void;
  formatTime: (time: number) => string;
  getTotalSteps: () => Promise<void>;
  
  // DONE STUFF
  handleCalculations: () => void;
  handleAddDataToDB: () => Promise<void>;
  handleEndWalk: () => Promise<void>;
  totalSteps?: number;
  setTotalSteps: (value: number | undefined) => void;
  isDoneModalVisible: boolean;
  setIsDoneModalVisible: (value: boolean) => void;
}

const LotusGiantStepsContext = createContext<LotusGiantStepsContextType | null>(null);

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const LotusGiantStepsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const { updateGiantStepsStreak } = useLotusStreak()
  // UTILITY FUNCTIONS STATES
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // LOCATIONS STUFF STATES
  const [location, setLocation] = useState<any>();
  const [previousLocation, setPreviousLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [selection, setSelection] = useState('');
  const [appState, setAppState] = useState(AppState.currentState);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');

  // SEARCHING ARTICLES STUFF STATES
  const [search, setSearch] = useState('');

  // WALKING DATA STUFF STATES
  const [elapsedTime, setElapsedTime] = useState(0);
  const [steps, setSteps] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [sessionSteps, setSessionSteps] = useState(0);
  const [sessionDistance, setSessionDistance] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [pastStepCount, setPastStepCount] = useState(0);

  // DONE STUFF STATES
  const [totalSteps, setTotalSteps] = useState<number>();
  const [isDoneModalVisible, setIsDoneModalVisible] = useState(false);
  
  const { user } = useLotusUser();

  // UTILITY FUNCTIONS
  const numberToDigits = (num: number): string[] => {
    const str = String(num).padStart(9, '0');
    return str.split('');
  };

  const calculateDistance = (steps: number) => {
    const averageStepLengthInMeters = 0.762; // Average step length in meters
    return steps * averageStepLengthInMeters;
  };

  const metersToMiles = (meters: number): number => {
    const miles = meters / 1609.34; // 1 mile = 1609.34 meters
    return miles;
  };

  // LOCATIONS STUFF
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

  // SEARCHING ARTICLES STUFF
  const handleClearSearch = () => setSearch('');

  const resetAudio = () => {
    TrackPlayer.pause();
    console.log("Tp is paused ,");
    TrackPlayer.reset();
    console.log("Tp is reset ,");
  };

  // WALKING DATA STUFF
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

  const getTotalSteps = async () => {
    const totalStepsId = 1;
    const steps = await sql`SELECT * FROM steps WHERE id = ${totalStepsId}`;
    setTotalSteps(steps[0]?.total);
  };

  // DONE STUFF
  const handleCalculations = () => {
    setSessionSteps(currentStepCount);
    const stepsInMeters = calculateDistance(currentStepCount);
    const stepsInMiles = metersToMiles(stepsInMeters);
    setSessionDistance(stepsInMiles);
  };

  const handleAddDataToDB = async () => {
    const totalStepsId = 1;
    const csc = currentStepCount;
    try {
      await sql`UPDATE users SET usersteps = usersteps + ${csc} WHERE clerk_id = ${user?.clerk_id}`;
    } catch (error) {
      console.error('Error updating user steps:', error);
    }

    try {
      await sql`UPDATE steps SET total = total + ${csc} WHERE id = ${totalStepsId}`;
    } catch (error) {
      console.error('Error updating total steps count:', error);
    }
    console.log('step count updated!');
  };

  const handleStartWalk = async () => {
    resetAudio();
    setElapsedTime(0);
    setSteps(0);
    setTotalDistance(0);
    setCurrentStepCount(0)
    setSessionSteps(0)
    setSessionDistance(0)
    setSessionTime(0)

    await updateGiantStepsStreak()
    setSelection('Walking')
    console.log("selection", selection)
  }

  const handleEndWalk = async () => {
    handleCalculations();
    setSessionTime(elapsedTime);
    await handleAddDataToDB();
    setSelection('Done');
  };

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
  
      // Return the subscription so it can be cleaned up
      return Pedometer.watchStepCount(result => {
        setCurrentStepCount(result.steps);
      });
    }
    return null;
  };

  const toggleModal = async () => {

    setElapsedTime(0);
    setSteps(0);
    setTotalDistance(0);
    setCurrentStepCount(0)
    setSessionSteps(0)
    setSessionDistance(0)
    setSessionTime(0)

    setSelection('')
    setIsDoneModalVisible(false);
  };

//  USEEFFECTS 
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [appState]);

  useEffect(() => {
    if (selection === 'Walking') {
      startTimer();
    } else if (selection === 'Done') {
      // Handle Done state
    } else {
      stopTimer();
      setElapsedTime(0);
      setSteps(0);
      setTotalDistance(0);
    }

    return () => {
      stopTimer();
    };
  }, [selection]);

  useEffect(() => {
    getTotalSteps();
  }, []);

  useEffect(() => {
    if (selection === 'Walking') {
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
      setIsDoneModalVisible(true)
    }
  }, [selection]);


  return (
    <LotusGiantStepsContext.Provider value={{
      // UTILITY FUNCTIONS
      numberToDigits,
      calculateDistance,
      metersToMiles,
      toggleModal,

      // LOCATIONS STUFF
      location,
      setLocation,
      previousLocation,
      setPreviousLocation,
      selection,
      setSelection,
      appState,
      setAppState,
      fetchingLocation,
      setFetchingLocation,
      requestPermissions,
      locationSubscription,
      isPedometerAvailable,
      setIsPedometerAvailable,
      errorMsg,
      setErrorMsg,
      handleAppStateChange,

      // SEARCHING ARTICLES STUFF
      search,
      setSearch,
      handleClearSearch,
      resetAudio,
      
      // WALKING DATA STUFF
      handleStartWalk,
      elapsedTime,
      setElapsedTime,
      steps,
      setSteps,
      totalDistance,
      setTotalDistance,
      speed,
      setSpeed,
      startTimer,
      stopTimer,
      sessionSteps,
      setSessionSteps,
      sessionDistance,
      setSessionDistance,
      sessionTime,
      setSessionTime,
      currentStepCount,
      setCurrentStepCount,
      intervalRef,
      pastStepCount,
      setPastStepCount,
      formatTime,
      getTotalSteps,
      
      // DONE STUFF
      handleCalculations,
      handleAddDataToDB,
      handleEndWalk,
      totalSteps,
      setTotalSteps,
      isDoneModalVisible,
      setIsDoneModalVisible,
    }}>
      {children}
    </LotusGiantStepsContext.Provider>
  );
};

export const useLotusGiantSteps = () => {
  const context = useContext(LotusGiantStepsContext);
  if (!context) throw new Error('useLotusGiantSteps must be used within a LotusGiantStepsProvider');
  return context;
};