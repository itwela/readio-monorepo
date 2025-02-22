Before proceeding, run the following command to configure updates:

```bash
eas update:configure
```

Secondly, It's important to know that if you do not do the steps below, you're going to have to make a new build and this time do the steps because that small block of cold won't actually be in the file so essentially make sure that you do the thing below before you push the actual build to production so that you insure every setting is actually there and you should be able to not have to rebuild at that point and you should be able to just run the update and push it that way

# Configure update channels in an iOS native project

**IMPORTANT**: This configuration is specifically required for native iOS projects. The following settings must be re-added to Expo.plist after each fresh build of the project.

In Expo.plist, you'll need to add the following, replacing your-channel-name with the channel that matches your project:

```xml
<key>EXUpdatesRequestHeaders</key>
<dict>
  <key>expo-channel-name</key>
  <string>your-channel-name</string>
</dict>
```

Note: Every time you perform a fresh build of your native iOS project, you'll need to ensure these settings are present in your Expo.plist file, as they may be reset during the build process.
