import Constants from 'expo-constants';

// Validate that all dummy parts exist
if (
    !Constants.expoConfig?.extra?.UNSPLASH_ACESSS_KEY_1 ||
    !Constants.expoConfig?.extra?.UNSPLASH_ACESSS_KEY_2 ||
    !Constants.expoConfig?.extra?.UNSPLASH_ACESSS_KEY_3 ||
    !Constants.expoConfig?.extra?.UNSPLASH_SECRET_KEY_1 ||
    !Constants.expoConfig?.extra?.UNSPLASH_SECRET_KEY_2 ||
    !Constants.expoConfig?.extra?.UNSPLASH_SECRET_KEY_3
  ) {
    throw new Error("AWS dummy credentials not found in expo config");
  }
  
  // Extract dummy parts and salt from Expo config
  const extra = Constants.expoConfig.extra;
  
  const accessKeyIdParts = [
    extra.UNSPLASH_ACESSS_KEY_1,
    extra.UNSPLASH_ACESSS_KEY_2,
    extra.UNSPLASH_ACESSS_KEY_3,
  ];
  
  const secretAccessKeyParts = [
    extra.UNSPLASH_SECRET_KEY_1,
    extra.UNSPLASH_SECRET_KEY_2,
    extra.UNSPLASH_SECRET_KEY_3,
 ];
  
  // Function to combine parts into the full key
  const reconstructKey = (parts: string[]) => parts.join("");
  // Reconstruct 
export const unsplashAccessKeyId = reconstructKey(accessKeyIdParts);
export const unsplashSecretAccessKey = reconstructKey(secretAccessKeyParts);


