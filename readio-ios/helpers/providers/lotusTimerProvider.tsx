import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { SoundAssets } from '@/constants/soundAssets';
import { useLotusHaptic } from './lotusHapticProvider';

/* ----------------------------------------------------------------------------------------------

// SECTION :
 start interfaces.

---------------------------------------------------------------------------------------------- */

interface TimerState {
  rounds: number;
  duration: number; // in minutes
  rest: number; // in seconds (rest between rounds)
  preparation: number; // in seconds
  isRunning: boolean;
  currentRound: number;
  timeRemaining: number; // in seconds
  timerType: 'edit' | 'saved';
  presetName?: string;
  // New timer execution state
  currentPhase: 'preparation' | 'work' | 'rest' | 'complete' | 'idle';
  startTime: number | null;
  pausedTime: number;
  // Flashing state
  isFlashingRed: boolean;
  isFlashingGreen: boolean;
  flashStartTime: number | null;
}

interface TimerChainItem {
  id: string;
  name: string;
  rounds: number;
  duration: number; // in minutes
  rest: number; // in seconds (rest between rounds)
  preparation: number; // in seconds
}

// New interface for preset chains
interface PresetChain {
  name: string;
  chain: Omit<TimerChainItem, 'id'>[];
}

// Interface for custom presets to save to Convex
interface SavedTimerPreset {
  // Preset metadata
  id: string;
  name: string;
  description: string;
  type: 'saved';
  createdAt: string; // ISO date string
  userId: string;
  isPublic: boolean;
  
  // Timer chain data
  chain: {
    order: number;
    name: string;
    rounds: number;
    duration: number; // in minutes
    rest: number; // in seconds (rest between rounds)
    preparation: number; // in seconds
  }[];
  
  // Computed metadata for easy querying
  totalTimers: number;
  totalDuration: string;
  totalRounds: number;
  
  // Tags for categorization
  tags: string[];
}

interface LotusTimerContextType {

  // Timer Mode
  timerMode: 'Classic' | 'Workout' | 'Workflow' | 'Work-In';
  setTimerMode: (mode: 'Classic' | 'Workout' | 'Workflow' | 'Work-In') => void;

  // Timer state
  timerState: TimerState;
  setTimerState: (state: TimerState) => void;
  
  // Timer Chain
  timerChain: TimerChainItem[];
  currentChainIndex: number;
  currentTimer: TimerChainItem | null;
  nextTimer: TimerChainItem | null;
  addToChain: (name: string) => void;
  removeFromChain: (id: string) => void;
  clearChain: () => void;
  moveChainItem: (fromIndex: number, toIndex: number) => void;
  updateTimerInChain: (timerId: string, updates: Partial<Omit<TimerChainItem, 'id' | 'name'>>) => void;
  
  // Presets
  presets: Record<string, PresetChain>;
  loadPreset: (presetName: string) => void;
  loadSavedPreset: (savedPresetData: any) => void;
  resetToDefaults: () => void;
  getPresetMetadata: (presetName: string) => { totalTimers: number; totalDuration: string };
  getPresetTimers: () => Array<{ name: string; totalTimers: number; totalDuration: string }>;
  
  // Custom preset handling
  handleStartCustomPreset: (preset: any) => Promise<void>;
  handleQuickSavePreset: () => Promise<void>;
  saveCurrentAsPreset: (presetName: string) => Promise<void>;
  
  // Modal state management
  wantsTimerSounds: boolean;
  presetModalVisible: boolean;
  customModalVisible: boolean;
  selectedPresetName: string;
  isSwitchingTimerMode: boolean;
  setWantsTimerSounds: (wantsTimerSounds: boolean) => void;
  setPresetModalVisible: (visible: boolean) => void;
  setCustomModalVisible: (visible: boolean) => void;
  setSelectedPresetName: (name: string) => void;
  setIsSwitchingTimerMode: (isSwitchingTimerMode: boolean) => void;

  // Timer interaction functions
  handleTimerPress: (type: 'edit' | 'saved', presetName?: string) => void;
  handleClosePresetModal: () => void;
  handleCloseCustomModal: () => void;
  handleStartPreset: (presetName: string) => void;
  
  // Individual state setters
  setRounds: (rounds: number) => void;
  setDuration: (duration: number) => void;
  setRest: (rest: number) => void;
  setPreparation: (preparation: number) => void;
  setIsRunning: (isRunning: boolean) => void;
  setCurrentRound: (round: number) => void;
  setTimeRemaining: (time: number) => void;
  setTimerType: (type: 'edit' | 'saved') => void;
  setPresetName: (name?: string) => void;
  
  // Timer actions
  startTimer: () => void;
  startChain: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  stopTimer: () => void;
  
  // Utility functions
  incrementRounds: () => void;
  decrementRounds: () => void;
  incrementDuration: () => void;
  decrementDuration: () => void;
  incrementRest: () => void;
  decrementRest: () => void;
  incrementPreparation: () => void;
  decrementPreparation: () => void;
  playTimerSound: (soundKey: keyof typeof SoundAssets) => Promise<void>;
  cycleTimerMode: () => void;

  // Formatting
  formatTime: (seconds: number) => string;
  formatCountdownTime: (seconds: number) => string;
  formatDuration: (minutes: number) => string;
  formatRestTime: (restMinutes: number) => string;
  getTotalChainTime: () => string;
  
  // Debug
  logTimerState: (action: string, additionalData?: any) => void;
}

/* ----------------------------------------------------------------------------------------------

// NOTE :
end interfaces.

---------------------------------------------------------------------------------------------- */

const LotusTimerContext = createContext<LotusTimerContextType | null>(null);

/* ----------------------------------------------------------------------------------------------

// SECTION :
start timer constants.

---------------------------------------------------------------------------------------------- */

const defaultTimerState: TimerState = {
  rounds: 3,
  duration: 1, // 1 minute default
  rest: 10, // 10 seconds default (start at 10)
  preparation: 0, // 0 seconds default - start at first option
  isRunning: false,
  currentRound: 1,
  timeRemaining: 60, // 1 minute in seconds
  timerType: 'edit',
  presetName: undefined,
  currentPhase: 'idle',
  startTime: null,
  pausedTime: 0,
  isFlashingRed: false,
  isFlashingGreen: false,
  flashStartTime: null,
};

// Helper function to make duration calculations easier
const createTimer = (
  name: string, 
  rounds: number, 
  durationMinutes: number, 
  restSeconds: number = 0, 
  preparationSeconds: number = 5
) => ({
  name,
  rounds,
  duration: durationMinutes,
  rest: restSeconds,
  preparation: preparationSeconds,
});

// Enhanced helper functions for easy duration specification
const sec = (seconds: number) => seconds / 60; // Convert seconds to minutes
const min = (minutes: number) => minutes; // Keep minutes as minutes

// Super easy timer creation with intuitive duration specification
const timer = (
  name: string, 
  rounds: number, 
  duration: number, // Duration in minutes (use sec() for seconds)
  rest: number = 0, // Rest in seconds (use sec() for seconds)
  preparation: number = 5 // Preparation in seconds (use sec() for seconds)
) => ({
  name,
  rounds,
  duration,
  rest,
  preparation,
});

// Enhanced presets with predefined chains
const timerPresets: Record<string, PresetChain> = {
  'WORK OUT': {
    name: 'WORK OUT',
    chain: [
      timer('PUSH UPS', 2, sec(15), sec(10), 5), // 1 min duration, 10s rest, 5s prep
      timer('SIT UPS', 2, sec(15), sec(10), 5), // 2 min duration, 60s rest, 5s prep
      timer('PULL UPS', 1, sec(15), sec(10), 5), // 3 min duration, 60s rest, 5s prep
      timer('SQUATS', 3, sec(15), sec(10), 5), // 1.5 min duration, 60s rest, 5s prep
    ],
  },
  'WORK IN': {
    name: 'WORK IN',
    chain: [
      timer('STRETCH', 2, sec(15), sec(10), 5), // 5 min duration, no rest, 30s prep
      timer('SIT UPS', 2, sec(15), sec(10), 5), // 8 min duration, 60s rest, 15s prep
      timer('PULL UPS', 2, sec(15), sec(10), 5), // 10 min duration, no rest, 30s prep
      timer('SQUATS', 2, sec(15), sec(10), 5), // 7 min duration, no rest, 60s prep
    ],
  },
  'WORK FLOW': {
    name: 'WORK FLOW',
    chain: [
      timer('WRITING', 2, sec(15), sec(10), 5), // 10 min duration, no rest, 5s prep
      timer('READING', 2, sec(15), sec(10), 5), // 25 min duration, 300s rest, 5s prep
      timer('LEARNING', 2, sec(15), sec(10), 5), // 15 min duration, no rest, 5s prep
      timer('MEDITATION', 2, sec(15), sec(10), 5), // 25 min duration, 300s rest, 5s prep
    ],
  },
};

/* ----------------------------------------------------------------------------------------------

// NOTE :
end timer constants.

---------------------------------------------------------------------------------------------- */

// Export the CustomTimerPreset type for use in other components
export type { SavedTimerPreset };

export const LotusTimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  /* ----------------------------------------------------------------------------------------------

  // SECTION :
  start timer state.

  ---------------------------------------------------------------------------------------------- */

  const [timerState, setTimerState] = useState<TimerState>(defaultTimerState);
  const [timerChain, setTimerChain] = useState<TimerChainItem[]>([]);
  const [currentChainIndex, setCurrentChainIndex] = useState(0);
  const [currentTimer, setCurrentTimer] = useState<TimerChainItem | null>(null);
  const [nextTimer, setNextTimer] = useState<TimerChainItem | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timerMode, setTimerMode] = useState<'Classic' | 'Workout' | 'Workflow' | 'Work-In'>('Classic');
  const soundRef = useRef<Audio.Sound | null>(null);
  const [wantsTimerSounds, setWantsTimerSounds] = useState(true);
  const [isSwitchingTimerMode, setIsSwitchingTimerMode] = useState(false);
  
  // Modal state management
  const [presetModalVisible, setPresetModalVisible] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [selectedPresetName, setSelectedPresetName] = useState<string>('');
  
  // Add a ref to track pending start
  const pendingStartRef = useRef(false);

  /* ----------------------------------------------------------------------------------------------
  
  // NOTE :
  end timer state.
  
  ---------------------------------------------------------------------------------------------- */

  const { intervalTimerStart, intervalTimerComplete } = useLotusHaptic();
  const { lightFeedback } = useLotusHaptic();


  // Preset arrays for timer settings
  const preparationOptions = [0, 10, 15, 30, 60, 120, 180, 240, 300]; // in seconds: 0, 10s, 15s, 30s, 1min, 2min, 3min, 4min, 5min
  const durationOptions = [0.5, 1, 2, 3, 4, 5, 10, 15, 30, 60]; // in minutes: 30s, 1min, 2min, 3min, 4min, 5min, 10min, 15min, 30min, 1hr
  const restOptions = [0, 10, 15, 30, 60, 120, 180, 240, 300, 900, 1800, 3600]; // in seconds: 0, 10s, 15s, 30s, 1min, 2min, 3min, 4min, 5min, 15min, 30min, 1hr


  /* ------------------------------------------------------------------------------------------

  // SECTION :
  use effects.

  ---------------------------------------------------------------------------------- */

  // NOTE - Main timer logic - runs every second when timer is active
  useEffect(() => {

    if (timerState.isRunning && timerState.startTime) {
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedTotal = Math.floor((now - timerState.startTime!) / 1000) - timerState.pausedTime;
        
        let phaseTime = 0;
        let currentPhase = timerState.currentPhase;
        let currentRound = timerState.currentRound;
        let timeRemaining = timerState.timeRemaining;
        
        // Calculate phase-specific elapsed time
        let phaseElapsed = elapsedTotal;

        // Calculate current phase and time remaining
        if (currentPhase === 'preparation') {
          // Preparation counts DOWN
          phaseTime = timerState.preparation - elapsedTotal;
          if (phaseTime <= 0) {
            // Move to work phase
            currentPhase = 'work';

            timerMode === 'Workout' ? playTimerSound('workoutStart') : 
            timerMode === 'Workflow' ? playTimerSound('workflowStart') : 
            timerMode === 'Work-In' ? playTimerSound('workInStart') : 
            playTimerSound('workoutStart');

            intervalTimerStart();
            setTimerState(prev => ({
              ...prev,
              currentPhase: 'work',
              startTime: now,
              pausedTime: 0,
              timeRemaining: 0, // Start counting UP from 0
              flashStartTime: Date.now(), // Start green flash immediately
              isFlashingGreen: true,
            }));
            return;
          }

        } else if (currentPhase === 'work') {
          // Work counts DOWN (show time remaining)
          const targetTime = timerState.duration * 60; // duration stored in minutes
          const remaining = Math.max(0, targetTime - phaseElapsed);
          phaseTime = remaining;
          if (remaining <= 0) {

            timerMode === 'Workout' ? playTimerSound('workoutEnd') : 
            timerMode === 'Workflow' ? playTimerSound('workflowEnd') : 
            timerMode === 'Work-In' ? playTimerSound('workInEnd') : 
            playTimerSound('workoutEnd');

            // Check if this is the last round
            if (currentRound >= timerState.rounds) {
              // Move to next timer in chain or complete
              if (timerChain.length > 0 && currentChainIndex < timerChain.length - 1) {
                // Load next timer in chain
                const nextTimer = timerChain[currentChainIndex + 1];
                setTimerState(prev => ({
                  ...prev,
                  rounds: nextTimer.rounds,
                  duration: nextTimer.duration,
                  rest: nextTimer.rest,
                  preparation: nextTimer.preparation,
                  currentRound: 1,
                  currentPhase: 'preparation',
                  startTime: now,
                  pausedTime: 0,
                  timeRemaining: nextTimer.preparation,
                  flashStartTime: null, // Reset flash state for new timer
                  isFlashingGreen: false,
                }));
                setCurrentChainIndex(prev => {
                  return prev + 1;
                });

                return;

              } else {
                // Timer complete
                currentPhase = 'complete';

                
                playTimerSound('grandCycleEnding');
                intervalTimerComplete();
                setTimerState(prev => ({
                  ...prev,
                  currentPhase: 'complete',
                  isRunning: false,
                  timeRemaining: 0,
                }));
                return;
              }

            } else {
              // Move to rest phase
              currentPhase = 'rest';
              setTimerState(prev => ({
                ...prev,
                currentPhase: 'rest',
                startTime: now, // Reset start time for rest phase
                pausedTime: 0,
                timeRemaining: 0, // Start counting UP from 0 for rest
                flashStartTime: Date.now(), // Start green flash immediately
                isFlashingGreen: true,
              }));
              return;
            }
          }
          
        } else if (currentPhase === 'rest') {
          // Rest counts DOWN
          const targetTime = timerState.rest; // rest stored in seconds
          const remaining = Math.max(0, targetTime - phaseElapsed);
          phaseTime = remaining;
          if (remaining <= 0) {
            // Move to next round
            currentRound = currentRound + 1;
            currentPhase = 'work';

            timerMode === 'Workout' ? playTimerSound('workoutStart') : 
            timerMode === 'Workflow' ? playTimerSound('workflowStart') : 
            timerMode === 'Work-In' ? playTimerSound('workInAboutToStart') : 
            playTimerSound('workoutStart');

            setTimerState(prev => ({
              ...prev,
              currentRound: currentRound,
              currentPhase: 'work',
              startTime: now,
              pausedTime: 0,
              timeRemaining: 0, // Start counting UP from 0
              flashStartTime: Date.now(), // Start green flash immediately
              isFlashingGreen: true,
            }));
            return;
          }
        }

        // Update time remaining (show as countdown value)
        setTimerState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, phaseTime),
        }));

      }, 1000);

    } else {

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState.isRunning, timerState.startTime, timerState.pausedTime, timerState.currentPhase, timerState.rounds, timerState.duration, timerState.rest, timerState.preparation, timerChain, currentChainIndex]);

  // NOTE - Handle flashing red for last 10 seconds (not during preparation)
  useEffect(() => {
    if (timerState.isRunning && timerState.currentPhase !== 'preparation' && timerState.timeRemaining > 0) {
      let shouldFlashRed = false;
      
      if (timerState.currentPhase === 'work' || timerState.currentPhase === 'rest') {
        const totalDurationSeconds = timerState.currentPhase === 'work' 
          ? timerState.duration * 60 
          : timerState.rest;
        
        const threshold = totalDurationSeconds > 0 ? Math.ceil(totalDurationSeconds * 0.2) : 0;

        shouldFlashRed = threshold > 0 && timerState.timeRemaining <= threshold;
        
        if (timerState.currentPhase === 'work' && timerState.timeRemaining === threshold && threshold > 0) {
            timerMode === 'Workout' ? playTimerSound('workoutAboutToEnd10Secs') : 
            timerMode === 'Workflow' ? playTimerSound('workflowAboutToEnd') : 
            timerMode === 'Work-In' ? playTimerSound('workInAboutToEnd') : 
            playTimerSound('workoutAboutToEnd10Secs');
        }
      }
      
      setTimerState(prev => ({ ...prev, isFlashingRed: shouldFlashRed }));
    } else {
      setTimerState(prev => ({ ...prev, isFlashingRed: false }));
    }
  }, [timerState.timeRemaining, timerState.isRunning, timerState.currentPhase, timerState.duration, timerState.rest]);

  // NOTE - Handle flashing green for the first 20% of each new timer (not during preparation)
  useEffect(() => {
    if (timerState.isRunning && (timerState.currentPhase === 'work' || timerState.currentPhase === 'rest')) {
      const totalDurationSeconds = timerState.currentPhase === 'work' 
          ? timerState.duration * 60 
          : timerState.rest;

      let shouldFlashGreen = false;
      if (totalDurationSeconds > 0) {
        // Flash for the first 20% of the duration.
        const greenThreshold = totalDurationSeconds * 0.8;
        shouldFlashGreen = timerState.timeRemaining > greenThreshold;
      }
      
      if (shouldFlashGreen !== timerState.isFlashingGreen) {
          setTimerState(prev => ({ ...prev, isFlashingGreen: shouldFlashGreen }));
      }

    } else if (timerState.isFlashingGreen) {
        // Reset flashing when not in work/rest phase or timer stops
        setTimerState(prev => ({ ...prev, isFlashingGreen: false }));
    }
  }, [timerState.timeRemaining, timerState.isRunning, timerState.currentPhase, timerState.duration, timerState.rest]);

  // NOTE - Update current and next timer based on phase and chain index
  useEffect(() => {
    if (timerChain.length > 0) {
      let current = null;
      let next = null;
      
      if (timerState.currentPhase === 'preparation') {

        // During preparation, we're preparing FOR the current timer
        current = null; // Don't show a current timer name during prep
        next = timerChain[currentChainIndex] || null; // Show the timer we're preparing for

      } else {

        // During work/rest phases, show current timer and next in chain
        current = timerChain[currentChainIndex] || null;
        next = currentChainIndex < timerChain.length - 1 
          ? timerChain[currentChainIndex + 1] 
          : null;
          
      }
      
      setCurrentTimer(current);
      setNextTimer(next);
      
    } else {
      setCurrentTimer(null);
      setNextTimer(null);
    }
  }, [timerChain, currentChainIndex, timerState.currentPhase]);

  // NOTE - Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Unload sound on component unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Watch timerChain and trigger startChain if pendingStartRef is set
  useEffect(() => {
    if (pendingStartRef.current && timerChain.length > 0) {
      startChain();
      pendingStartRef.current = false;
    }
  }, [timerChain]);

  /* --------------------------------------------------------------------------------------------

  // NOTE :
  end useeffects

  --------------------------------------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------------------------------

  // SECTION :
  start timer chain functions.

  ---------------------------------------------------------------------------------------------- */

  // NOTE - Timer Chain functions
  const addToChain = (name: string) => {
    const newItem: TimerChainItem = {
      id: Date.now().toString(),
      name,
      rounds: timerState.rounds,
      duration: timerState.duration,
      rest: timerState.rest,
      preparation: timerState.preparation,
    };
    setTimerChain(prev => {
      const newChain = [...prev, newItem];
      logTimerState('ADD_TO_CHAIN', { newItem, newChainLength: newChain.length });
      return newChain;
    });
  };

  const removeFromChain = (id: string) => {
    setTimerChain(prev => {
      const newChain = prev.filter(item => item.id !== id);
      logTimerState('REMOVE_FROM_CHAIN', { removedId: id, newChainLength: newChain.length });
      return newChain;
    });
  };

  const clearChain = () => {
    console.log('clearChain called! Current chain length:', timerChain.length);
    setTimerChain([]);
    setCurrentChainIndex(0);
    logTimerState('CLEAR_CHAIN');
  };

  const moveChainItem = (fromIndex: number, toIndex: number) => {
    setTimerChain(prev => {
      const newChain = [...prev];
      const [movedItem] = newChain.splice(fromIndex, 1);
      newChain.splice(toIndex, 0, movedItem);
      return newChain;
    });
  };

  const updateTimerInChain = (timerId: string, updates: Partial<Omit<TimerChainItem, 'id' | 'name'>>) => {
    setTimerChain(prev => {
      const newChain = [...prev];
      const timerIndex = newChain.findIndex(t => t.id === timerId);
      if (timerIndex !== -1) {
        newChain[timerIndex] = {
          ...newChain[timerIndex],
          ...updates,
        };
        logTimerState('UPDATE_TIMER_IN_CHAIN', { 
          timerId, 
          timerIndex, 
          updates,
          updatedTimer: newChain[timerIndex]
        });
      }
      return newChain;
    });
  };

  // Individual state setters
  const setRounds = (rounds: number) => {
    setTimerState(prev => ({
      ...prev,
      rounds: Math.max(1, Math.min(rounds, 20)), // 1-20 rounds
    }));
  };

  const setDuration = (duration: number) => {
    const clampedDuration = Math.max(0, Math.min(duration, 60)); // 0-60 minutes 
    setTimerState(prev => ({
      ...prev,
      duration: clampedDuration,
      timeRemaining: clampedDuration * 60,
    }));
  };

  const setRestTime = (rest: number) => {
    setTimerState(prev => ({
      ...prev,
      rest: Math.max(0, Math.min(rest, 3600)), // 0 seconds - 1 hour
    }));
  };

  const setPreparation = (preparation: number) => {
    setTimerState(prev => ({
      ...prev,
      preparation: Math.max(0, Math.min(preparation, 300)), // 0-300 seconds (5 minutes)
    }));
  };

  const setIsRunning = (isRunning: boolean) => {
    console.log('setIsRunning called:', isRunning);
    setTimerState(prev => ({
      ...prev,
      isRunning,
    }));
  };

  const setCurrentRound = (round: number) => {
    setTimerState(prev => ({
      ...prev,
      currentRound: Math.max(1, Math.min(round, prev.rounds)),
    }));
  };

  const setTimeRemaining = (time: number) => {
    setTimerState(prev => ({
      ...prev,
      timeRemaining: Math.max(0, time),
    }));
  };

  const setTimerType = (type: 'edit' | 'saved') => {
    setTimerState(prev => ({
      ...prev,
      timerType: type,
    }));
  };

  const setPresetName = (name?: string) => {
    setTimerState(prev => ({
      ...prev,
      presetName: name,
    }));
  };

  // Timer actions
  const startTimer = () => {
    const now = Date.now();
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      currentPhase: 'preparation',
      startTime: now,
      pausedTime: 0,
      timeRemaining: prev.preparation,
    }));
    logTimerState('START_TIMER', { startTime: now });
  };

  const startChain = () => {
    console.log('startChain called with chain length:', timerChain.length);
    if (timerChain.length > 0) {
      // Load first timer in chain
      const firstTimer = timerChain[0];
      const now = Date.now();
      
      console.log('Starting first timer:', firstTimer);
      
      setTimerState(prev => ({
        ...prev,
        rounds: firstTimer.rounds,
        duration: firstTimer.duration,
        rest: firstTimer.rest,
        preparation: firstTimer.preparation,
        isRunning: true,
        currentRound: 1,
        currentPhase: 'preparation',
        startTime: now,
        pausedTime: 0,
        timeRemaining: firstTimer.preparation,
      }));
      setCurrentChainIndex(0);
      
      logTimerState('START_CHAIN', { 
        firstTimer, 
        chainLength: timerChain.length,
        startTime: now 
      });
    } else {
      // Start with current timer settings when chain is empty
      const now = Date.now();
      
      console.log('Starting timer with current settings:', {
        rounds: timerState.rounds,
        duration: timerState.duration,
        rest: timerState.rest,
        preparation: timerState.preparation
      });
      
      setTimerState(prev => ({
        ...prev,
        isRunning: true,
        currentRound: 1,
        currentPhase: 'preparation',
        startTime: now,
        pausedTime: 0,
        timeRemaining: prev.preparation,
      }));
      setCurrentChainIndex(0);
      
      logTimerState('START_TIMER', { 
        currentSettings: {
          rounds: timerState.rounds,
          duration: timerState.duration,
          rest: timerState.rest,
          preparation: timerState.preparation
        },
        startTime: now 
      });
    }
  };

  // Redesigned pause / resume for countdown logic
  const pauseTimer = () => {
    lightFeedback();
    if (timerState.isRunning) {
      // PAUSE: simply stop the interval by setting isRunning false.
      // We keep timeRemaining as-is so UI shows the paused value.
      setTimerState(prev => ({
        ...prev,
        isRunning: false,
      }));
    } else {
      // RESUME: compute a new startTime so that countdown continues correctly.
      const now = Date.now();
      let targetTime = 0;
      if (timerState.currentPhase === 'work') {
        targetTime = timerState.duration * 60; // minutes → seconds
      } else if (timerState.currentPhase === 'rest') {
        targetTime = timerState.rest; // already seconds
      } else if (timerState.currentPhase === 'preparation') {
        targetTime = timerState.preparation; // seconds
      }

      // If targetTime is 0 (edge case) just resume immediately.
      const elapsedAlready = targetTime - timerState.timeRemaining; // seconds already spent in this phase
      const newStart = now - elapsedAlready * 1000; // back-date so elapsed calculation matches

      setTimerState(prev => ({
        ...prev,
        isRunning: true,
        startTime: newStart,
        pausedTime: 0, // reset paused tracking
      }));
    }
  };

  const resetTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      currentRound: 1,
      timeRemaining: prev.duration * 60,
    }));
  };

  const stopTimer = () => {
    lightFeedback();
    console.log('stopTimer called!');
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      currentRound: 1,
      currentPhase: 'idle',
      startTime: null,
      pausedTime: 0,
      timeRemaining: prev.duration * 60,
    }));
    setCurrentChainIndex(0);
  };

  // Preset functions
  const loadPreset = (presetName: string) => {
    const preset = timerPresets[presetName.toUpperCase()];
    if (preset) {
      // Load the first timer settings into the current timer state
      const firstTimer = preset.chain[0];
      setTimerState(prev => ({
        ...prev,
        rounds: firstTimer.rounds,
        duration: firstTimer.duration,
        rest: firstTimer.rest,
        preparation: firstTimer.preparation,
        timeRemaining: firstTimer.duration * 60,
        timerType: 'edit',
        presetName: preset.name,
      }));
      
      // Load the entire chain with unique IDs, preserving original preset names
      const chainWithIds = preset.chain.map((item, index) => ({
        ...item,
        id: `${Date.now()}-${index}`,
      }));
      
      setTimerChain(chainWithIds);
      setCurrentChainIndex(0);
      
      logTimerState('LOAD_PRESET', { 
        presetName, 
        firstTimer, 
        chainLength: chainWithIds.length,
        chainWithIds 
      });
    }
  };

  const loadSavedPreset = (savedPresetData: any) => {
    if (savedPresetData && savedPresetData.chain && savedPresetData.chain.length > 0) {
      // Load the first timer settings into the current timer state
      const firstTimer = savedPresetData.chain[0];
      setTimerState(prev => ({
        ...prev,
        rounds: firstTimer.rounds,
        duration: firstTimer.duration,
        rest: firstTimer.rest,
        preparation: firstTimer.preparation,
        timeRemaining: firstTimer.duration * 60,
        timerType: 'saved',
        presetName: savedPresetData.name,
      }));
      
      // Load the entire chain with unique IDs, preserving original timer names
      const chainWithIds = savedPresetData.chain.map((item: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        name: item.name,
        rounds: item.rounds,
        duration: item.duration,
        rest: item.rest,
        preparation: item.preparation,
      }));
      
      setTimerChain(chainWithIds);
      setCurrentChainIndex(0);
      
      logTimerState('LOAD_SAVED_PRESET', { 
        presetName: savedPresetData.name, 
        firstTimer, 
        chainLength: chainWithIds.length,
        chainWithIds 
      });
    }
  };

  const resetToDefaults = () => {
    console.log('resetToDefaults called! Current timer running:', timerState.isRunning);
    setTimerState(defaultTimerState);
    clearChain();
  };

  // Custom preset handling
  const handleStartCustomPreset = async (preset: any) => {
    if (preset && preset.chain && preset.chain.length > 0) {
      const now = Date.now();
      const firstTimer = preset.chain[0];
      setTimerState(prev => ({
        ...prev,
        rounds: firstTimer.rounds,
        duration: firstTimer.duration,
        rest: firstTimer.rest,
        preparation: firstTimer.preparation,
        isRunning: true,
        currentRound: 1,
        currentPhase: 'preparation',
        startTime: now,
        pausedTime: 0,
        timeRemaining: firstTimer.preparation,
        timerType: 'edit',
        presetName: preset.name || 'Custom Preset',
      }));
      setCurrentChainIndex(0);
      logTimerState('START_CUSTOM_PRESET', { presetName: preset.name, firstTimer, startTime: now });
    }
  };

  const handleQuickSavePreset = async () => {
    const now = Date.now();
    const presetName = `Quick Save ${new Date().toISOString().slice(0, 10)}`;
    const newPreset: SavedTimerPreset = {
      id: Date.now().toString(),
      name: presetName,
      description: 'Quickly saved preset',
      type: 'saved',
      createdAt: new Date().toISOString(),
      userId: 'temp_user_id', // Replace with actual user ID
      isPublic: false,
      chain: timerChain.map((item, index) => ({
        order: index,
        name: item.name,
        rounds: item.rounds,
        duration: item.duration,
        rest: item.rest,
        preparation: item.preparation,
      })),
      totalTimers: timerChain.length,
      totalDuration: getTotalChainTime(),
      totalRounds: timerState.rounds,
      tags: [],
    };

    // In a real app, you'd save this to Convex
    console.log('Quick saving preset:', newPreset);
    // For now, just reset to defaults to simulate saving
    resetToDefaults();
  };

  const saveCurrentAsPreset = async (presetName: string) => {
    const now = Date.now();
    const newPreset: SavedTimerPreset = {
      id: Date.now().toString(),
      name: presetName,
      description: 'Saved preset',
      type: 'saved',
      createdAt: new Date().toISOString(),
      userId: 'temp_user_id', // Replace with actual user ID
      isPublic: false,
      chain: timerChain.map((item, index) => ({
        order: index,
        name: item.name,
        rounds: item.rounds,
        duration: item.duration,
        rest: item.rest,
        preparation: item.preparation,
      })),
      totalTimers: timerChain.length,
      totalDuration: getTotalChainTime(),
      totalRounds: timerState.rounds,
      tags: [],
    };

    // In a real app, you'd save this to Convex
    console.log('Saving preset:', newPreset);
    // For now, just reset to defaults to simulate saving
    resetToDefaults();
  };

  // Timer interaction functions
  const handleTimerPress = (type: 'edit' | 'saved', presetName?: string) => {
    console.log('handleTimerPress called:', type, presetName);
    lightFeedback();    
    if (type === 'edit') {
      setSelectedPresetName(presetName || '');
      setPresetModalVisible(true);
      console.log('Setting preset modal visible');
    } else {
      setSelectedPresetName(presetName || ''); // presetName will be provided for saved presets
      setCustomModalVisible(true);
      console.log('Setting custom modal visible');
    }
  };

  const handleClosePresetModal = () => {
    setPresetModalVisible(false);
    setSelectedPresetName('');
  };

  const handleCloseCustomModal = () => {
    setCustomModalVisible(false);
    setSelectedPresetName('');
  };

  const handleStartPreset = (presetName: string) => {
    // Load the preset and set a pending start flag
    loadPreset(presetName);
    pendingStartRef.current = true;
    setSelectedPresetName("");
  };

  /* --------------------------------------------------------------------------------------------

  // NOTE :
  end timer chain functions.

  ---------------------------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------------------------

  // SECTION :
  utility functions.

  ---------------------------------------------------------------------------------------------- */

  // Utility functions
  const incrementRounds = () => {
    setRounds(timerState.rounds + 1);
  };

  const decrementRounds = () => {
    setRounds(timerState.rounds - 1);
  };

  const incrementDuration = () => {
    const currentIndex = durationOptions.findIndex(option => option === timerState.duration);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % durationOptions.length : 1;
    setDuration(durationOptions[nextIndex]);
  };

  const decrementDuration = () => {
    const currentIndex = durationOptions.findIndex(option => option === timerState.duration);
    const prevIndex = currentIndex >= 0 ? (currentIndex - 1 + durationOptions.length) % durationOptions.length : durationOptions.length - 1;
    setDuration(durationOptions[prevIndex]);
  };

  const incrementRest = () => {
    const currentIndex = restOptions.findIndex(option => option === timerState.rest);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % restOptions.length : 1;
    setRestTime(restOptions[nextIndex]);
  };

  const decrementRest = () => {
    const currentIndex = restOptions.findIndex(option => option === timerState.rest);
    const prevIndex = currentIndex >= 0 ? (currentIndex - 1 + restOptions.length) % restOptions.length : restOptions.length - 1;
    setRestTime(restOptions[prevIndex]);
  };

  const incrementPreparation = () => {
    const currentIndex = preparationOptions.findIndex(option => option === timerState.preparation);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % preparationOptions.length : 1;
    setPreparation(preparationOptions[nextIndex]);
  };

  const decrementPreparation = () => {
    const currentIndex = preparationOptions.findIndex(option => option === timerState.preparation);
    const prevIndex = currentIndex >= 0 ? (currentIndex - 1 + preparationOptions.length) % preparationOptions.length : preparationOptions.length - 1;
    setPreparation(preparationOptions[prevIndex]);
  };

  // Formatting functions
  const formatTime = (seconds: number): string => {
    if (seconds === 0) {
      return '0';
    }
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
  };

  // Format time for countdown display (MM:SS format)
  const formatCountdownTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes === 0) {
      return '0';
    }
    if (minutes < 1) {
      const seconds = Math.round(minutes * 60);
      return `${seconds}s`;
    }
    // Check if it's a whole number of minutes
    if (minutes === Math.floor(minutes)) {
      return `${Math.floor(minutes)} min`;
    }
    // For fractional minutes, convert to seconds
    const totalSeconds = Math.round(minutes * 60);
    if (totalSeconds < 60) {
      return `${totalSeconds}s`;
    }
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
  };

  // Add a specific function for formatting rest time (which is stored in seconds)
  const formatRestTime = (restSeconds: number): string => {
    if (restSeconds === 0) {
      return '0s';
    }
    if (restSeconds < 60) {
      return `${restSeconds}s`;
    }
    const mins = Math.floor(restSeconds / 60);
    const secs = restSeconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
  };

  const getTotalChainTime = (): string => {
    const totalSeconds = timerChain.reduce((total, timer) => {
      const timerDuration = timer.rounds * timer.duration * 60; // Total work time
      const restTime = (timer.rounds - 1) * timer.rest; // Rest between rounds
      const prepTime = timer.preparation; // Preparation time
      return total + timerDuration + restTime + prepTime;
    }, 0);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Calculate preset metadata
  const getPresetMetadata = (presetName: string) => {
    const preset = timerPresets[presetName.toUpperCase()];
    if (!preset) return { totalTimers: 0, totalDuration: '0m' };

    const totalTimers = preset.chain.length;

    // Calculate total time using same logic as getTotalChainTime
    const totalSeconds = preset.chain.reduce((total: number, timer: any) => {
      const timerDuration = timer.rounds * timer.duration * 60; // Total work time
      const restTime = (timer.rounds - 1) * timer.rest; // Rest between rounds
      const prepTime = timer.preparation; // Preparation time
      return total + timerDuration + restTime + prepTime;
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const totalDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return { totalTimers, totalDuration };
  };

  // Get preset timers array
  const getPresetTimers = () => {
    return [
      {
        name: 'WORK OUT',
        ...getPresetMetadata('WORK OUT'),
      },
      {
        name: 'WORK IN',
        ...getPresetMetadata('WORK IN'),
      },
      {
        name: 'WORK FLOW',
        ...getPresetMetadata('WORK FLOW'),
      },
    ];
  };

  // Debug logging function
  const logTimerState = (action: string, additionalData?: any) => {
    if (additionalData) {
    }
  };

  // NOTE - Sound playback function
  const playTimerSound = async (soundKey: keyof typeof SoundAssets) => {
    try {

      // Unload previous sound if it exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      
      if (wantsTimerSounds) {
        const { sound } = await Audio.Sound.createAsync(SoundAssets[soundKey].id);
        soundRef.current = sound;
        await sound.playAsync();
        console.log('Sound Played', sound)
      } else {
        console.log('Sound not played', soundKey)
      }
     
    } catch (error) {
      console.error(`Error playing sound ${soundKey}:`, error);
    }
  };

  const cycleTimerMode = () => {
    setIsSwitchingTimerMode(true);
    
    const modes = ['Classic', 'Workout', 'Workflow', 'Work-In'] as const;
    const currentIndex = modes.indexOf(timerMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setTimerMode(modes[nextIndex]);

    setTimeout(() => {
      setIsSwitchingTimerMode(false);
    }, 361);
  };

  /* --------------------------------------------------------------------------------------------

  // NOTE :
  end utility functions.

  ---------------------------------------------------------------------------------------------- */

  return (
    <LotusTimerContext.Provider value={{
      wantsTimerSounds,
      setWantsTimerSounds,
      isSwitchingTimerMode,
      setIsSwitchingTimerMode,
      timerMode,
      setTimerMode,
      timerState,
      setTimerState,
      timerChain,
      currentChainIndex,
      currentTimer,
      nextTimer,
      addToChain,
      removeFromChain,
      clearChain,
      moveChainItem,
      updateTimerInChain,
      presets: timerPresets,
      loadPreset,
      loadSavedPreset,
      resetToDefaults,
      getPresetMetadata,
      getPresetTimers,
      handleStartCustomPreset,
      handleQuickSavePreset,
      saveCurrentAsPreset,
      presetModalVisible,
      customModalVisible,
      selectedPresetName,
      setPresetModalVisible,
      setCustomModalVisible,
      setSelectedPresetName,
      handleTimerPress,
      handleClosePresetModal,
      handleCloseCustomModal,
      handleStartPreset,
      setRounds,
      setDuration,
      setRest: setRestTime,
      setPreparation,
      setIsRunning,
      setCurrentRound,
      setTimeRemaining,
      setTimerType,
      setPresetName,
      startTimer,
      startChain,
      pauseTimer,
      resetTimer,
      stopTimer,
      incrementRounds,
      decrementRounds,
      incrementDuration,
      decrementDuration,
      incrementRest,
      decrementRest,
      incrementPreparation,
      decrementPreparation,
      formatTime,
      formatCountdownTime,
      formatDuration,
      formatRestTime,
      getTotalChainTime,
      playTimerSound,
      cycleTimerMode,
      // Debug function
      logTimerState,
    }}>
      {children}
    </LotusTimerContext.Provider>
  );
};

export const useLotusTimer = () => {
  const context = useContext(LotusTimerContext);
  if (!context) {
    throw new Error('useLotusTimer must be used within a LotusTimerProvider');
  }
  return context;
}; 