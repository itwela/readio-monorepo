# Custom Notifications with Sound in Expo React Native

## Overview

This guide explains how to implement custom notifications with sound in an Expo React Native app, based on our successful implementation in the Lotus app. It covers configuration, sound file setup, and implementation for both iOS and Android platforms.

## Prerequisites

- Expo SDK installed
- expo-notifications package
- Sound files in .mp3 format

## Step 1: Configure app.json

Add the following configuration to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/cropblacklogo.png",
          "color": "#ffffff",
          "sounds": [
            "./assets/sounds/presence/Lotus-Presence-Intro-Chime.mp3",
            "./assets/sounds/presence/Lotus-Presence-Outro-Chime.mp3"
          ]
        }
      ]
    ]
  }
}
```

### Important Configuration Notes:
- Sound files must be listed in the `sounds` array
- File paths are relative to project root
- Sound files must be .mp3 format

## Step 2: Create Notification Provider

Create a `LotusNotificationProvider.tsx` file:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface LotusNotificationContextType {
  sendNotification: (title: string, body: string, data?: object, sound?: any) => Promise<void>;
  scheduleNotification: (title: string, body: string, trigger: any, data?: object, sound?: any) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  getNotificationPermissions: () => Promise<boolean>;
}

const LotusNotificationContext = createContext<LotusNotificationContextType | null>(null);

export const LotusNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasPermission, setHasPermission] = useState(false);

  // Platform-specific sound formatting
  const validateAndFormatSound = (sound?: any) => {
    if (!sound) return undefined;
    
    const soundName = sound?.name || sound;
    if (!soundName) return undefined;

    // For iOS, keep the extension
    if (Platform.OS === 'ios') {
      return soundName;
    }
    
    // For Android, remove the extension
    return soundName.replace('.mp3', '');
  };

  // Send immediate notification
  const sendNotification = async (title: string, body: string, data: object = {}, sound?: string) => {
    const formattedSound = validateAndFormatSound(sound);
  
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: formattedSound
      },
      trigger: null,
    });
  };

  // Other provider implementation...
};
```

### Key Provider Features:
1. Platform-specific sound handling
2. Permission management
3. Immediate and scheduled notifications
4. Sound validation and formatting

## Step 3: Using the Provider

Wrap your app with the provider:

```typescript
// App.tsx or similar
import { LotusNotificationProvider } from './providers/LotusNotificationProvider';

export default function App() {
  return (
    <LotusNotificationProvider>
      {/* Your app components */}
    </LotusNotificationProvider>
  );
}
```

## Step 4: Sending Notifications

Use the provider in your components:

```typescript
import { useLotusNotifications } from '@/helpers/providers/LotusNotificationProvider';
import { SoundAssets } from '@/constants/soundAssets';

export default function YourComponent() {
  const { sendNotification } = useLotusNotifications();

  const handleNotification = async () => {
    try {
      await sendNotification(
        "Notification Title",
        "Notification Body",
        { type: "custom_type" },
        SoundAssets.presenceIntroChime.name
      );
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };
}
```

## Sound Asset Management

Create a sound assets constant file:

```typescript
// constants/soundAssets.ts
export const SoundAssets = {
  presenceIntroChime: {
    id: require('../assets/sounds/presence/Lotus-Presence-Intro-Chime.mp3'),
    name: 'Lotus-Presence-Intro-Chime.mp3'
  },
  presenceOutroChime: {
    id: require('../assets/sounds/presence/Lotus-Presence-Outro-Chime.mp3'),
    name: 'Lotus-Presence-Outro-Chime.mp3'
  }
};
```

## Platform-Specific Considerations

### iOS
- Sound files must be referenced with .mp3 extension
- Add required background modes in app.json:
```json
"ios": {
  "infoPlist": {
    "UIBackgroundModes": [
      "audio",
      "fetch",
      "processing"
    ]
  }
}
```

### Android
- Sound files are referenced without extension
- Add required permissions in app.json:
```json
"android": {
  "permissions": [
    "android.permission.POST_NOTIFICATIONS",
    "android.permission.FOREGROUND_SERVICE"
  ]
}
```

## Troubleshooting

1. **Sound Not Playing**
   - Verify sound file path in app.json
   - Check sound file format (must be .mp3)
   - Ensure sound name matches exactly

2. **Permission Issues**
   - Check notification permissions are granted
   - Verify background modes (iOS)
   - Check Android manifest permissions

3. **Platform Differences**
   - iOS requires .mp3 extension in sound name
   - Android requires no extension
   - Use validateAndFormatSound helper

## Testing

1. Test immediate notifications:
```typescript
await sendNotification(
  "Test Title",
  "Test Body",
  { type: "test" },
  SoundAssets.presenceIntroChime.name
);
```

2. Test scheduled notifications:
```typescript
const trigger = {
  seconds: 5 // 5 seconds delay
};

await scheduleNotification(
  "Scheduled Test",
  "This will appear in 5 seconds",
  trigger,
  {},
  SoundAssets.presenceOutroChime.name
);
```

## Best Practices

1. Always handle permissions before sending notifications
2. Use consistent sound file naming
3. Implement error handling for notification calls
4. Test on both iOS and Android
5. Keep sound files small and properly formatted
6. Use the SoundAssets constant for sound references

This implementation provides a robust, cross-platform solution for custom notification sounds in your Expo React Native app.