'use client'
import { useRef, useState } from 'react';

// Custom hook for progress management
export const useProgress = () => {
  const [width, setWidth] = useState<number>(0);
  // Progress value array for different stages
  const progressValues = {
    INITIAL: 0,
    START: 5,
    PROCESSING: 15,
    MIDWAY: 35,
    HALFWAY: 50,
    ADVANCED: 60,
    NEAR_COMPLETE: 80,
    COMPLETE: 100
  } as const;
  
  const [progress, setProgress] = useState<number>(0);
  const [generationStarted, setGenerationStarted] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  
  // Use ref for animation
  const progressRef = useRef<HTMLDivElement>(null);

  const handleProgressContainerLayout = () => {
    if (progressRef.current) {
      const width = progressRef.current.getBoundingClientRect().width;
      setWidth(width);
      console.log('Element width:', width);
    }
  };

  // Progress queue implementation with improved type safety
  const ProgressQueue = {
    isProcessing: false,
    queue: [] as number[],
    
    async process() {
      if (this.isProcessing || this.queue.length === 0) return;
      
      this.isProcessing = true;
      const progressValue = this.queue.shift()!;
      
      const calculatedProgress = (progressValue / 100) * width;
      setProgress(calculatedProgress);
      
      if (progressRef.current) {
        progressRef.current.style.transform = `translateX(${calculatedProgress}px)`;
        progressRef.current.style.transition = 'transform 0.3s ease-out';
      }
      
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
      if (progressRef.current) {
        progressRef.current.style.transform = 'translateX(0)';
      }
    }
  };

  return {
    width,
    progress,
    progressRef,
    generationStarted,
    progressMessage,
    setGenerationStarted,
    setProgressMessage,
    handleProgressContainerLayout,
    ProgressQueue,
    progressValues
  };
};