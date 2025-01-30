import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Readio } from '@/types/type';
import { tokenCache } from '@/lib/auth';
import sql from '@/helpers/neonClient';
// import { Track } from 'react-native-track-player';

interface ReadioContextType {
  currentRouteName?: string;
  setCurrentRouteName?: (value: string) => void;
  playerTopic?: any,
  setPlayerTopic?: (value: any) => void;
  readioSelectedTopics?: any;
  setReadioSelectedTopics?: (value: any) => void;
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
  selectedReadios?: Readio[];
  setSelectedReadios?: (value: Readio[]) => void;
  selectedLotusReadios?: any;
  setSelectedLotusReadios?: (value: any) => void;
  wantsToGetStarted?: boolean;
  setWantsToGetStarted?: (value: boolean) => void;
  clickedFromHome?: boolean;
  setClickedFromHome?: (value: boolean) => void;
  clickedFromLibrary?: boolean;
  setClickedFromLibrary?: (value: boolean) => void;
  user?: any;
  setUser?: (value: any) => void;
  modalMessage?: any;
  setModalMessage?:  (value: any) => void;
  modalVisible?: any;
  setModalVisible?:  (value: any) => void;
  modalId?: any;
  setModalId?:  (value: any) => void;
  needsToRefresh?: any, 
  setNeedsToRefresh?: (value: any) => void;
  totalSteps?: number;  
  setTotalSteps?: (value: number) => void;
  linerNoteTopic?: string;
  setLinerNoteTopic?: (value: string) => void;
  isSignedIn?: any;
  setIsSignedIn?: (value: any) => void;
  hasAccount?: any;
  setHasAccount?: (value: any) => void;
}

const ReadioContext = createContext<ReadioContextType | null>(null);

export const ReadioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>();
  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>('Home');  
  const [playerTopic, setPlayerTopic] = useState<any>()
    const [readioSelectedTopics, setReadioSelectedTopics] = useState<any>();
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
    const [selectedReadios, setSelectedReadios] = useState<Readio[]>([]);
    const [selectedLotusReadios, setSelectedLotusReadios] = useState<any>([])  
    const [wantsToGetStarted, setWantsToGetStarted] = useState<boolean>(false);
    const [clickedFromHome, setClickedFromHome] = useState<boolean>(false);
    const [clickedFromLibrary, setClickedFromLibrary] = useState<boolean>(false);
    const [modalId, setModalId,] = useState("")
    const [modalMessage, setModalMessage] = useState("")
    const [modalVisible, setModalVisible] = useState(false)
    const [needsToRefresh, setNeedsToRefresh] = useState(false)
    const [totalSteps, setTotalSteps] = useState(0);
    const [linerNoteTopic, setLinerNoteTopic] = useState<string>("")
    const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
    const [hasAccount, setHasAccount] = useState<boolean | null>(null);

    useEffect(() => {
      const checkSignInStatus = async () => {
        const savedHash = await tokenCache.getToken('lotusJWTAlwaysGrowingToken');
        setIsSignedIn(Boolean(savedHash));
        console.log('shhhh', savedHash);
        if (savedHash) {
          const userExists = await getUserInfo(savedHash);
          setHasAccount(userExists);
        } else {
          setHasAccount(false);
        }
      };
  
      const getUserInfo = async (hash: string) => {
        const userInfo = await sql`SELECT * FROM users WHERE jwt = ${hash}`;
        if (userInfo) {
          setUser?.(userInfo[0]);
          console.log("userInfo: ", userInfo[0]);
          return true;
        } else {
          return false;
        }
      };

      if (needsToRefresh === true) {

        checkSignInStatus();
      }

    }, [needsToRefresh])

    

  return (
    <ReadioContext.Provider value={{
      user,
      setUser,
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

        needsToRefresh, 
        setNeedsToRefresh,

        totalSteps,  
        setTotalSteps,

        linerNoteTopic,
        setLinerNoteTopic,

        isSignedIn,
        setIsSignedIn,

        hasAccount,
        setHasAccount
        
    }}>
      {children}
    </ReadioContext.Provider>
  );
};

export const useReadio = (match?: string) => {
  const context = useContext(ReadioContext);
  if (!context) throw new Error('useReadio must be used within a ReadioProvider');
  return context;
};