import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import sql from '@/helpers/neonClient';
import { setStateAsync } from '@/constants/utilityFunctions';
import { SoundAssets } from '@/constants/soundAssets';
import { getLocalImageUri } from '@/constants/imageAssets';
import TrackPlayer, { Event, useTrackPlayerEvents } from 'react-native-track-player';
import { useProgress } from 'react-native-track-player';
import { useTrackPlayerVolume } from '@/hooks/useTrackPlayerVolume';
import { useLastActiveTrack } from '@/hooks/useLastActiveTrack';
import { Audio } from 'expo-av';

interface LotusPresenceContextType {
  selectedModal: 'music' | 'duration' | 'topics' | null;
  setSelectedModal: (value: 'music' | 'duration' | 'topics' | null) => void;
  selectedDuration: number;
  setSelectedDuration: (value: number) => void;
  selectedIntro: any;
  setSelectedIntro: (value: any) => void;
  readyToStartSession: boolean;
  setReadyToStartSession: (value: boolean) => void;
  isMusicEnabled: boolean;
  setIsMusicEnabled: (value: boolean) => void;
  welcomeIsPlaying: boolean;
  setWelcomeIsPlaying: (value: boolean) => void;
  howToMeditateIsPlaying: boolean;
  setHowToMeditateIsPlaying: (value: boolean) => void;
  presenceSessionHasStarted: boolean;
  setPresenceSessionHasStarted: (value: boolean) => void;
  currentTrack: 'intro' | 'meditation' | null;
  setCurrentTrack: (value: 'intro' | 'meditation' | null) => void;
  intros: any[];
  presenceMeditationMusic: any[];
  welcomeData: any[];
  howToMeditateData: any[];
  progress: any;
}

const LotusPresenceContext = createContext<LotusPresenceContextType | null>(null);

export const LotusPresenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedModal, setSelectedModal] = useState<'music' | 'duration' | 'topics' | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(5);
  const [selectedIntro, setSelectedIntro] = useState<any>();
  const [readyToStartSession, setReadyToStartSession] = useState<boolean>(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(true);
  const [welcomeIsPlaying, setWelcomeIsPlaying] = useState<boolean>(false);
  const [howToMeditateIsPlaying, setHowToMeditateIsPlaying] = useState<boolean>(false);
  const [presenceSessionHasStarted, setPresenceSessionHasStarted] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<'intro' | 'meditation' | null>(null);
  const { volume, updateVolume } = useTrackPlayerVolume();
  const { lastActiveTrack, clearLastActiveTrack, setLastActiveTrack } = useLastActiveTrack();
  const minutes = 60
  const outroChime = new Audio.Sound();


  const intros = [
    { 
      id: 'Inner Peace', 
      title: 'Intro - Inner Peace',
      url: SoundAssets.presenceIntroInnerPeace,
      image: getLocalImageUri('presenceIcon'),
      topic: 'Presence',
      artist: 'Lotus'
    },
    { 
      id: 'Always Aware', 
      title: 'Intro - Always Aware',
      url: SoundAssets.presenceIntroAlwaysAware,
      image: getLocalImageUri('presenceIcon'),
      topic: 'Presence',
      artist: 'Lotus'
    },
    { 
      id: 'One Path', 
      title: 'Intro - One Path',
      url: SoundAssets.presenceIntroOnePath,
      image: getLocalImageUri('presenceIcon'),
      topic: 'Presence',
      artist: 'Lotus'
    },
    { 
      id: 'Instilling Stillness', 
      title: 'Intro - Instilling Stillness',
      url: SoundAssets.presenceIntroInstillingStillness,
      image: getLocalImageUri('presenceIcon'),
      topic: 'Presence',
      artist: 'Lotus'
    },
    { 
      id: 'Shifts', 
      title: 'Intro - Shifts',
      url: SoundAssets.presenceIntroShifts,
      image: getLocalImageUri('presenceIcon'),
      topic: 'Presence',
      artist: 'Lotus'
    }
  ];

  const presenceMeditationMusic = [
    { 
      id: 'Inner Peace', 
      title: 'Presence - Inner Peace',
      url: SoundAssets.presenceMusicInnerPeace,
      image: getLocalImageUri('presenceIcon'),
      topic: 'Presence',
      artist: 'Lotus'
    },
    { 
      id: 'Always Aware', 
      title: 'Presence - Always Aware',
      url: SoundAssets.presenceMusicAlwaysAware,
      image: getLocalImageUri('presenceIcon'),
      topic: 'Presence',
      artist: 'Lotus'
    },
    { 
      id: 'One Path', 
      title: 'Presence - One Path',
      url: SoundAssets.presenceMusicOnePath,
      image: getLocalImageUri('presenceIcon'),
      topic: 'Presence',
      artist: 'Lotus'
    },
    { 
      id: 'Instilling Stillness', 
      title: 'Presence - Instilling Stillness',
      url: SoundAssets.presenceMusicInstillingStillness,
      image: getLocalImageUri('presenceIcon'),
      topic: 'Presence',
      artist: 'Lotus'
    },
    { 
      id: 'Shifts', 
      title: 'Presence - Shifts',
      url: SoundAssets.presenceMusicShifts,
      image: getLocalImageUri('presenceIcon'),
      topic: 'Presence',
      artist: 'Lotus'
    }
  ];

  const welcomeData = [
    {
      id: 'welcome1',
      title: 'Welcome',
      url: SoundAssets.presenceWelcome,
      image: getLocalImageUri('presenceIcon'),
      topic: 'Presence',
      artist: 'Lotus'
    },
  ];

  const howToMeditateData = [
    {
      id: 'howtomeditate1',
      title: 'How To Meditate',
      url: SoundAssets.presenceHowToMeditate,
      image: getLocalImageUri('presenceIcon'),
      topic: 'Presence',
      artist: 'Lotus'
    },
  ];


  const progress = useProgress();

  // Track player event listener for track changes
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async ({ type, track }) => {
    if (type === Event.PlaybackActiveTrackChanged && track !== undefined) {
      // Only update if we're in a presence session
      if (presenceSessionHasStarted) {
        const currentIndex = await TrackPlayer.getActiveTrackIndex();
        setCurrentTrack(currentIndex === 0 ? 'intro' : 'meditation');
      }
    }
  });


  // Separate volume control effect
  useEffect(() => {

    const handleVolumeControl = async () => {
      const currentVolume = await TrackPlayer.getVolume()
      if (currentTrack === 'intro') {
        await updateVolume(0.618);
        await updateVolume(0.618);
      }
      if (currentTrack === 'meditation') {
        await updateVolume(isMusicEnabled === true ? 0.618 : 0);
        await updateVolume(isMusicEnabled === true ? 0.618 : 0);
      }
      console.log("volume is", currentVolume, 'music is enabled', isMusicEnabled, 'current track', currentTrack, 'presence session has started', presenceSessionHasStarted);
    };

    handleVolumeControl();


  }, [isMusicEnabled, currentTrack, presenceSessionHasStarted, updateVolume]);

  
  // Monitor meditation end
  useEffect(() => {

    // Only monitor if we're in an active presence session
    if (presenceSessionHasStarted && currentTrack === 'meditation' && progress.position >= selectedDuration * minutes) {
      
      const endSession = async () => {

        try {
          await outroChime.loadAsync(SoundAssets.presenceOutroChime);
          await outroChime.setVolumeAsync(0.318); // Set volume to 50% (value between 0 and 1)
          await outroChime.playAsync();
        } catch (error) {
          console.error("Error playing intro chime:", error);
        }
        
        await TrackPlayer.reset();
        setPresenceSessionHasStarted(false);
        setCurrentTrack(null);
        setSelectedIntro(null);
        setSelectedDuration(5);
        setReadyToStartSession(false);
        setIsMusicEnabled(true);
        clearLastActiveTrack();
        await updateVolume(0.618);
      };
      endSession();
    }

  }, [progress.position, currentTrack, selectedDuration, presenceSessionHasStarted]);
  

  // Monitor session readiness
  useEffect(() => {
    if (selectedIntro && selectedDuration !== 0) {
      setReadyToStartSession(true);
    }
  }, [selectedIntro, selectedDuration]);

  return (
    <LotusPresenceContext.Provider value={{
      selectedModal,
      setSelectedModal,
      selectedDuration,
      setSelectedDuration,
      selectedIntro,
      setSelectedIntro,
      readyToStartSession,
      setReadyToStartSession,
      isMusicEnabled,
      setIsMusicEnabled,
      welcomeIsPlaying,
      setWelcomeIsPlaying,
      howToMeditateIsPlaying,
      setHowToMeditateIsPlaying,
      presenceSessionHasStarted,
      setPresenceSessionHasStarted,
      currentTrack,
      setCurrentTrack,
      intros,
      presenceMeditationMusic,
      welcomeData,
      howToMeditateData,
      progress
    }}>
      {children}
    </LotusPresenceContext.Provider>
  );
};

export const useLotusPresence = () => {
  const context = useContext(LotusPresenceContext);
  if (!context) throw new Error('useLotusPresence must be used within a LotusPresenceProvider');
  return context;
};