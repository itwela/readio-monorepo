import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LotusArticle } from '@/types/type';

interface LotusPlayerContextType {
  playerTopic?: any;
  setPlayerTopic?: (value: any) => void;
  readioSelectedTopics?: any;
  setReadioSelectedTopics?: (value: any) => void;
  readioSelectedReadioId?: number;
  setReadioSelectedReadioId?: (value: number) => void;
  readioSelectedPlaylistId?: number;
  setReadioSelectedPlaylistId?: (value: number) => void;
  isFavorite?: boolean;
  setIsFavorite?: (value: boolean) => void;
  wantsToUpdateFavoriteStatus?: boolean;
  setWantsToUpdateFavoriteStatus?: (value: boolean) => void;
  readioIsGeneratingRadio?: boolean;
  setReadioIsGeneratingRadio?: (value: boolean) => void;
  playerMode?: string;
  setPlayerMode?: (value: string) => void;
  activeStationName?: string;
  setActiveStationName?: (value: string) => void;
  activeStationId?: number;
  setActiveStationId?: (value: number) => void;
  selectedReadios?: LotusArticle[];
  setSelectedReadios?: (value: LotusArticle[]) => void;
  selectedLotusReadios?: any;
  setSelectedLotusReadios?: (value: any) => void;
  floatingPlayerIsVisible?: boolean;
  setFloatingPlayerIsVisible?: (value: boolean) => void;
  linerNoteTopic?: string;
  setLinerNoteTopic?: (value: string) => void;
}

const LotusPlayerContext = createContext<LotusPlayerContextType | null>(null);

export const LotusPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playerTopic, setPlayerTopic] = useState<any>();
  const [readioSelectedTopics, setReadioSelectedTopics] = useState<any>();
  const [readioSelectedReadioId, setReadioSelectedReadioId] = useState<number>();
  const [readioSelectedPlaylistId, setReadioSelectedPlaylistId] = useState<number>();
  const [isFavorite, setIsFavorite] = useState<boolean>();
  const [wantsToUpdateFavoriteStatus, setWantsToUpdateFavoriteStatus] = useState<boolean>(false);
  const [readioIsGeneratingRadio, setReadioIsGeneratingRadio] = useState(false);
  const [playerMode, setPlayerMode] = useState<string>("");
  const [activeStationName, setActiveStationName] = useState<string>("");
  const [activeStationId, setActiveStationId] = useState<number>(0);
  const [selectedReadios, setSelectedReadios] = useState<LotusArticle[]>([]);
  const [selectedLotusReadios, setSelectedLotusReadios] = useState<any>([]);
  const [floatingPlayerIsVisible, setFloatingPlayerIsVisible] = useState<boolean>(false);
  const [linerNoteTopic, setLinerNoteTopic] = useState<string>("");

  return (
    <LotusPlayerContext.Provider value={{
      playerTopic,
      setPlayerTopic,
      readioSelectedTopics,
      setReadioSelectedTopics,
      readioSelectedReadioId,
      setReadioSelectedReadioId,
      readioSelectedPlaylistId,
      setReadioSelectedPlaylistId,
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
      selectedReadios,
      setSelectedReadios,
      selectedLotusReadios,
      setSelectedLotusReadios,
      floatingPlayerIsVisible,
      setFloatingPlayerIsVisible,
      linerNoteTopic,
      setLinerNoteTopic,
    }}>
      {children}
    </LotusPlayerContext.Provider>
  );
};

export const useLotusPlayer = () => {
  const context = useContext(LotusPlayerContext);
  if (!context) throw new Error('useLotusPlayer must be used within a LotusPlayerProvider');
  return context;
};