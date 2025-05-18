import { useEffect, useRef } from "react";
import TrackPlayer, { RepeatMode, Capability } from "react-native-track-player";


const setupPlayer = async () => {
    // console.log("TrackPlayer: Attempting to setup player...");
    await TrackPlayer.setupPlayer({
        // 10 MB
        maxCacheSize: 1024 * 10,
    });
    // console.log("TrackPlayer: Player setup complete.");

    // must be between 0 and 1
    await TrackPlayer.setVolume(0.618);
    // await TrackPlayer.setVolume(0.03);
    // console.log("TrackPlayer: Volume set.");

    // STUB HOW TO CHANGE REPEAT FUNCTINALITY OF THE ENTIRE TRACK PLAYER
    // await TrackPlayer.setRepeatMode(RepeatMode.Queue);
    await TrackPlayer.setRepeatMode(RepeatMode.Off);
    // console.log("TrackPlayer: Repeat mode set to Off.");

    // IMPORTANT: Update options with capabilities for native controls
    await TrackPlayer.updateOptions({
        capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
            // Add other capabilities like Capability.JumpForward, Capability.JumpBackward if needed
        ],
        compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
        ],
        // Optional: Notification icons for Android
        // icon: require('@/assets/icons/notification_icon.png'), // General notification icon
        // playIcon: require('@/assets/icons/play_icon.png'),
        // pauseIcon: require('@/assets/icons/pause_icon.png'),
    });
    // console.log("TrackPlayer: Options updated with capabilities.");
}

export const useSetupTrackPlayer = ({ onLoad }: { onLoad?: () => void}) => {
    const isInitialized = useRef(false)
    
    useEffect(() => {
        setupPlayer().then(() => {
            isInitialized.current = true
            onLoad?.()
        })
        .catch((error) => {
            isInitialized.current = false;
            // console.error("TrackPlayer: Error during setupPlayer in hook:", error);
        })
    }, [onLoad]); // Added onLoad to dependency array as it's used in the effect
}