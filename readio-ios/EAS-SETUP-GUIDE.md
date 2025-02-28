# EAS Update Setup Guide

## Overview
EAS Update is a powerful tool that enables native app testing and deployment in a GitHub-like workflow. This guide explains how to set it up and use it effectively, especially for apps with native features that can't be tested in Expo Go.

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
    "runtimeVersion": "1.0.0",
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