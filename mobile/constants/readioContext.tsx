'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Readio } from '@/types/type';
import { Track } from 'react-native-track-player';

interface ReadioContextType {
  readioSelectedTopics?: string[];
  setReadioSelectedTopics?: (value: string[]) => void;
  readioSelectedReadioId?: number;
  setReadioSelectedReadioId?: (value: number) => void;
  activeTrack?: Readio | undefined;
  setActiveTrack?: (track: Track) => void;
  isFavorite?: boolean;
  setIsFavorite?: (value: boolean) => void;
}

const ReadioContext = createContext<ReadioContextType | null>(null);

export const ReadioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [readioSelectedTopics, setReadioSelectedTopics] = useState<string[]>([]);
    const [readioSelectedReadioId, setReadioSelectedReadioId] = useState<number>();
    const [activeTrack, setActiveTrack] = useState<Readio | undefined>();
    const [isFavorite, setIsFavorite] = useState<boolean | undefined>();

  return (
    <ReadioContext.Provider value={{
        readioSelectedTopics,
        setReadioSelectedTopics,
        readioSelectedReadioId,
        setReadioSelectedReadioId,
        activeTrack,
        setActiveTrack,
        isFavorite,
        setIsFavorite
    }}>
      {children}
    </ReadioContext.Provider>
  );
};

export const useReadio = (match?: string) => {
  const context = useContext(ReadioContext);
  if (!context) throw new Error('useReadio must be used within a QuizProvider');
  return context;
};