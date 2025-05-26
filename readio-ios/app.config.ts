// Define a simplified version of ExpoConfig

import { runtimeVersion } from "expo-updates";

declare let process: {
    env: Record<string, string | undefined>;
};

type ExpoConfig = {
  [key: string]: any;
};

const config: ExpoConfig = {
  name: "Lotus",
  slug: "readionetwork",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "lotus",
  userInterfaceStyle: "automatic",
  newArchEnabled: false,
  ios: {
    bundleIdentifier: "com.readionetwork.readio",
    entitlements: {
      "com.apple.developer.usernotifications.time-sensitive": true
    },
    infoPlist: {
      UIBackgroundModes: [
        "audio",
        "fetch",
        "remote-notification"
      ],
      LSApplicationQueriesSchemes: [
        "lotus",
      ],
      ITSAppUsesNonExemptEncryption: false,
      AVAudioSessionCategoryPlayback: true,
      AVAudioSessionCategoryOptions: [
        "allowAirPlay",
        "allowBluetooth",
        "allowBluetoothA2DP",
        "allowHapticsAndSystemSounds",
        "AVAudioSessionCategoryOptionMixWithOthers",
        "AVAudioSessionCategoryOptionAllowBluetooth",
        "AVAudioSessionCategoryOptionAllowAirPlay"
      ]
    },
    runtimeVersion: "1.0.0",
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    permissions: [
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.INTERNET",
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.INTERNET"
    ],
    package: "com.readionetwork.readio",
    runtimeVersion: "1.0.0",
  },
  plugins: [
    [
      "expo-router",
      {
        "origin": "https://readionetwork.com/"
      }
    ],
    [
      "expo-notifications",
      {
        "icon": "./assets/images/cropblacklogo.png",
        "color": "#ffffff",
        "sounds": [
          "./assets/sounds/presence/Lotus-Presence-Intro-Chime.mp3",
          "./assets/sounds/presence/Lotus-Presence-Outro-Chime.mp3",
          "./assets/sounds/Lotus-Water-Goals.mp3",
          "./assets/sounds/Drinkwater-Jingle.mp3",
          "./assets/sounds/Flute-Chime-Kgas.mp3"
        ],
        "enableBackgroundRemoteNotifications": true
      }
    ],
    [
      "expo-splash-screen",
      {
        "image": "./assets/images/splash-icon.png",
        "imageWidth": 200,
        "resizeMode": "contain",
        "backgroundColor": "#E9E0C1"
      }
    ],
    [
      "expo-secure-store",
      {
        "configureAndroidBackup": true,
        "faceIDPermission": "Allow $(PRODUCT_NAME) to access your Face ID biometric data."
      }
    ],
    [
      "expo-location",
      {
        "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
      }
    ],
    [
      "expo-file-system",
      {
        "fileSystemSchemes": [
          "file"
        ]
      }
    ],
    [
      "expo-updates",
      {
        "username": "itwela",
        "enabled": true,
        "channel": "preview"
      }
    ],
    [
      "expo-video",
      {
        "supportsBackgroundPlayback": false,
        "supportsPictureInPicture": false
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    eas: {
      projectId: "31bc3373-8136-44fa-9f25-e86d94b93d51"
    },
    // EXPO_PUBLIC_CLERK_KEY_DEV: process.env.EXPO_PUBLIC_CLERK_KEY_DEV,
    // EXPO_PUBLIC_CLERK_KEY_PROD: process.env.EXPO_PUBLIC_CLERK_KEY_PROD,
    // EXPO_PUBLIC_AWS_SDK_LOAD_CONFIG: process.env.EXPO_PUBLIC_AWS_SDK_LOAD_CONFIG,
    // EXPO_PUBLIC_AWS_ACCESS_KEY_ID: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID,
    // EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY: process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY,
    // EXPO_PUBLIC_SALT: process.env.EXPO_PUBLIC_SALT,
    
    // EXPO_PUBLIC_DATABASE_URL: process.env.EXPO_PUBLIC_DATABASE_URL,
    // EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY,
    // EXPO_PUBLIC_OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    // EXPO_PUBLIC_PEXALS_API_KEY: process.env.EXPO_PUBLIC_PEXALS_API_KEY,
    // EXPO_PUBLIC_REPLICATE_API_TOKEN: process.env.EXPO_PUBLIC_REPLICATE_API_TOKEN,
    // EXPO_PUBLIC_UNSPLASH_ACESSS_KEY: process.env.EXPO_PUBLIC_UNSPLASH_ACESSS_KEY,
    // EXPO_PUBLIC_UNSPLASH_SECRET_KEY: process.env.EXPO_PUBLIC_UNSPLASH_SECRET_KEY,
    // EXPO_PUBLIC_ELEVENLABS_API_KEY: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY,
    // EXPO_PUBLIC_REVENUECAT_API_KEY_APPLE: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_APPLE,
    // EXPO_PUBLIC_APPSFLYER_API_KEY: process.env.EXPO_PUBLIC_APPSFLYER_API_KEY,
    // EXPO_PUBLIC_debugModeAdminTriggerEmail: process.env.EXPO_PUBLIC_debugModeAdminTriggerEmail,
    // EXPO_PUBLIC_debugTriggerAdminModePass: process.env.EXPO_PUBLIC_debugTriggerAdminModePass,
    // EXPO_PUBLIC_debugModeNormieTriggerEmail: process.env.EXPO_PUBLIC_debugModeNormieTriggerEmail,
    // EXPO_PUBLIC_debugModeNormieTriggerPass: process.env.EXPO_PUBLIC_debugModeNormieTriggerPass,
  },
 runtimeVersion: "1.0.0",
  updates: {
    url: "https://u.expo.dev/31bc3373-8136-44fa-9f25-e86d94b93d51",
    enabled: true,
    fallbackToCacheTimeout: 1000,
    checkAutomatically: "ON_LOAD",
  }
};

export default config; 