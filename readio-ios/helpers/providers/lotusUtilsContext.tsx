import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { LotusArticle } from '@/types/type';
import sql from '../neonClient';
import { Audio } from 'expo-av';

interface LotusUtilsContextType {

  masterDebugMode?: boolean;
  setMasterDebugMode?: (value: boolean) => void;
  toggleDebugMode?: () => Promise<void>;

  currentRouteName?: string;
  setCurrentRouteName?: (value: string) => void;
  playerTopic?: any;
  setPlayerTopic?: (value: any) => void;
  readioSelectedTopics?: any;
  setReadioSelectedTopics?: (value: any) => void;
  readioSelectedReadioId?: number;
  setReadioSelectedReadioId?: (value: number) => void;
  readioSelectedPlaylistId?: number;
  setReadioSelectedPlaylistId?: (value: number) => void;
  readioSelectedPlaylistName?: string;
  setReadioSelectedPlaylistName?: (value: string) => void;
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
  wantsToGetStarted?: boolean;
  setWantsToGetStarted?: (value: boolean) => void;
  clickedFromHome?: boolean;
  setClickedFromHome?: (value: boolean) => void;
  clickedFromLibrary?: boolean;
  setClickedFromLibrary?: (value: boolean) => void;
  modalMessage?: any;
  setModalMessage?: (value: any) => void;
  modalVisible?: any;
  setModalVisible?: (value: any) => void;
  modalId?: any;
  setModalId?: (value: any) => void;
  linerNoteTopic?: string;
  setLinerNoteTopic?: (value: string) => void;
  floatingPlayerIsVisible?: boolean;
  setFloatingPlayerIsVisible?: (value: boolean) => void;
  featureArticleName?: string;
  featureArticleImage?: string;
  setFeatureArticleName?: (value: string) => void;
  setFeatureArticleImage?: (value: string) => void;
  signUpBannerIsVisible?: boolean;
  setSignUpBannerIsVisible?: (value: boolean) => void;
  underwaterFxSoundRef?: any;
}

const LotusUtilsContext = createContext<LotusUtilsContextType | null>(null);

export const LotusUtilsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const[masterDebugMode, setMasterDebugMode] = useState<boolean>(false);

  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>('Home');
  const [playerTopic, setPlayerTopic] = useState<any>();
  const [readioSelectedTopics, setReadioSelectedTopics] = useState<any>();
  const [readioSelectedReadioId, setReadioSelectedReadioId] = useState<number>();
  const [readioSelectedPlaylistId, setReadioSelectedPlaylistId] = useState<number>();
  const [readioSelectedPlaylistName, setReadioSelectedPlaylistName] = useState<string>();
  const [isFavorite, setIsFavorite] = useState<boolean | undefined>();
  const [wantsToUpdateFavoriteStatus, setWantsToUpdateFavoriteStatus] = useState<boolean>(false);
  const [readioIsGeneratingRadio, setReadioIsGeneratingRadio] = useState(false);
  const [playerMode, setPlayerMode] = useState<string>("");
  const [activeStationName, setActiveStationName] = useState<string>("");
  const [activeStationId, setActiveStationId] = useState<number>(0);
  const [selectedReadios, setSelectedReadios] = useState<LotusArticle[]>([]);
  const [selectedLotusReadios, setSelectedLotusReadios] = useState<any>([]);
  const [wantsToGetStarted, setWantsToGetStarted] = useState<boolean>(false);
  const [clickedFromHome, setClickedFromHome] = useState<boolean>(false);
  const [clickedFromLibrary, setClickedFromLibrary] = useState<boolean>(false);
  const [modalId, setModalId] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [linerNoteTopic, setLinerNoteTopic] = useState<string>("");
  const [floatingPlayerIsVisible, setFloatingPlayerIsVisible] = useState<boolean>(false);
  const [featureArticleName, setFeatureArticleName] = useState<string>("");
  const [featureArticleImage, setFeatureArticleImage] = useState<string>("");
  const [signUpBannerIsVisible, setSignUpBannerIsVisible] = useState<boolean>(false);
  const underwaterFxSoundRef = useRef<Audio.Sound | null>(null); // Ref to store the sound object



  const toggleDebugMode = async () => {
   
    const toggle = await sql`
        UPDATE utils
        SET debug = NOT debug
        WHERE id = 1
        RETURNING debug; 
    `;

    setMasterDebugMode(toggle[0].debug);
  

  }

  return (
    <LotusUtilsContext.Provider value={{

      masterDebugMode,
      setMasterDebugMode,
      toggleDebugMode,

      currentRouteName,
      setCurrentRouteName,
      playerTopic,
      setPlayerTopic,
      readioSelectedTopics,
      setReadioSelectedTopics,
      readioSelectedReadioId,
      setReadioSelectedReadioId,
      readioSelectedPlaylistId,
      setReadioSelectedPlaylistId,
      readioSelectedPlaylistName,
      setReadioSelectedPlaylistName,
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
      wantsToGetStarted,
      setWantsToGetStarted,
      clickedFromHome,
      setClickedFromHome,
      clickedFromLibrary,
      setClickedFromLibrary,
      modalId,
      setModalId,
      modalMessage,
      setModalMessage,
      modalVisible,
      setModalVisible,
      linerNoteTopic,
      setLinerNoteTopic,
      floatingPlayerIsVisible,
      setFloatingPlayerIsVisible,
      featureArticleName,
      setFeatureArticleName,
      featureArticleImage,
      setFeatureArticleImage,
      signUpBannerIsVisible,
      setSignUpBannerIsVisible,
      underwaterFxSoundRef
    }}>
      {children}
    </LotusUtilsContext.Provider>
  );
};

export const useLotusUtils = (match?: string) => {
  const context = useContext(LotusUtilsContext);
  if (!context) throw new Error('useLotusUtils must be used within a LotusUtilsProvider');
  return context;
};