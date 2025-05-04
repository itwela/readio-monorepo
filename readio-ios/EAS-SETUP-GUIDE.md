# EAS Update Setup Guide

## Overview

EAS Update is a powerful tool that enables native app testing and deployment in a GitHub-like workflow. This guide explains how to set it up and use it effectively, especially for apps with native features that can't be tested in Expo Go.

## Once you successfully build once do this:

- When you're ready to push it update first commit your changes to GitHub.
- Second, make sure that the message that you sent is different from the one you may have sent previously make sure you always use a unique message. It really doesn't matter what it is. It just needs to be unique.
- Then you can run the eas update function, and you will see your changes.

## Quick Expo Commands

- **Commit changed to Github**

```bash
git add . && git commit -m "your message here" && git push
```

- **Test if build will work locally attempt**

```bash
rm -rf ~/.eas-build-local && eas build --platform ios --local --profile preview
```

- **Get Rid Of Local Build**

```bash
rm -rf ~/.eas-build-local
```



- **Start**

```bash
npx expo start -c
```

- **Prebuild**

```bash
  npx expo prebuild -p ios --clean
```

- **Build**

```bash
eas build --profile preview

eas build --profile development
eas build --profile production
```

- **Update**

```bash

cd Documents/Projects/Lotus/readio-ios/

eas update --branch preview --message "app toggle debug"

This should be
eas update --branch preview --message "Your update message"
eas update --branch development --message "Your update message"
eas update --branch production --message "Production update"
```

## How to register a new device for eas testing:

eas device:create

get thw website url

then make new build

## Why EAS Update?

- **Native Feature Testing**: Test features like notifications and audio players that require native device access
- **Quick Iterations**: Deploy JavaScript changes without App Store submissions
- **Development Flexibility**: Test builds locally with full native functionality

## Setup Process

### 1. Configure eas.json

Create or update your `eas.json` file with the following configuration:

```json
{
  "cli": {
    "version": ">= 12.6.2",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "autoIncrement": true,
      "channel": "production"
    }
  },
  "submit": {
    "production": {}
  }
}
```

## 1.5 -------------------------------------------------------------------------

I'm going to look into this specifically to see if this actually works:

"submit": {
  "production": {
    "ios": {
      "appleId": "your.apple@email.com",
      "ascAppId": "1234567890",
      "appleTeamId": "ABCDEF12345"
    },
    "android": {
      "track": "internal",
      "releaseStatus": "completed"
    }
  }
}

As if it does, I wouldn't even have to open the Apple Store connect once the build is approved like the first time. Obviously, I have to add a lot of the initial images and such when I first submitted, but a lot of that's gonna stay the same if I'm not mistaken, so I should be able to just submit this?

# Note according to AI:

Yes! Let me clarify how the EAS submit configuration works:

The submit configuration you're looking at will indeed automate most of the submission process, but here's the key breakdown:

1. **First-time submission** requires:

   - Manual setup in App Store Connect
   - Screenshots, app description, privacy policy
   - Age ratings
   - App Store categories
   - Marketing materials
2. **Subsequent submissions** can be automated with this configuration:

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your.apple@email.com",
      "ascAppId": "1234567890",
      "appleTeamId": "ABCDEF12345"
    }
  }
}
```

You're correct! Once the initial submission is approved:

- All metadata (screenshots, descriptions) stays the same
- Future builds can be submitted directly using `eas submit`
- You can skip the App Store Connect manual process
- The command will handle version bumping and submission

You can run:

```bash
eas submit -p ios
```

This will:

1. Take your built app
2. Submit it to App Store Connect
3. Start the review process

The only time you'd need to go back to App Store Connect is if you want to:

- Update screenshots
- Change app metadata
- Modify privacy details
- Add new in-app purchases

Would you like me to explain how to set up automated builds and submissions together?

## -----------------------------------------------------------------------------

### 2. Update app.json Configuration

Add the following to your `app.json` within the `expo` object:

```json
{
  "expo": {
    "ios": {
      "runtimeVersion": "1.0.0"
    },
    "android": {
      "runtimeVersion": {
        "policy": "sdkVersion"
      }
    },
    "updates": {
      "url": "https://u.expo.dev/YOUR-PROJECT-ID"
    },
    "plugins": [
      [
        "expo-updates",
        {
          "username": "your-expo-username",
          "enabled": true
        }
      ]
    ]
  }
}
```

> Note: Replace `YOUR-PROJECT-ID` with your actual project ID from the Expo dashboard or build output.

## Building and Testing

### Development/Preview Builds

1. Create a development or preview build:
   ```bash
   eas build --profile preview
   # or
   eas build --profile development
   ```
2. Once complete, you'll receive a QR code to install the app on your device
3. This build will have full access to native features for testing

### Pushing Updates

1. Make changes to your JavaScript code
2. Push updates using:
   ```bash
   eas update --branch preview --message "Your update message"
   ```
3. The update will be available to users on the specified channel

## Production Workflow

### Initial Setup

1. Submit your first build to the App Store
2. Once approved, you can push JavaScript updates without new submissions

### Update Process

1. Push updates to production:
   ```bash
   eas update --branch production --message "Production update"
   ```
2. Updates will be delivered to users automatically

> Note: Native code changes (new libraries, etc.) still require App Store review

## Important Notes

- Keep track of your Expo username for plugin configuration
- The project ID in the updates URL must match your build's project ID
- Runtime versions must match across configurations
- The project ID can be found in the build output, or by going on to their site, clicking the build, show  more info, and then you'll see it.
- Different channels (preview, development, production) serve different purposes
- Production builds don't show QR codes - they generate files for App Store submission

## Troubleshooting

- Ensure your username in the expo-updates plugin matches your Expo account
- Verify the project ID in the updates URL is correct
- Check that the runtime version matches across configurations
- Make sure you're using the correct channel for your build type

This guide covers the essential setup and usage of EAS Update, making it easier to test and deploy your native app updates efficiently.

Your guide is excellent because it's practical and sequential. Let me suggest some "gotchas" we could add to make it even more valuable:

## Common Gotchas and Solutions

### Runtime Version Mismatches

- **Problem**: Updates failing with "Runtime version mismatch"
- **Solution**: Ensure `runtimeVersion` in app.json matches across both iOS and Android
- **Tip**: Use `"policy": "sdkVersion"` for Android to auto-match Expo SDK version

### Channel Confusion

- **Problem**: Updates not appearing on test devices
- **Solution**: Verify you're pushing to the correct channel:
  ```bash
  # Check current channel
  expo-cli publish:history

  # Ensure update matches build channel
  eas update --branch preview  # for preview builds
  eas update --branch production  # for production builds
  ```

### Development Client Issues

- **Problem**: Native changes not reflecting in development builds
- **Solution**: Remember that `eas update` only updates JavaScript code
- **Tip**: Need a new build (`eas build`) when adding native dependencies

### Version Control

- **Problem**: App Store rejecting due to version numbers
- **Solution**: Use `autoIncrement: true` in eas.json production config
- **Tip**: First submission must be version 1.0.0

#### --------------- FUTURE - ANDROID SETUP -------------------------------------------------------------------

Notes from AI:

Prompt:

- Yeah I hadn't even or really I just gave up on trying to do android as even getting iOS to work is complicated enough but even now I'm starting to think that because I understand this enough, I shouldn't have to do too much different for Android like I know that there's differences, but it's not like I have to redo everything. I just have to understand the like nuances the same way i kind of do now with ios

You're absolutely right! Once you understand the core EAS concepts with iOS, Android is mostly about understanding a few key differences:

1. **Runtime Version Handling**

```json
// iOS is straightforward
"ios": {
  "runtimeVersion": "1.0.0"
}

// Android needs a policy
"android": {
  "runtimeVersion": {
    "policy": "sdkVersion"
  }
}
```

2. **Submission Process**

- iOS: App Store Connect
- Android: Google Play Console

```json
"submit": {
  "production": {
    "android": {
      "track": "internal",  // vs App Store's review process
      "releaseStatus": "completed"
    }
  }
}
```

3. **Permissions Structure**
   The Android permissions you already have in your app.json are correctly structured - that's half the battle!

The core workflow remains the same:

- Same build commands
- Same update process
- Same channel system
- Same development workflow

............

Prompt:

- Can you tell me like based on my project...what are some key things that I actually would have to do different on android I feel like it would be a lot like I'm getting for steps. I'm sure the notification system is different or is this just I need to add the right settings to things?

Looking at your current project setup, here are the main Android-specific items you'd need to handle:

1. **Notifications**

- Your current iOS setup uses `UIBackgroundModes` for audio
- For Android, you'll need to add these to your app.json:

```json
"android": {
  "permissions": [
    "android.permission.POST_NOTIFICATIONS",
    "android.permission.FOREGROUND_SERVICE"
  ],
  "notification": {
    "icon": "./assets/images/notification-icon.png",
    "color": "#E9E0C1"
  }
}
```

2. **Audio Background Play**
   You already have the audio permissions set up correctly in your Android config!
3. **File System Access**
   Your current permissions already include:

```json
"android.permission.READ_EXTERNAL_STORAGE",
"android.permission.WRITE_EXTERNAL_STORAGE"
```

This covers your file system needs.

4. **Deep Linking**
   Your `scheme: "lotus"` will work the same way - just need to verify in Android manifest.

The good news is:

- Your React Native code remains the same
- Your EAS update process is identical
- Your file structure stays the same
- Your state management doesn't change

Would you like me to detail the Android-specific configuration changes needed for any particular feature you're concerned about?

..........

Prompt:

- What about like UI stuff? Is any of that different or specific to iOS or android or does it really look the same?

For your Lotus app, most of the UI will work the same across both platforms thanks to React Native, but there are a few platform-specific considerations:

1. **Safe Area Handling**
   You're already using `SafeAreaView` correctly, but Android needs additional padding consideration:

```typescript
// Your current style can be enhanced for Android
const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    // Add platform-specific padding for status bar
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  }
});
```

2. **Font Handling**
   Your custom fonts (readioRegularFont, readioBoldFont) need Android-specific naming:

```json
"android": {
  "adaptiveIcon": {
    // ... your existing config ...
  },
  "softwareKeyboardLayoutMode": "pan", // Helps with keyboard behavior
  "allowBackup": true
}
```

3. **Video/Audio Player**
   Your current implementation using `expo-av` works cross-platform! No changes needed.
4. **Linear Gradients**
   Your existing gradient implementations will work the same on Android - no changes needed.

The good news is that most of your current UI code will work as-is on Android. The main differences are more about handling system features (status bar, navigation bar, etc.) than actual UI components.
