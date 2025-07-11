import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { useLotusNotifications } from './LotusNotificationProvider';

interface TimerState {
  rounds: number;
  duration: number; // in minutes
  interval: number; // in seconds
  preparation: number; // in seconds
  isRunning: boolean;
  currentRound: number;
  timeRemaining: number; // in seconds
  timerType: 'preset' | 'custom';
  presetName?: string;
  // New timer execution state
  currentPhase: 'preparation' | 'work' | 'rest' | 'complete' | 'idle';
  startTime: number | null;
  pausedTime: number;
}

interface TimerChainItem {
  id: string;
  name: string;
  rounds: number;
  duration: number; // in minutes
  interval: number; // in seconds
  preparation: number; // in seconds
}

// New interface for preset chains
interface PresetChain {
  name: string;
  chain: Omit<TimerChainItem, 'id'>[];
}

// Interface for custom presets to save to Convex
interface CustomTimerPreset {
  // Preset metadata
  id: string;
  name: string;
  description: string;
  type: 'custom';
  createdAt: string; // ISO date string
  userId: string;
  isPublic: boolean;
  
  // Timer chain data
  chain: {
    order: number;
    name: string;
    rounds: number;
    duration: number; // in minutes
    interval: number; // in seconds (rest between rounds)
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
  resetToDefaults: () => void;
  
  // Individual state setters
  setRounds: (rounds: number) => void;
  setDuration: (duration: number) => void;
  setInterval: (interval: number) => void;
  setPreparation: (preparation: number) => void;
  setIsRunning: (isRunning: boolean) => void;
  setCurrentRound: (round: number) => void;
  setTimeRemaining: (time: number) => void;
  setTimerType: (type: 'preset' | 'custom') => void;
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
  incrementInterval: () => void;
  decrementInterval: () => void;
  incrementPreparation: () => void;
  decrementPreparation: () => void;
  
  // Formatting
  formatTime: (seconds: number) => string;
  formatDuration: (minutes: number) => string;
  getTotalChainTime: () => string;
  
  // Debug
  logTimerState: (action: string, additionalData?: any) => void;
}

const LotusTimerContext = createContext<LotusTimerContextType | null>(null);

const defaultTimerState: TimerState = {
  rounds: 3,
  duration: 3, // 3 minutes default
  interval: 10, // 10 seconds default (start at 10)
  preparation: 10, // 10 seconds default
  isRunning: false,
  currentRound: 1,
  timeRemaining: 180, // 3 minutes in seconds
  timerType: 'custom',
  presetName: undefined,
  currentPhase: 'idle',
  startTime: null,
  pausedTime: 0,
};

// Enhanced presets with predefined chains
const timerPresets: Record<string, PresetChain> = {
  'WORKOUT': {
    name: 'WORKOUT',
    chain: [
      {
        name: 'Timer 1',
        rounds: 1,
        duration: 0.5, // 30 second warm-up
        interval: 0,
        preparation: 10,
      },
      {
        name: 'Timer 2',
        rounds: 4,
        duration: 3, // 3 minutes per round
        interval: 60, // 1 minute rest
        preparation: 15,
      },
      {
        name: 'Timer 3',
        rounds: 1,
        duration: 3, // 3 minute active recovery
        interval: 0,
        preparation: 10,
      },
      {
        name: 'Timer 4',
        rounds: 4,
        duration: 2, // 2 minutes per round (shorter)
        interval: 45, // 45 second rest
        preparation: 10,
      },
      {
        name: 'Timer 5',
        rounds: 1,
        duration: 5, // 5 minute cool down
        interval: 0,
        preparation: 10,
      },
    ],
  },
  'YOGA': {
    name: 'YOGA',
    chain: [
      {
        name: 'Timer 1',
        rounds: 1,
        duration: 5, // 5 minute centering
        interval: 0,
        preparation: 30,
      },
      {
        name: 'Timer 2',
        rounds: 3,
        duration: 8, // 8 minutes per flow section
        interval: 60, // 1 minute transition
        preparation: 15,
      },
      {
        name: 'Timer 3',
        rounds: 1,
        duration: 10, // 10 minute deep pose holds
        interval: 0,
        preparation: 30,
      },
      {
        name: 'Timer 4',
        rounds: 1,
        duration: 7, // 7 minute meditation
        interval: 0,
        preparation: 60, // 1 minute to settle
      },
    ],
  },
  'WORKFLOW': {
    name: 'WORKFLOW',
    chain: [
      {
        name: 'Timer 1',
        rounds: 1,
        duration: 10, // 10 minute planning
        interval: 0,
        preparation: 5,
      },
      {
        name: 'Timer 2',
        rounds: 4,
        duration: 25, // 25 minute pomodoros
        interval: 300, // 5 minute breaks
        preparation: 5,
      },
      {
        name: 'Timer 3',
        rounds: 1,
        duration: 15, // 15 minute break
        interval: 0,
        preparation: 5,
      },
      {
        name: 'Timer 4',
        rounds: 4,
        duration: 25, // 25 minute pomodoros
        interval: 300, // 5 minute breaks
        preparation: 5,
      },
      {
        name: 'Timer 5',
        rounds: 1,
        duration: 90, // 90 minute deep work session
        interval: 0,
        preparation: 10,
      },
      {
        name: 'Timer 6',
        rounds: 1,
        duration: 15, // 15 minute review
        interval: 0,
        preparation: 5,
      },
    ],
  },
};

// Export the CustomTimerPreset type for use in other components
export type { CustomTimerPreset };

export const LotusTimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timerState, setTimerState] = useState<TimerState>(defaultTimerState);
  const [timerChain, setTimerChain] = useState<TimerChainItem[]>([]);
  const [currentChainIndex, setCurrentChainIndex] = useState(0);
  const [currentTimer, setCurrentTimer] = useState<TimerChainItem | null>(null);
  const [nextTimer, setNextTimer] = useState<TimerChainItem | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Get notification functions
  const { scheduleNotification } = useLotusNotifications();

  // Debug logging function
  const logTimerState = (action: string, additionalData?: any) => {
    console.log(`🎯 TIMER DEBUG [${action}] ============================`);
    console.log('📊 Timer State:', {
      rounds: timerState.rounds,
      duration: timerState.duration,
      interval: timerState.interval,
      preparation: timerState.preparation,
      isRunning: timerState.isRunning,
      currentRound: timerState.currentRound,
      timeRemaining: timerState.timeRemaining,
      timerType: timerState.timerType,
      presetName: timerState.presetName,
      currentPhase: timerState.currentPhase,
    });
    console.log('🔗 Timer Chain:', timerChain.map((item, index) => ({
      index,
      id: item.id,
      name: item.name,
      rounds: item.rounds,
      duration: item.duration,
      interval: item.interval,
      preparation: item.preparation,
    })));
    console.log('📍 Chain Info:', {
      chainLength: timerChain.length,
      currentChainIndex,
      currentTimer: currentTimer?.name || 'none',
      nextTimer: nextTimer?.name || 'none',
    });
    if (additionalData) {
      console.log('📝 Additional Data:', additionalData);
    }
    console.log('🎯 ======================================================');
  };

  // Notification helper function
  const sendTimerNotification = async (title: string, body: string) => {
    try {
      await scheduleNotification(title, body, null, { type: 'timer_update' });
      console.log('🔔 Timer notification sent:', title);
    } catch (error) {
      console.error('❌ Failed to send timer notification:', error);
    }
  };

  // Main timer logic - runs every second when timer is active
  useEffect(() => {

    if (timerState.isRunning && timerState.startTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedTotal = Math.floor((now - timerState.startTime!) / 1000) - timerState.pausedTime;
        
        let phaseTime = 0;
        let currentPhase = timerState.currentPhase;
        let currentRound = timerState.currentRound;
        let timeRemaining = timerState.timeRemaining;

        // Calculate current phase and time remaining
        if (currentPhase === 'preparation') {
          phaseTime = timerState.preparation - elapsedTotal;
          if (phaseTime <= 0) {
            // Move to work phase
            currentPhase = 'work';
            phaseTime = timerState.duration * 60;
            const currentTimerName = timerChain[currentChainIndex]?.name || `Timer ${currentChainIndex + 1}`;
            sendTimerNotification(
              '💪 Work Time!', 
              `${currentTimerName} - Round ${timerState.currentRound} started!`
            );
            setTimerState(prev => ({
              ...prev,
              currentPhase: 'work',
              startTime: now,
              pausedTime: 0,
            }));
            return;
          }

        } else if (currentPhase === 'work') {
          phaseTime = (timerState.duration * 60) - elapsedTotal;
          if (phaseTime <= 0) {
            // Check if this is the last round
            if (currentRound >= timerState.rounds) {
              // Move to next timer in chain or complete
              if (timerChain.length > 0 && currentChainIndex < timerChain.length - 1) {
                // Load next timer in chain
                const nextTimer = timerChain[currentChainIndex + 1];
                sendTimerNotification(
                  '🏃 Get Ready!', 
                  `Preparing for ${nextTimer.name}...`
                );
                setTimerState(prev => ({
                  ...prev,
                  rounds: nextTimer.rounds,
                  duration: nextTimer.duration,
                  interval: nextTimer.interval,
                  preparation: nextTimer.preparation,
                  currentRound: 1,
                  currentPhase: 'preparation',
                  startTime: now,
                  pausedTime: 0,
                  timeRemaining: nextTimer.preparation,
                }));
                setCurrentChainIndex(prev => {
                  console.log('🔄 Chain index updating from', prev, 'to', prev + 1);
                  return prev + 1;
                });

                return;

              } else {
                // Timer complete
                currentPhase = 'complete';
                sendTimerNotification(
                  '🎉 Workout Complete!', 
                  'Great job! You completed your entire workout!'
                );
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
              phaseTime = timerState.interval;
              const currentTimerName = timerChain[currentChainIndex]?.name || `Timer ${currentChainIndex + 1}`;
              sendTimerNotification(
                '😮‍💨 Rest Time!', 
                `${currentTimerName} - Round ${currentRound} complete. Take a ${timerState.interval}s break!`
              );
              setTimerState(prev => ({
                ...prev,
                currentPhase: 'rest',
                startTime: now,
                pausedTime: 0,
              }));
              return;
            }
          }
          
        } else if (currentPhase === 'rest') {
          phaseTime = timerState.interval - elapsedTotal;
          if (phaseTime <= 0) {
            // Move to next round
            currentRound = currentRound + 1;
            currentPhase = 'work';
            phaseTime = timerState.duration * 60;
            const currentTimerName = timerChain[currentChainIndex]?.name || `Timer ${currentChainIndex + 1}`;
            sendTimerNotification(
              '💪 Next Round!', 
              `${currentTimerName} - Round ${currentRound} of ${timerState.rounds} starting!`
            );
            setTimerState(prev => ({
              ...prev,
              currentRound: currentRound,
              currentPhase: 'work',
              startTime: now,
              pausedTime: 0,
            }));
            return;
          }
        }

        // Update time remaining
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
  }, [timerState.isRunning, timerState.startTime, timerState.currentPhase, timerState.currentRound, currentChainIndex, timerChain]);

  // Update current and next timer based on phase and chain index
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer Chain functions
  const addToChain = (name: string) => {
    const newItem: TimerChainItem = {
      id: Date.now().toString(),
      name,
      rounds: timerState.rounds,
      duration: timerState.duration,
      interval: timerState.interval,
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
    const clampedDuration = Math.max(0.1, Math.min(duration, 60)); // 0.1-60 minutes (6 seconds minimum)
    setTimerState(prev => ({
      ...prev,
      duration: clampedDuration,
      timeRemaining: clampedDuration * 60,
    }));
  };

  const setIntervalTime = (interval: number) => {
    setTimerState(prev => ({
      ...prev,
      interval: Math.max(10, Math.min(interval, 300)), // 10 seconds - 5 minutes
    }));
  };

  const setPreparation = (preparation: number) => {
    setTimerState(prev => ({
      ...prev,
      preparation: Math.max(0, Math.min(preparation, 60)), // 0-60 seconds
    }));
  };

  const setIsRunning = (isRunning: boolean) => {
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

  const setTimerType = (type: 'preset' | 'custom') => {
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
    const timerName = timerState.presetName || 'Custom Timer';
    sendTimerNotification(
      '🚀 Timer Started!', 
      `${timerName} - Get ready for ${timerState.preparation}s preparation!`
    );
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      currentPhase: 'preparation',
      startTime: now,
      pausedTime: 0,
      timeRemaining: prev.preparation,
    }));
    logTimerState('START_TIMER', { timerName, startTime: now });
  };

    const startChain = () => {
    if (timerChain.length > 0) {
      // Load first timer in chain
      const firstTimer = timerChain[0];
      const now = Date.now();
      const chainName = timerState.presetName || 'Custom Chain';
      sendTimerNotification(
        '🏁 Chain Started!', 
        `${chainName} - Preparing for ${firstTimer.name}...`
      );
      
      setTimerState(prev => ({
        ...prev,
        rounds: firstTimer.rounds,
        duration: firstTimer.duration,
        interval: firstTimer.interval,
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
        chainName, 
        firstTimer, 
        chainLength: timerChain.length,
        startTime: now 
      });
    }
  };

  const pauseTimer = () => {
    if (timerState.isRunning) {
      // Pause - calculate paused time
      const now = Date.now();
      const elapsedTotal = timerState.startTime ? Math.floor((now - timerState.startTime) / 1000) : 0;
      setTimerState(prev => ({
        ...prev,
        isRunning: false,
        pausedTime: prev.pausedTime + elapsedTotal,
      }));
    } else {
      // Resume - reset start time
      setTimerState(prev => ({
        ...prev,
        isRunning: true,
        startTime: Date.now(),
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
        interval: firstTimer.interval,
        preparation: firstTimer.preparation,
        timeRemaining: firstTimer.duration * 60,
        timerType: 'preset',
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

  const resetToDefaults = () => {
    setTimerState(defaultTimerState);
    clearChain();
  };

  // Utility functions
  const incrementRounds = () => {
    setRounds(timerState.rounds + 1);
  };

  const decrementRounds = () => {
    setRounds(timerState.rounds - 1);
  };

  const incrementDuration = () => {
    setDuration(timerState.duration + 1);
  };

  const decrementDuration = () => {
    setDuration(timerState.duration - 1);
  };

  const incrementInterval = () => {
    setIntervalTime(timerState.interval + 5); // Changed to increment by 5
  };

  const decrementInterval = () => {
    setIntervalTime(timerState.interval - 5); // Changed to decrement by 5
  };

  const incrementPreparation = () => {
    setPreparation(timerState.preparation + 5);
  };

  const decrementPreparation = () => {
    setPreparation(timerState.preparation - 5);
  };

  // Formatting functions
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 1) {
      const seconds = Math.round(minutes * 60);
      return `${seconds}s`;
    }
    return `${minutes} min`;
  };

  const getTotalChainTime = (): string => {
    const totalSeconds = timerChain.reduce((total, timer) => {
      const timerDuration = timer.rounds * timer.duration * 60; // Total work time
      const restTime = (timer.rounds - 1) * timer.interval; // Rest between rounds
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

  return (
    <LotusTimerContext.Provider value={{
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
      resetToDefaults,
      setRounds,
      setDuration,
      setInterval: setIntervalTime,
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
      incrementInterval,
      decrementInterval,
      incrementPreparation,
      decrementPreparation,
      formatTime,
      formatDuration,
      getTotalChainTime,
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