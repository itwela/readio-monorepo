import { Asset } from 'expo-asset';

// Define your image assets
export const ImageAssets = {
  filter: require('../assets/images/filter.png'),
  unknownArticle: require('../assets/images/unknownArticle.png'),
  whiteLogo: require('../assets/images/cropwhitelogo.png'),
  blackLogo: require('../assets/images/cropblacklogo.png'),
  goldLogo: require('../assets/images/cropgoldlogo.png'),
  meditationIcon: require('../assets/images/presence-icon.png'),
  meditationIconOrange: require('../assets/images/presence-icon-orange.png'),
  meditationIconGold: require('../assets/images/presence-icon-gold.png'),
  bookshelf: require('../assets/images/bookshelfImg.png'),
  walkingGif: require('../assets/images/walking.gif'),
  mapImg: require('../assets/images/mapImage.png'),
  signUpImg1: require('@/assets/images/signUpImg1.png'),
  signUpImg2: require('@/assets/images/signUpImg2.png'),
  signUpImg3: require('@/assets/images/signUpImg3.png'),
  
  graceAvatar: require('@/assets/images/graceAvatar.png'),
  padmaAvatar: require('@/assets/images/padmaAvatar.png'),
  pythagorusAvatar: require('@/assets/images/pythagorusAvatar.png'),

  brownGradientVid: require('@/assets/vids/brown-gradient-video-Compressed.mp4'),
  lotusPondVid: require('@/assets/vids/lotus-pond-Compressed.mp4'),
  lotusFlowerPondVidDark: require('@/assets/vids/lotus-flower-compressed-dark.mp4'),
  lotusHomeVidLake: require('@/assets/vids/waterlotuslakeCompressed.mp4'),
  lotusHomeVidLakeDark: require('@/assets/vids/waterHomeLotusLakeCompressed.mp4'),
  bwlotusHomeVidLake: require('@/assets/vids/bwlotusvideowater.mp4'),
  aliGif: require('@/assets/images/ali-boxing-ez.gif'),
  aliVideo: require('@/assets/vids/ali-boxing.mp4'),

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