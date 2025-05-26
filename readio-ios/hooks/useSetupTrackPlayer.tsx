import { useEffect, useRef } from "react";
import TrackPlayer, {
    RepeatMode,
    Capability,
    AppKilledPlaybackBehavior,
    IOSCategory,
    IOSCategoryMode,
    IOSCategoryOptions
} from "react-native-track-player";

const setupPlayer = async () => {
    try {
        await TrackPlayer.setupPlayer({
            maxCacheSize: 1024 * 10,
            autoHandleInterruptions: true,
            iosCategory: IOSCategory.Playback,
            iosCategoryOptions: [
                IOSCategoryOptions.MixWithOthers,
                IOSCategoryOptions.AllowBluetooth,
                IOSCategoryOptions.AllowAirPlay
            ],
            iosCategoryMode: IOSCategoryMode.SpokenAudio,
        });

        await TrackPlayer.setVolume(0.618);
        await TrackPlayer.setRepeatMode(RepeatMode.Off);

        await TrackPlayer.updateOptions({
            android: {
                appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback
            },
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.Stop,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
                Capability.SeekTo,
            ],
            compactCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
            ],
            progressUpdateEventInterval: 1,
            notificationCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
            ],
        });
    } catch (error) {
        console.error("Error setting up track player:", error);
    }
}

export const useSetupTrackPlayer = ({ onLoad }: { onLoad?: () => void}) => {
    const isInitialized = useRef(false)
    
    useEffect(() => {
        if (!isInitialized.current) {
            setupPlayer().then(() => {
                isInitialized.current = true;
                onLoad?.();
                console.log("TrackPlayer: Player setup complete.");
            })
            .catch((error) => {
                isInitialized.current = false;
                console.error("TrackPlayer: Error during setupPlayer in hook:", error);
            });
        }

        return () => {
            if (isInitialized.current) {
                TrackPlayer.reset();
            }
        };
    }, [onLoad]);
}