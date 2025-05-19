// app.config.js - Making it more robust
module.exports = ({ config }: {config: any}) => {
  // Get the channel from EAS environment variables, checking all possible sources
  const channel = process.env.EAS_CHANNEL || 
                 process.env.EXPO_PUBLIC_EAS_CHANNEL || 
                 process.env.APP_ENV ||
                 "production";
  
  console.log(`Building with channel: ${channel}`);
  
  // Ensure plugins array exists
  if (!config.plugins) {
    config.plugins = [];
  }

  // Define the core plugins if they don't exist in app.json
  const requiredPlugins = [
    ["expo-router", { "origin": "https://readionetwork.com/" }],
    ["expo-notifications", {
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
    }],
    ["expo-splash-screen", {
      "image": "./assets/images/splash-icon.png",
      "imageWidth": 200,
      "resizeMode": "contain",
      "backgroundColor": "#E9E0C1"
    }]
  ];

  // Add required plugins if they don't exist
  requiredPlugins.forEach(plugin => {
    const exists = config.plugins.some((p: any) => 
      Array.isArray(p) && p[0] === plugin[0]
    );
    
    if (!exists) {
      config.plugins.push(plugin);
    }
  });
  
  // Critical: Force the updates configuration to be complete and correct
  config.updates = {
    url: "https://u.expo.dev/31bc3373-8136-44fa-9f25-e86d94b93d51",
    enabled: true,
    fallbackToCacheTimeout: 10000,
    checkAutomatically: "ON_LOAD",
    channel: channel,
  };
  
  // Force the expo-updates plugin to have the correct channel
  const updatesPluginIndex = config.plugins.findIndex((p: any) => 
    Array.isArray(p) && p[0] === "expo-updates"
  );
  
  if (updatesPluginIndex >= 0) {
    config.plugins[updatesPluginIndex] = [
      "expo-updates",
      {
        "username": "itwela",
        "enabled": true,
        "channel": channel
      }
    ];
  } else {
    config.plugins.push([
      "expo-updates",
      {
        "username": "itwela",
        "enabled": true,
        "channel": channel
      }
    ]);
  }

  // Add debug properties for updates
  if (config.ios) {
    if (!config.ios.infoPlist) {
      config.ios.infoPlist = {};
    }
    
    // Add logging for updates
    config.ios.infoPlist.EXUpdatesLogLevel = "debug";
    config.ios.infoPlist.EXUpdatesInspectorPort = 9091;
  }
  
  if (config.android) {
    if (!config.android.buildProperties) {
      config.android.buildProperties = {};
    }
    if (!config.android.buildProperties.gradle) {
      config.android.buildProperties.gradle = {};
    }
    
    // Add logging for updates on Android
    config.android.buildProperties.gradle.systemProperties = {
      ...config.android.buildProperties.gradle.systemProperties,
      "expo.updates.log.level": "debug"
    };
  }

  // Preserve all environment variables
  config.extra = {
    ...config.extra,
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
  };

  // Ensure expo-updates is properly configured for production use
  if (!config.assetBundlePatterns) {
    config.assetBundlePatterns = ["**/*"];
  }

  // For production builds, ensure all required properties are set
  if (channel === "production") {
    if (!config.version) {
      config.version = "1.0.0";
    }
    
    // Any production-specific settings
  }

  console.log("Final updates config:", JSON.stringify(config.updates, null, 2));
  console.log("Final expo-updates plugin:", JSON.stringify(
    config.plugins.find((p: any) => Array.isArray(p) && p[0] === "expo-updates"), 
    null, 2
  ));

  return config;
};