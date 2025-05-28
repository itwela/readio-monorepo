import { getLocalImageUri } from '@/constants/imageAssets';
import { SoundAssets } from '@/constants/soundAssets';
import { useLastActiveTrack } from '@/hooks/useLastActiveTrack';
import { useTrackPlayerVolume } from '@/hooks/useTrackPlayerVolume';
import { useQueue } from '@/store/queue';
import { Audio } from 'expo-av';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import TrackPlayer, { Event, useProgress, useTrackPlayerEvents } from 'react-native-track-player';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLotusUser } from './lotusUserContext';

// SECTION: INTERFACES =============================================================================
interface LotusMeditationContextType {
  // LOCAL MEDITATION CONTROL States
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
  introChime: Audio.Sound;
  outroChime: Audio.Sound;

  // Static Data
  welcomeData: any[];
  howToMeditateData: any[];
  meditationCategories: string[];
  progress: any;

  // Convex Data
  meditationSeasons: MeditationSeason[] | undefined;
  meditationMusic: any[] | undefined;

  // Actions
  updateMinutesMeditated: () => void;
  playIntroChime: () => void;
  playOutroChime: () => void;
  getMeditationByName: (name: string) => MeditationSeason | undefined;
  getMusicForMeditation: (season: MeditationSeason) => SeasonMusicThemeUrls[];
}
export interface VoiceThemeUrls {
  [themeKey: string]: string; // e.g., "shifts": "https://example.com/stic_shifts.mp3"
}
// For the objects within the meditation_season_intros array:
// e.g., { "stic": VoiceThemeUrls, "grace": VoiceThemeUrls, ... }
// This maps voice names to their collection of themed intro URLs.
export interface SeasonIntrosByVoice {
  stic?: VoiceThemeUrls;
  grace?: VoiceThemeUrls;
  padma?: VoiceThemeUrls;
  pythagorus?: VoiceThemeUrls;
  [voiceKey: string]: VoiceThemeUrls | undefined; // Allows for other potential voices
}
// For the objects within the meditation_season_music array:
// e.g., { "shifts": "url_to_music", "one_path": "url_to_music", ... }
// This maps theme keys to their respective background music URLs.
export interface SeasonMusicThemeUrls {
  [themeKey: string]: string; // e.g., "shifts": "https://example.com/music_shifts.mp3"
}
// Define the structure for items within meditation_intro_text.
// Assuming a simple array of objects with a 'text' property. Adjust if different.
export interface MeditationIntroTextItem {
  text: string;
  // If it can be any object, a more generic type might be:
  // [key: string]: any;
}
// Define the main interface for a Meditation Season
export enum MeditationNames {
  EASY_TIGER = 'Easy Tiger Meditation',
  // Add other named meditations here
}
export interface MeditationSeason {
  _id: string;
  _creationTime: number;
  id?: number;
  meditation_season_name?: string;
  meditation_season_cover?: string;
  meditation_season_intros?: SeasonIntrosByVoice[]; // Array of objects, each mapping voices to themes/URLs
  meditation_season_music?: SeasonMusicThemeUrls[];   // Array of objects, each mapping themes to music URLs
  meditation_season_description?: string | null;
  meditation_intro_text?: MeditationIntroTextItem[]; // Array of text items for the intro
  created_at?: string;
  updated_at?: string;
}

// SECTION: TYPES =============================================================================
export type MeditationByName = Record<string, MeditationSeason>;

// SECTION: CONTEXT =============================================================================
const LotusMeditationContext = createContext<LotusMeditationContextType | null>(null);

// SECTION: HELPER FUNCTIONS =============================================================================
function getMeditationByName(seasons: MeditationSeason[], name: string): MeditationSeason | undefined {
  return seasons.find(season => season.meditation_season_name === name);
}
function getMusicForMeditation(season: MeditationSeason): SeasonMusicThemeUrls[] {
  return season.meditation_season_music || [];
}

export const LotusMeditationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  // SECTION: STATE VARIABLES =============================================================================
  const { user } = useLotusUser();
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
  const progress = useProgress();
  const minutes = 60
  const introChime = new Audio.Sound();
  const outroChime = new Audio.Sound();

  // SECTION: CONVEX QUERIES =============================================================================
  const meditationSeasonsQuery = useQuery(api.meditations.getMeditationSeasons);
  const meditationMusicQuery = useQuery(api.meditations.getAllMeditationMusic);
  const updateMeditationMinutes = useMutation(api.users.updateMeditationMinutes);

  // SECTION: STATIC DATA =============================================================================
  const welcomeData = [
    {
      id: 'welcome1',
      title: 'Getting Started',
      url: SoundAssets.meditationWelcome.id,
      artwork: getLocalImageUri('meditationIcon'),
      topic: 'Meditation',
      artist: 'Lotus'
    },
  ];
  const howToMeditateData = [
    {
      id: 'howtomeditate1',
      title: 'How To Meditate',
      url: SoundAssets.meditationHowToMeditate.id,
      artwork: getLocalImageUri('meditationIcon'),
      topic: 'Meditation',
      artist: 'Lotus'
    },
  ];
  const meditationCategories = [
    'Easy Tiger',
  ]

  // SECTION: TRACK PLAYER EVENT LISTENER =============================================================================
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async ({ type, track }) => {
    if (type === Event.PlaybackActiveTrackChanged && track !== undefined) {
      // Only update if we're in a Meditation session
      if (meditationSessionHasStarted) {
        const currentIndex = await TrackPlayer.getActiveTrackIndex();
        setCurrentTrack(currentIndex === 0 ? 'intro' : 'meditation');
      }
    }
  });

  // SECTION: FUNCTIONS =============================================================================
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
    // console.log("volume is", currentVolume, 'music is enabled', isMusicEnabled, 'current track', currentTrack, 'Meditation session has started', meditationSessionHasStarted);
  };
  const updateMinutesMeditated = async () => {
    if (!user?._id) return;
    await updateMeditationMinutes({
      userId: user._id,
      minutes: selectedDuration
    });
  }
  const playIntroChime = async () => {
    try {
      await introChime.loadAsync(SoundAssets.meditationIntroChime.id);
      await introChime.setVolumeAsync(0.20);
      await introChime.playAsync();
    } catch (error) {
    }
  }
  const playOutroChime = async () => {
    try {
      await outroChime.loadAsync(SoundAssets.meditationOutroChime.id);
      await outroChime.setVolumeAsync(0.20);
      await outroChime.playAsync();
    } catch (error) {
    }
  }
  const endSession = async () => {

    await updateMinutesMeditated();

    await playOutroChime();

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


  // SECTION: USE EFFECTS =============================================================================
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
          await playIntroChime();
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
        welcomeData,
        howToMeditateData,
        meditationCategories,
        progress,
        introChime,
        outroChime,

        // Convex data
        meditationSeasons: meditationSeasonsQuery,
        meditationMusic: meditationMusicQuery,

        // Helper functions
        updateMinutesMeditated,
        playIntroChime,
        playOutroChime,
        getMeditationByName: (name: string) => getMeditationByName(meditationSeasonsQuery || [], name),
        getMusicForMeditation
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
