'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Readio } from '@/types/type';
// import { Track } from 'react-native-track-player';

interface ReadioContextType {
  readioSelectedTopics?: string[];
  setReadioSelectedTopics?: (value: string[]) => void;
  readioSelectedReadioId?: number;
  setReadioSelectedReadioId?: (value: number) => void;
  readioSelectedPlaylistId?: number;
  setReadioSelectedPlaylistId?: (value: number) => void;
  // activeTrack?: Readio | undefined;
  // setActiveTrack?: (track: Track) => void;
  isFavorite?: boolean;
  setIsFavorite?: (value: boolean) => void;
  wantsToUpdateFavoriteStatus?: boolean,
  setWantsToUpdateFavoriteStatus?: (value: boolean) => void;
  readioIsGeneratingRadio?: boolean;
  setReadioIsGeneratingRadio?: (value: boolean) => void;
  playerMode?: string;
  setPlayerMode?: (value: string) => void;
  activeStationName?: string;
  setActiveStationName?: (value: string) => void;
  activeStationId?: number;
  setActiveStationId?: (value: number) => void;
  isSignedInLotus?: boolean;
  setIsSignedInLotus?: (value: boolean) => void;
}

const ReadioContext = createContext<ReadioContextType | null>(null);

export const ReadioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [readioSelectedTopics, setReadioSelectedTopics] = useState<string[]>([]);
    const [readioSelectedReadioId, setReadioSelectedReadioId] = useState<number>();
    const [readioSelectedPlaylistId, setReadioSelectedPlaylistId] = useState<number>();
    const [activeTrack, setActiveTrack] = useState<Readio | undefined>();
    const [isFavorite, setIsFavorite] = useState<boolean | undefined>();
    const [wantsToUpdateFavoriteStatus, setWantsToUpdateFavoriteStatus] = useState<boolean>(false);
    const [readioIsGeneratingRadio, setReadioIsGeneratingRadio] = useState(false);
    const [playerMode, setPlayerMode] = useState<string>("");
    const [activeStationName, setActiveStationName] = useState<string>("");
    const [activeStationId, setActiveStationId] = useState<number>(0);
    const [isSignedInLotus, setIsSignedInLotus] = useState<boolean>(false);


  return (
    <ReadioContext.Provider value={{
        readioSelectedTopics,
        setReadioSelectedTopics,
        readioSelectedReadioId,
        setReadioSelectedReadioId,
        readioSelectedPlaylistId,
        setReadioSelectedPlaylistId,
        // activeTrack,
        // setActiveTrack,
        isFavorite,
        setIsFavorite,
        wantsToUpdateFavoriteStatus,
        setWantsToUpdateFavoriteStatus,
        readioIsGeneratingRadio,
        setReadioIsGeneratingRadio,
        playerMode,
        setPlayerMode,
        activeStationName,
        setActiveStationName,
        activeStationId,
        setActiveStationId,
        isSignedInLotus,
        setIsSignedInLotus,
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