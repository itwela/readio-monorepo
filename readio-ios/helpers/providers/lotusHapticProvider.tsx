import React, { createContext, useContext, ReactNode } from 'react';
import * as Haptics from 'expo-haptics';

// TODO
interface LotusHapticContextType {
  // Essential haptic feedback functions
  lightFeedback: () => void;
  mediumFeedback: () => void;
  heavyFeedback: () => void;
  successFeedback: () => void;
  errorFeedback: () => void;
  warningFeedback: () => void;
  // Specialized app-specific feedback
  meditationTransition: () => void;
  stepMilestone: () => void;
  articleSaved: () => void;
  playbackControl: () => void;
  // Interval timer specific
  intervalTimerStart: () => void;
  intervalTimerComplete: () => void;
}

const LotusHapticContext = createContext<LotusHapticContextType | null>(null);

export const LotusHapticProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Basic feedback patterns
  const lightFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const mediumFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const heavyFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  // Notification feedback patterns
  const successFeedback = () => { 
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const errorFeedback = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const warningFeedback = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  // App-specific feedback patterns
  const meditationTransition = () => {
    // Gentle transition feedback for meditation sessions
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 300);
  };

  const stepMilestone = () => {
    // Celebration feedback for reaching step goals
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 150);
  };

  const articleSaved = () => {
    // Quick confirmation feedback for saving articles
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 100);
  };

  const playbackControl = () => {
    // Simple feedback for media controls
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Interval timer feedback patterns
  const intervalTimerStart = () => {
    // 3 medium taps quickly
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 100);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 200);
  };

  const intervalTimerComplete = () => {
    // Longer heavy vibration
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  return (
    <LotusHapticContext.Provider
      value={{
        lightFeedback,
        mediumFeedback,
        heavyFeedback,
        successFeedback,
        errorFeedback,
        warningFeedback,
        meditationTransition,
        stepMilestone,
        articleSaved,
        playbackControl,
        intervalTimerStart,
        intervalTimerComplete,
      }}
    >
      {children}
    </LotusHapticContext.Provider>
  );
};

export const useLotusHaptic = () => {
  const context = useContext(LotusHapticContext);
  if (!context) {
    throw new Error('useLotusHaptic must be used within a LotusHapticProvider');
  }
  return context;
};