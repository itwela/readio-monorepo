// Define a simplified version of ExpoConfig

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
        "processing",
        "remote-notification"
      ],
      LSApplicationQueriesSchemes: [
        "lotus",
        "lotus"
      ]
    },
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
    package: "com.readionetwork.readio"
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
    CLERK_KEY_DEV: process.env.CLERK_KEY_DEV,
    CLERK_KEY_PROD: process.env.CLERK_KEY_PROD,
    AWS_SDK_LOAD_CONFIG: process.env.AWS_SDK_LOAD_CONFIG,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    SALT: process.env.SALT,
    DATABASE_URL: process.env.DATABASE_URL,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    PEXALS_API_KEY: process.env.PEXALS_API_KEY,
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    UNSPLASH_ACESSS_KEY: process.env.UNSPLASH_ACESSS_KEY,
    UNSPLASH_SECRET_KEY: process.env.UNSPLASH_SECRET_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    REVENUECAT_API_KEY_APPLE: process.env.REVENUECAT_API_KEY_APPLE,
    APPSFLYER_API_KEY: process.env.APPSFLYER_API_KEY,
    debugModeAdminTriggerEmail: process.env.debugModeAdminTriggerEmail,
    debugTriggerAdminModePass: process.env.debugTriggerAdminModePass,
    debugModeNormieTriggerEmail: process.env.debugModeNormieTriggerEmail,
    debugModeNormieTriggerPass: process.env.debugModeNormieTriggerPass,
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    url: "https://u.expo.dev/31bc3373-8136-44fa-9f25-e86d94b93d51",
    enabled: true,
    fallbackToCacheTimeout: 1000,
    checkAutomatically: "ON_LOAD",
  }
};

export default config; 