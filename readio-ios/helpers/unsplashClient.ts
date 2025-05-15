import Constants from 'expo-constants';

// if (
//     !Constants.expoConfig?.extra?.UNSPLASH_ACESSS_KEY_1 ||
//     !Constants.expoConfig?.extra?.UNSPLASH_ACESSS_KEY_2 ||
//     !Constants.expoConfig?.extra?.UNSPLASH_ACESSS_KEY_3 ||
//     !Constants.expoConfig?.extra?.UNSPLASH_SECRET_KEY_1 ||
//     !Constants.expoConfig?.extra?.UNSPLASH_SECRET_KEY_2 ||
//     !Constants.expoConfig?.extra?.UNSPLASH_SECRET_KEY_3
//   ) {
//     throw new Error("AWS dummy credentials not found in expo config");
//   }
  
//   const extra = Constants.expoConfig.extra;
  
//   const accessKeyIdParts = [
//     extra.UNSPLASH_ACESSS_KEY_1,
//     extra.UNSPLASH_ACESSS_KEY_2,
//     extra.UNSPLASH_ACESSS_KEY_3,
//   ];
  
//   const secretAccessKeyParts = [
//     extra.UNSPLASH_SECRET_KEY_1,
//     extra.UNSPLASH_SECRET_KEY_2,
//     extra.UNSPLASH_SECRET_KEY_3,
//  ];
  

//  const reconstructKey = (parts: string[]) => parts.join("");

const {
  UNSPLASH_ACESSS_KEY,
  UNSPLASH_SECRET_KEY
} = Constants?.expoConfig?.extra || {};

 export const unsplashAccessKeyId = UNSPLASH_ACESSS_KEY;
 export const unsplashSecretAccessKey = UNSPLASH_SECRET_KEY;


