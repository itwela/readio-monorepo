import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import sql from '@/helpers/neonClient';
import { setStateAsync } from '@/constants/utilityFunctions';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import { LotusArticle } from '@/types/type';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import TrackPlayer from 'react-native-track-player';

interface LotusGiantStepsContextType {
  location: any;
  setLocation: (value: any) => void;
  elapsedTime: number;
  setElapsedTime: (value: number) => void;
  steps: number;
  setSteps: (value: number) => void;
  totalDistance: number;
  setTotalDistance: (value: number) => void;
  previousLocation: Location.LocationObjectCoords | null;
  setPreviousLocation: (value: Location.LocationObjectCoords | null) => void;
  selection: string;
  setSelection: (value: string) => void;
  appState: AppStateStatus;
  setAppState: (value: AppStateStatus) => void;
  search: string;
  setSearch: (value: string) => void;
  speed: number;
  setSpeed: (value: number) => void;
  fetchingLocation: boolean;
  setFetchingLocation: (value: boolean) => void;
  errorMsg: string | null;
  setErrorMsg: (value: string | null) => void;
  handleClearSearch: () => void;
  requestPermissions: () => Promise<void>;
  startTimer: () => void;
  stopTimer: () => void;
  intervalRef: React.MutableRefObject<NodeJS.Timeout | null>;
  locationSubscription: React.MutableRefObject<Location.LocationSubscription | null>;
  formatTime: (time: number) => string;
  handleAppStateChange: (nextAppState: string) => void;
  resetAudio: () => void;
  getTotalSteps: () => Promise<void>;
  numberToDigits: (num: number) => string[];
  calculateDistance: (steps: number) => number;
  metersToMiles: (meters: number) => number;
  handleCalculations: () => void;
  handleAddDataToDB: () => Promise<void>;
  handleEndWalk: () => Promise<void>;
  totalSteps?: number;
  setTotalSteps: (value: number | undefined) => void;
  sessionSteps: number;
  setSessionSteps: (value: number) => void;
  sessionDistance: number;
  setSessionDistance: (value: number) => void;
  sessionTime: number;
  setSessionTime: (value: number) => void;
  currentStepCount: number;
  setCurrentStepCount: (value: number) => void;
}

const LotusGiantStepsContext = createContext<LotusGiantStepsContextType | null>(null);

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const LotusGiantStepsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<any>();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [steps, setSteps] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [previousLocation, setPreviousLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [selection, setSelection] = useState('');
  const [appState, setAppState] = useState(AppState.currentState);
  const [search, setSearch] = useState('');
  const [speed, setSpeed] = useState(0);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [totalSteps, setTotalSteps] = useState<number>();
  const [sessionSteps, setSessionSteps] = useState(0);
  const [sessionDistance, setSessionDistance] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  
  const { user } = useLotusUser();

  const handleClearSearch = () => setSearch('');

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

  const resetAudio = () => {
    TrackPlayer.pause();
    console.log("Tp is paused ,");
    TrackPlayer.reset();
    console.log("Tp is reset ,");
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


  const getTotalSteps = async () => {
    const totalStepsId = 1;
    const steps = await sql`SELECT * FROM steps WHERE id = ${totalStepsId}`;
    setTotalSteps(steps[0]?.total);
  };

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

  const handleEndWalk = async () => {
    handleCalculations();
    setSessionTime(elapsedTime);
    await handleAddDataToDB();
    setSelection('Done');
  };

  useEffect(() => {
    getTotalSteps();
  }, []);

  return (
    <LotusGiantStepsContext.Provider value={{
      location,
      setLocation,
      elapsedTime,
      setElapsedTime,
      steps,
      setSteps,
      totalDistance,
      setTotalDistance,
      previousLocation,
      setPreviousLocation,
      selection,
      setSelection,
      appState,
      setAppState,
      search,
      setSearch,
      speed,
      setSpeed,
      fetchingLocation,
      setFetchingLocation,
      errorMsg,
      setErrorMsg,
      handleClearSearch,
      requestPermissions,
      startTimer,
      stopTimer,
      intervalRef,
      locationSubscription,
      formatTime,
      handleAppStateChange,
      resetAudio,
      getTotalSteps,
      numberToDigits,
      calculateDistance,
      metersToMiles,
      handleCalculations,
      handleAddDataToDB,
      handleEndWalk,
      totalSteps,
      setTotalSteps,
      sessionSteps,
      setSessionSteps,
      sessionDistance,
      setSessionDistance,
      sessionTime,
      setSessionTime,
      currentStepCount,
      setCurrentStepCount
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