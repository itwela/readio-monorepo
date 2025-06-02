import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { useLotusStreak } from './lotusStreakProvider';
import { useLastActiveTrack } from '@/hooks/useLastActiveTrack';
import { useLotusHaptic } from './lotusHapticProvider';
import { useRouter } from 'expo-router';
import { setStateAsync } from '@/constants/utilityFunctions';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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
  walkStartTime: Date | null;
  setWalkStartTime: (value: Date | null) => void;
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
  totalStepsFromQuery?: number;
  isDoneModalVisible: boolean;
  setIsDoneModalVisible: (value: boolean) => void;

  // 🎯 NEW: Reactive leaderboard data
  userLeaderboardData?: any;
  globalStepsData?: any;
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
  const { lastActiveTrack, clearLastActiveTrack, setLastActiveTrack } = useLastActiveTrack();


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
  const [walkStartTime, setWalkStartTime] = useState<Date | null>(null);

  // DONE STUFF STATES
  const [isDoneModalVisible, setIsDoneModalVisible] = useState(false);
  
  const { user, setUserStepCount, userStepCount } = useLotusUser();
  const router = useRouter();

  const { lightFeedback, successFeedback, mediumFeedback, stepMilestone} = useLotusHaptic();

  // 🎯 REACTIVE CONVEX QUERIES - Follow lotusUserContext pattern
  const globalStepsData = useQuery(api.steps.getLatestSteps);
  const totalStepsFromQuery = globalStepsData?.total;
  const globalStepsId = globalStepsData?._id;

  // 🎯 NEW: Get user's leaderboard data reactively
  const userLeaderboardData = useQuery(
    api.stepsLeaderboard.getUserStepsLeaderboard,
    user?.user_db_id ? { user_db_id: user.user_db_id } : "skip"
  );

  // 🎯 CONVEX MUTATIONS - Following best practices
  const updateUserStepsMutation = useMutation(api.users.updateUserSteps);
  const incrementGlobalStepsMutation = useMutation(api.steps.incrementSteps);
  const addStepsLeaderboardMutation = useMutation(api.stepsLeaderboard.addStepsLeaderboard);
  const updateStepsLeaderboardMutation = useMutation(api.stepsLeaderboard.updateStepsLeaderboard);

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
    } else if (nextAppState.match(/inactive|background/)) {
      stopTimer();
    }
    setAppState(nextAppState as AppStateStatus);
  };

  // SEARCHING ARTICLES STUFF
  const handleClearSearch = () => setSearch('');

  const resetAudio = async () => {
    TrackPlayer.pause();
    TrackPlayer.reset();
    await clearLastActiveTrack();
  };

  // WALKING DATA STUFF
  const startTimer = () => {
    if (!intervalRef.current && walkStartTime) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - walkStartTime.getTime()) / 1000);
        setElapsedTime(elapsed);
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
    // 🎯 REACTIVE: Data is automatically fetched by useQuery(api.steps.getLatestSteps)
    // No manual fetching needed - useQuery handles this reactively!
    console.log("🎯 Total steps data (via useQuery):", globalStepsData);
  };

  // DONE STUFF
  const handleCalculations = () => {
    setSessionSteps(currentStepCount);
    const stepsInMeters = calculateDistance(currentStepCount);
    const stepsInMiles = metersToMiles(stepsInMeters);
    setSessionDistance(stepsInMiles);
  };

  // 🎯 UPDATED: Handle database operations with proper Convex mutations
  const handleAddDataToDB = async () => {
    if (!user?.user_db_id || !user?.email || !user?.name) {
      console.error('Missing user data for updating steps');
      console.error('User data:', { 
        user_db_id: user?.user_db_id, 
        email: user?.email, 
        name: user?.name 
      });
      return;
    }

    const csc = currentStepCount;
    
    console.log('🎯 Updating steps with Convex:', {
      currentStepCount: csc,
      userDbId: user.user_db_id,
      userEmail: user.email,
      userName: user.name
    });
    
    try {
      // 🎯 1. Update user's total steps
      console.log('📊 Updating user steps...');
      await updateUserStepsMutation({
        user_db_id: user.user_db_id,
        steps: csc,
      });
      console.log('✅ User steps update successful');

      // 🎯 OPTIMISTIC UPDATE: Update local user step count immediately
      // This provides instant UI feedback without needing a reactive query
      if (setUserStepCount && userStepCount !== undefined) {
        const newStepCount = userStepCount + csc;
        setUserStepCount(newStepCount);
        console.log(`🎯 Optimistically updated user step count: ${userStepCount} + ${csc} = ${newStepCount}`);
      }

      // 🎯 2. Update global steps counter
      if (globalStepsId) {
        console.log('🌍 Updating global steps...');
        await incrementGlobalStepsMutation({
          stepsId: globalStepsId as Id<"steps">,
          increment: csc,
        });
        console.log('✅ Global steps update successful');
      } else {
        console.warn('⚠️ Global steps ID not available');
      }

      // 🎯 3. Handle steps leaderboard (update existing or create new)
      console.log('🏆 Handling leaderboard entry...');
      if (userLeaderboardData) {
        // User exists in leaderboard - update their record
        console.log('🔄 Updating existing leaderboard entry...');
        await updateStepsLeaderboardMutation({
          id: userLeaderboardData._id,
          step_value: userLeaderboardData.step_value + csc,
        });
        console.log('✅ Leaderboard entry updated');
      } else {
        // User doesn't exist in leaderboard - create new entry
        console.log('➕ Creating new leaderboard entry...');
        await addStepsLeaderboardMutation({
          user_db_id: user.user_db_id,
          step_value: csc,
          user_email: user.email,
          name: user.name,
        });
        console.log('✅ New leaderboard entry created');
      }

    } catch (error) {
      console.error('❌ Error updating steps data:', error);
    }
  };

  const handleStartWalk = async () => {
    resetAudio();
    const startTime = new Date();
    setWalkStartTime(startTime);
    setElapsedTime(0);
    setSteps(0);
    setTotalDistance(0);
    setCurrentStepCount(0)
    setSessionSteps(0)
    setSessionDistance(0)
    setSessionTime(0)

    await updateGiantStepsStreak()
    setSelection('Walking')
  }

  const handleEndWalk = async () => {
    router.push('/(tabs)/giant')

    handleCalculations();
    if (walkStartTime) {
      const endTime = new Date();
      const totalSeconds = Math.floor((endTime.getTime() - walkStartTime.getTime()) / 1000);
      setSessionTime(totalSeconds);
    }
    await handleAddDataToDB();
    setStateAsync(setSelection, 'Done');
    // setStateAsync(setWalkStartTime, null);
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
  
      return Pedometer.watchStepCount(result => {
        setCurrentStepCount(result.steps);
      });
    }
    return null;
  };

  const toggleModal = async () => {
    lightFeedback();
    setIsDoneModalVisible(false);
    setElapsedTime(0);
    setSteps(0);
    setWalkStartTime(null);
    setTotalDistance(0);
    setCurrentStepCount(0)
    setSessionSteps(0)
    setSessionDistance(0)
    setSessionTime(0)
    setSelection('')

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
      walkStartTime,
      setWalkStartTime,
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
      totalStepsFromQuery,
      isDoneModalVisible,
      setIsDoneModalVisible,

      // 🎯 REACTIVE DATA
      userLeaderboardData,
      globalStepsData,
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