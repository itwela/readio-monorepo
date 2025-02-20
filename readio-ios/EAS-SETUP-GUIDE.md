# EAS Setup Guide for Expo React Native Applications

## Overview
This guide covers the essential steps for setting up and configuring EAS (Expo Application Services) updates in your Expo React Native application.

## Project Configuration

### 1. Project ID Setup
Your EAS project ID is configured in `app.json` under the `extra.eas.projectId` field:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "31bc3373-8136-44fa-9f25-e86d94b93d51"
      }
    }
  }
}
```

### 2. Updates Configuration
Configure the updates section in `app.json`:
```json
{
  "expo": {
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/31bc3373-8136-44fa-9f25-e86d94b93d51"
    }
  }
}
```

### 3. Runtime Version Configuration
Set the runtime version for both iOS and Android:

#### iOS
```json
{
  "expo": {
    "ios": {
      "runtimeVersion": "1.0.0"
    }
  }
}
```

#### Android
```json
{
  "expo": {
    "android": {
      "runtimeVersion": {
        "policy": "appVersion"
      }
    }
  }
}
```

## Common Issues and Troubleshooting

1. **Updates Not Loading**
   - Verify that the project ID is correct
   - Ensure the update URL is properly configured
   - Check that the runtime version matches your app version

2. **Version Mismatch**
   - Make sure the runtime version in your native builds matches the updates you're publishing
   - For iOS, use a specific version number
   - For Android, you can use either a specific version or policy-based versioning

3. **Cache Issues**
   - Clear the app's cache if updates aren't appearing
   - Set appropriate `fallbackToCacheTimeout` values

## Best Practices

1. **Version Management**
   - Keep runtime versions synchronized with app versions
   - Use semantic versioning for iOS runtime versions
   - Consider using policy-based versioning for Android

2. **Update Frequency**
   - Set `checkAutomatically` to "ON_LOAD" for immediate updates
   - Configure appropriate cache timeout values
   - Test updates thoroughly before publishing

3. **Development Workflow**
   - Use development builds for testing
   - Create separate channels for development, staging, and production
   - Implement proper rollback procedures

## Additional Resources

- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Runtime Versions Guide](https://docs.expo.dev/eas-update/runtime-versions/)
- [Update Rollbacks](https://docs.expo.dev/eas-update/rollbacks/)