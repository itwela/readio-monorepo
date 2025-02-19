import { useState } from 'react';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LayoutChangeEvent } from 'react-native';

export const useProgressQueue = () => {
  const [width, setWidth] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [generationStarted, setGenerationStarted] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");

  const offset = useSharedValue<number>(0);
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const handleProgressContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setWidth(width);
    console.log('Element width:', width);
  };

  const progressValues = {
    // 0 -------
    INITIAL_ZERO: 0,
    // 1 -------
    START_ONE: 5,
    // 2 -------
    PROCESSING_TWO: 15,
    // 3 -------
    HALFWAY_THREE: 50,
    // 4 -------
    MIDWAY_FOUR: 35,
    // 5 -------
    ADVANCED_FIVE: 60,
    // 6 -------
    NEAR_COMPLETE_SIX: 80,
    // 7 -------
    COMPLETE_SEVEN: 100
  } as const;

  const ProgressQueue = {
    isProcessing: false,
    queue: [] as number[],

    async process() {
      if (this.isProcessing || this.queue.length === 0) return;
      
      this.isProcessing = true;
      const progressValue = this.queue.shift()!;
      
      const calculatedProgress = (progressValue / 100) * width;
      setProgress(calculatedProgress);
      offset.value = withSpring(calculatedProgress);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      this.isProcessing = false;
      this.process();
    },

    updateProgress(stage: keyof typeof progressValues) {
      const value = progressValues[stage];
      this.queue.push(value);
      if (!this.isProcessing) {
        this.process();
      }
    },

    resetQueue() {
      this.queue = [];
      this.isProcessing = false;
      setProgress(0);
      offset.value = withSpring(0);
    }
  };

  return {
    width,
    progress,
    progressRef: offset,
    animatedStyles,
    generationStarted,
    progressMessage,
    setGenerationStarted,
    setProgressMessage,
    handleProgressContainerLayout,
    ProgressQueue,
    progressValues
  };
};