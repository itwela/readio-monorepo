import { Asset } from 'expo-asset';

// Define your sound assets
export const SoundAssets = {
    presenceIntroChime: {
        id: require('../assets/sounds/presence/Lotus-Presence-Intro-Chime.mp3'),
        name: 'Lotus-Presence-Intro-Chime.mp3'
    },
    presenceOutroChime: {
        id: require('../assets/sounds/presence/Lotus-Presence-Outro-Chime.mp3'),
        name: 'Lotus-Presence-Outro-Chime.mp3'
    },
    presenceHowToMeditate: {
        id: require('../assets/sounds/presence/presence-how-to-meditate.mp3'),
        name: 'presence-how-to-meditate.mp3'
    },
    presenceIntroAlwaysAware: {
        id: require('../assets/sounds/presence/presence-intro-Always-Aware.mp3'),
        name: 'presence-intro-Always-Aware.mp3'
    },
    presenceIntroInnerPeace: {
        id: require('../assets/sounds/presence/presence-intro-Inner-Peace.mp3'),
        name: 'presence-intro-Inner-Peace.mp3'
    },
    presenceIntroInstillingStillness: {
        id: require('../assets/sounds/presence/presence-intro-Instilling-stillness.mp3'),
        name: 'presence-intro-Instilling-stillness.mp3'
    },
    presenceIntroOnePath: {
        id: require('../assets/sounds/presence/presence-intro-One-Path.mp3'),
        name: 'presence-intro-One-Path.mp3'
    },
    presenceIntroShifts: {
        id: require('../assets/sounds/presence/presence-intro-Shifts.mp3'),
        name: 'presence-intro-Shifts.mp3'
    },
    presenceMusicAlwaysAware: {
        id: require('../assets/sounds/presence/presence-music-Always-Aware-10-minutes_60min_compressed.mp3'),
        name: 'presence-music-Always-Aware-10-minutes_60min_compressed.mp3'
    },
    presenceMusicInnerPeace: {
        id: require('../assets/sounds/presence/presence-music-Inner-Peace-7-minutes_60min_compressed.mp3'),
        name: 'presence-music-Inner-Peace-7-minutes_60min_compressed.mp3'
    },
    presenceMusicInstillingStillness: {
        id: require('../assets/sounds/presence/presence-music-Instilling-stillness_60min_compressed.mp3'),
        name: 'presence-music-Instilling-stillness_60min_compressed.mp3'
    },
    presenceMusicOnePath: {
        id: require('../assets/sounds/presence/presence-music-One-Path-10-minutes_60min_compressed.mp3'),
        name: 'presence-music-One-Path-10-minutes_60min_compressed.mp3'
    },
    presenceMusicShifts: {
        id: require('../assets/sounds/presence/presence-music-Shifts_60min_compressed.mp3'),
        name: 'presence-music-Shifts_60min_compressed.mp3'
    },
    presenceWelcome: {
        id: require('../assets/sounds/presence/presence-welcome.mp3'),
        name: 'presence-welcome.mp3'
    },
    waterSound: {
        id: require('../assets/sounds/Lotus-Water-Goals.mp3'),
        name: 'Lotus-Water-Goals.mp3'
    },
};

// Preload function
export const preloadSounds = async () => {
  try {
    const soundAssets = Object.values(SoundAssets).map(sound => 
      Asset.fromModule(sound.id).downloadAsync()
    );
    await Promise.all(soundAssets);
    return true;
  } catch (error) {
    console.error('Error preloading sounds:', error);
    return false;
  }
};

// Helper to get local sound URI
export const getLocalSoundUri = (key: keyof typeof SoundAssets) => {
  const asset = Asset.fromModule(SoundAssets[key].id);
  return asset.localUri || asset.uri;
};
