// import { Asset } from 'expo-asset';

// // Define your sound assets
// export const SoundAssets = {
//   notification: require('../assets/sounds/notification.mp3'),
// };

// // Preload function
// export const preloadSounds = async () => {
//   try {
//     const soundAssets = Object.values(SoundAssets).map(sound => 
//       Asset.fromModule(sound).downloadAsync()
//     );
//     await Promise.all(soundAssets);
//     return true;
//   } catch (error) {
//     console.error('Error preloading sounds:', error);
//     return false;
//   }
// };

// // Helper to get local sound URI
// export const getLocalSoundUri = (key: keyof typeof SoundAssets) => {
//   const asset = Asset.fromModule(SoundAssets[key]);
//   return asset.localUri || asset.uri;
// };
