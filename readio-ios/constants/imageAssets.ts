import { Asset } from 'expo-asset';

// Define your image assets
export const ImageAssets = {
  filter: require('../assets/images/filter.png'),
  unknownArticle: require('../assets/images/unknownArticle.png'),
  whiteLogo: require('../assets/images/cropwhitelogo.png'),
  blackLogo: require('../assets/images/cropblacklogo.png'),
  presenceIcon: require('../assets/images/presence-icon.png'),
  presenceIconOrange: require('../assets/images/presence-icon-orange.png'),
  bookshelf: require('../assets/images/bookshelfImg.png'),
  walkingGif: require('../assets/images/walking.gif'),
  mapImg: require('../assets/images/mapImage.png'),
  signUpImg1: require('@/assets/images/signUpImg1.png'),
  signUpImg2: require('@/assets/images/signUpImg2.png'),
  signUpImg3: require('@/assets/images/signUpImg3.png'),

  brownGradientVid: require('@/assets/vids/brown-gradient-video-Compressed.mp4'),
  lotusPondVid: require('@/assets/vids/lotus-pond-Compressed.mp4'),
  lotusFlowerPondVidDark: require('@/assets/vids/lotus-flower-compressed-dark.mp4'),
  lotusHomeVidLake: require('@/assets/vids/waterlotuslakeCompressed.mp4'),
};

// Preload function
export const preloadImages = async () => {
  try {
    const imageAssets = Object.values(ImageAssets).map(image => 
      Asset.fromModule(image).downloadAsync()
    );
    await Promise.all(imageAssets);
    return true;
  } catch (error) {
    console.error('Error preloading images:', error);
    return false;
  }
};

// Helper to get local image URI
export const getLocalImageUri = (key: keyof typeof ImageAssets) => {
  const asset = Asset.fromModule(ImageAssets[key]);
  return asset.localUri || asset.uri;
};