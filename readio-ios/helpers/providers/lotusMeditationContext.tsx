import { getLocalImageUri } from '@/constants/imageAssets';
import { SoundAssets } from '@/constants/soundAssets';
import { useLastActiveTrack } from '@/hooks/useLastActiveTrack';
import { useTrackPlayerVolume } from '@/hooks/useTrackPlayerVolume';
import { useQueue } from '@/store/queue';
import { Audio } from 'expo-av';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import TrackPlayer, { Event, useProgress, useTrackPlayerEvents } from 'react-native-track-player';
import sql from '@/helpers/neonClient';
import { useLotusUser } from './lotusUserContext';

interface LotusMeditationContextType {
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
  meditationSessionHasStarted: boolean;
  setMeditationSessionHasStarted: (value: boolean) => void;
  currentTrack: 'intro' | 'meditation' | null;
  setCurrentTrack: (value: 'intro' | 'meditation' | null) => void;
  intros: any[];
  meditationMusic: any[];
  welcomeData: any[];
  howToMeditateData: any[];
  progress: any;
  updateMinutesMeditated: () => void;
}

const LotusMeditationContext = createContext<LotusMeditationContextType | null>(null);

export const LotusMeditationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {user} = useLotusUser();
  const [selectedModal, setSelectedModal] = useState<'music' | 'duration' | 'topics' | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(5);
  const [selectedIntro, setSelectedIntro] = useState<any>();
  const [readyToStartSession, setReadyToStartSession] = useState<boolean>(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(true);
  const [welcomeIsPlaying, setWelcomeIsPlaying] = useState<boolean>(false);
  const [howToMeditateIsPlaying, setHowToMeditateIsPlaying] = useState<boolean>(false);
  const [meditationSessionHasStarted, setMeditationSessionHasStarted] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<'intro' | 'meditation' | null>(null);
  const { volume, updateVolume } = useTrackPlayerVolume();
  const { activeQueueId, setActiveQueueId } = useQueue();
  const { lastActiveTrack, clearLastActiveTrack, setLastActiveTrack } = useLastActiveTrack();
  const minutes = 60
  const introChime = new Audio.Sound();
  const outroChime = new Audio.Sound();


  const intros = [
    { 
      id: 'Inner Peace', 
      title: 'Inner Peace',
      url: SoundAssets.meditationIntroInnerPeace.id,
      image: getLocalImageUri('meditationIcon'),
      topic: 'Meditation',
      artist: 'Lotus'
    },
    { 
      id: 'Always Aware', 
      title: 'Always Aware',
      url: SoundAssets.meditationIntroAlwaysAware.id,
      image: getLocalImageUri('meditationIcon'),
      topic: 'Meditation',
      artist: 'Lotus'
    },
    { 
      id: 'One Path', 
      title: 'One Path',
      url: SoundAssets.meditationIntroOnePath.id,
      image: getLocalImageUri('meditationIcon'),
      topic: 'Meditation',
      artist: 'Lotus'
    },
    { 
      id: 'Instilling Stillness', 
      title: 'Instilling Stillness',
      url: SoundAssets.meditationIntroInstillingStillness.id,
      image: getLocalImageUri('meditationIcon'),
      topic: 'Meditation',
      artist: 'Lotus'
    },
    { 
      id: 'Shifts', 
      title: 'Shifts',
      url: SoundAssets.meditationIntroShifts.id,
      image: getLocalImageUri('meditationIcon'),
      topic: 'Meditation',
      artist: 'Lotus'
    }
  ];

  const meditationMusic = [
    { 
      id: 'Inner Peace', 
      title: 'Meditation - Inner Peace',
      url: SoundAssets.meditationMusicInnerPeace.id,
      image: getLocalImageUri('meditationIcon'),
      topic: 'Meditation',
      artist: 'Lotus'
    },
    { 
      id: 'Always Aware', 
      title: 'Meditation - Always Aware',
      url: SoundAssets.meditationMusicAlwaysAware.id,
      image: getLocalImageUri('meditationIcon'),
      topic: 'Meditation',
      artist: 'Lotus'
    },
    { 
      id: 'One Path', 
      title: 'Meditation - One Path',
      url: SoundAssets.meditationMusicOnePath.id,
      image: getLocalImageUri('meditationIcon'),
      topic: 'Meditation',
      artist: 'Lotus'
    },
    { 
      id: 'Instilling Stillness', 
      title: 'Meditation - Instilling Stillness',
      url: SoundAssets.meditationMusicInstillingStillness.id,
      image: getLocalImageUri('meditationIcon'),
      topic: 'Meditation',
      artist: 'Lotus'
    },
    { 
      id: 'Shifts', 
      title: 'Meditation - Shifts',
      url: SoundAssets.meditationMusicShifts.id,
      image: getLocalImageUri('meditationIcon'),
      topic: 'Meditation',
      artist: 'Lotus'
    }
  ];

  const welcomeData = [
    {
      id: 'welcome1',
      title: 'Getting Started',
      url: SoundAssets.meditationWelcome.id,
      image: getLocalImageUri('meditationIcon'),
      topic: 'Meditation',
      artist: 'Lotus'
    },
  ];

  const howToMeditateData = [
    {
      id: 'howtomeditate1',
      title: 'How To Meditate',
      url: SoundAssets.meditationHowToMeditate.id,
      image: getLocalImageUri('meditationIcon'),
      topic: 'Meditation',
      artist: 'Lotus'
    },
  ];


  const progress = useProgress();

  // Track player event listener for track changes
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async ({ type, track }) => {
    if (type === Event.PlaybackActiveTrackChanged && track !== undefined) {
      // Only update if we're in a Meditation session
      if (meditationSessionHasStarted) {
        const currentIndex = await TrackPlayer.getActiveTrackIndex();
        setCurrentTrack(currentIndex === 0 ? 'intro' : 'meditation');
      }
    }
  });


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
    console.log("volume is", currentVolume, 'music is enabled', isMusicEnabled, 'current track', currentTrack, 'Meditation session has started', meditationSessionHasStarted);
  };

  const updateMinutesMeditated = async () => {

    console.log('updating minutes meditated', selectedDuration);
    console.log('user id', user?.id);
      await sql`
      UPDATE users
      SET 
        user_meditation_minutes = user_meditation_minutes + ${selectedDuration}
      WHERE id = ${user?.id}
    `;
  }

  const endSession = async () => {

    await updateMinutesMeditated();

    try {
      await outroChime.loadAsync(SoundAssets.meditationOutroChime.id);
      await outroChime.setVolumeAsync(0.20); // Set volume to 50% (value between 0 and 1)
      await outroChime.playAsync();
    } catch (error) {
      console.error("Error playing intro chime:", error);
    }
    
    await TrackPlayer.reset();
    clearLastActiveTrack();
    setCurrentTrack(null);
    setSelectedIntro(null);
    setMeditationSessionHasStarted(false);
    setSelectedDuration(5);
    setIsMusicEnabled(true);
    setReadyToStartSession(false);
    await updateVolume(0.618);
    
  };


  // Separate volume control effect
  useEffect(() => {
    handleVolumeControl();
  }, [isMusicEnabled, currentTrack, meditationSessionHasStarted, updateVolume]);

  // Play intro chime when meditation track starts
  useEffect(() => {
    let hasPlayed = false;
    const playIntroChime = async () => {
      if (currentTrack === 'meditation' && !hasPlayed) {
        try {
          await introChime.loadAsync(SoundAssets.meditationIntroChime.id);
          await introChime.setVolumeAsync(0.20);
          await introChime.playAsync();
          hasPlayed = true;
        } catch (error) {
          console.error("Error playing intro chime:", error);
        }
      }
    };
    playIntroChime();
  }, [currentTrack]);


  // Monitor meditation end
  useEffect(() => {
    // Only monitor if we're in an active Meditation session
    if (meditationSessionHasStarted && currentTrack === 'meditation' && progress.position >= selectedDuration * minutes) {
      endSession();
    }
  }, [progress.position, currentTrack, selectedDuration, meditationSessionHasStarted]);
  
  // Monitor session readiness
  useEffect(() => {
    if (selectedIntro && selectedDuration !== 0) {
      setReadyToStartSession(true);
    }
  }, [selectedIntro, selectedDuration]);

  return (
    <LotusMeditationContext.Provider value={{
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
      meditationSessionHasStarted,
      setMeditationSessionHasStarted,
      currentTrack,
      setCurrentTrack,
      intros,
      meditationMusic,
      welcomeData,
      howToMeditateData,
      progress,
      updateMinutesMeditated,
    }}>
      {children}
    </LotusMeditationContext.Provider>
  );
};

export const useLotusMeditation = () => {
  const context = useContext(LotusMeditationContext);
  if (!context) throw new Error('useLotusMeditation must be used within a LotusMeditationProvider');
  return context;
};