import { useEffect, useRef } from "react";
import TrackPlayer, { RepeatMode } from "react-native-track-player";


const setupPlayer = async () => {
    await TrackPlayer.setupPlayer({
        // 10 MB
        maxCacheSize: 1024 * 10,
    });

    // must be between 0 and 1
    await TrackPlayer.setVolume(0.618);
    // await TrackPlayer.setVolume(0.03);

    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
}

export const useSetupTrackLayer = ({ onLoad }: { onLoad?: () => void}) => {
    
    const isInitialized = useRef(false)
    
    useEffect(() => {
        setupPlayer().then(() => {
            isInitialized.current = true
            onLoad?.()
        })
        .catch((error) => {
            isInitialized.current = false
            console.error(error)
        })
    }, [onLoad])
}