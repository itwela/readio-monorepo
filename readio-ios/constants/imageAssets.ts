import { Asset } from 'expo-asset';

// Define your image assets
export const ImageAssets = {
  filter: require('../assets/images/filter.png'),
  unknownArticle: require('../assets/images/unknownArticle.png'),
  whiteLogo: require('../assets/images/cropwhitelogo.png'),
  blackLogo: require('../assets/images/cropblacklogo.png'),
  bookshelf: require('../assets/images/bookshelfImg.png'),
  walkingVideo: require('../assets/images/walking.gif'),
  mapImg: require('../assets/images/mapImage.png'),
  // Add other images here
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