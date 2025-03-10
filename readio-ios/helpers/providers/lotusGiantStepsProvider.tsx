import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import sql from '@/helpers/neonClient';
import { setStateAsync } from '@/constants/utilityFunctions';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import { LotusArticle } from '@/types/type';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';

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
}

const LotusGiantStepsContext = createContext<LotusGiantStepsContextType | null>(null);

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