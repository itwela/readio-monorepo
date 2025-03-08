import { Asset } from 'expo-asset';

// Define your sound assets
export const SoundAssets = {
    // TODO: CORRECT THE PATHS
        presenceIntroChime: require('../assets/sounds/presence/Lotus-Presence-Intro-Chime.mp3'),
        presenceOutroChime: require('../assets/sounds/presence/Lotus-Presence-Outro-Chime.mp3'),
        presenceHowToMeditate: require('../assets/sounds/presence/presence-how-to-meditate.mp3'),
        presenceIntroAlwaysAware: require('../assets/sounds/presence/presence-intro-Always-Aware.mp3'),
        presenceIntroInnerPeace: require('../assets/sounds/presence/presence-intro-Inner-Peace.mp3'),
        presenceIntroInstillingStillness: require('../assets/sounds/presence/presence-intro-Instilling-stillness.mp3'),
        presenceIntroOnePath: require('../assets/sounds/presence/presence-intro-One-Path.mp3'),
        presenceIntroShifts: require('../assets/sounds/presence/presence-intro-Shifts.mp3'),
        presenceMusicAlwaysAware: require('../assets/sounds/presence/presence-music-Always-Aware-10-minutes_60min_compressed.mp3'),
        presenceMusicInnerPeace: require('../assets/sounds/presence/presence-music-Inner-Peace-7-minutes_60min_compressed.mp3'),
        presenceMusicInstillingStillness: require('../assets/sounds/presence/presence-music-Instilling-stillness_60min_compressed.mp3'),
        presenceMusicOnePath: require('../assets/sounds/presence/presence-music-One-Path-10-minutes_60min_compressed.mp3'),
        presenceMusicShifts: require('../assets/sounds/presence/presence-music-Shifts_60min_compressed.mp3'),
        presenceWelcome: require('../assets/sounds/presence/presence-welcome.mp3'),
};

// Preload function
export const preloadSounds = async () => {
  try {
    const soundAssets = Object.values(SoundAssets).map(sound => 
      Asset.fromModule(sound).downloadAsync()
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
  const asset = Asset.fromModule(SoundAssets[key]);
  return asset.localUri || asset.uri;
};
