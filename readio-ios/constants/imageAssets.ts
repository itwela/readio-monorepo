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
  
  graceAvatar: require('@/assets/images/graceAvatar.png'),
  padmaAvatar: require('@/assets/images/padmaAvatar.png'),
  pythagorusAvatar: require('@/assets/images/pythagorusAvatar.png'),
  babaAvatar: require('@/assets/images/babaAvatar.png'),

  brownGradientVid: require('@/assets/vids/brown-gradient-video-Compressed.mp4'),
  lotusPondGif: require('@/assets/images/lotusPondHeader.gif'),
  lotusFlowerPondVidDark: require('@/assets/vids/lotus-flower-compressed-dark.mp4'),
  aliGif: require('@/assets/images/kidboxer.gif'),
  manDrinkWater: require('@/assets/images/manDrinkWater.gif'),
  sticMeditating: require('@/assets/images/sticMeditating.gif'),
  lotusWaterAd1: require('@/assets/images/drinkWaterAd1.png'),
  lotusWaterAd2: require('@/assets/images/drinkWaterAd2.png'),
  lotusWaterAd3: require('@/assets/images/drinkWaterAd3.png'),

  // lotusWaterAd1: 'https://companystaticimages.s3.us-east-2.amazonaws.com/drinkWaterAd1.jpeg',
  // lotusWaterAd2: 'https://companystaticimages.s3.us-east-2.amazonaws.com/drinkWaterAd2.jpeg',
  // lotusWaterAd3: 'https://companystaticimages.s3.us-east-2.amazonaws.com/drinkWaterAd3.jpeg',

  // lotusPondVid: require('@/assets/vids/lotus-pond-Compressed.mp4'),
  // lotusHomeVidLake: require('@/assets/vids/waterlotuslakeCompressed.mp4'),
  // lotusHomeVidLakeDark: require('@/assets/vids/waterHomeLotusLakeCompressed.mp4'),
  // bwlotusHomeVidLake: require('@/assets/vids/bwlotusvideowater.mp4'),
  // aliGif: 'https://compantassets.s3.us-east-2.amazonaws.com/ali-boxing-ez.gif',
  // aliGif: 'https://compantassets.s3.us-east-2.amazonaws.com/video-output-AB7DBE00-8A10-47C3-843F-391DD8119B3C-1-2.gif',
  // aliVideo: require('@/assets/vids/ali-boxing.mp4'),

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