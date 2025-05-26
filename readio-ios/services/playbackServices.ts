import TrackPlayer, { Event, State } from 'react-native-track-player';

export const PlaybackService = async function() {
    TrackPlayer.addEventListener(Event.RemotePlay, async () => {
        try {
            await TrackPlayer.play();
        } catch (error) {
            console.error('Error in RemotePlay:', error);
        }
    });

    TrackPlayer.addEventListener(Event.RemotePause, async () => {
        try {
            await TrackPlayer.pause();
        } catch (error) {
            console.error('Error in RemotePause:', error);
        }
    });

    TrackPlayer.addEventListener(Event.RemoteStop, async () => {
        try {
            await TrackPlayer.pause();
            await TrackPlayer.seekTo(0);
        } catch (error) {
            console.error('Error in RemoteStop:', error);
        }
    });

    TrackPlayer.addEventListener(Event.RemoteNext, async () => {
        try {
            await TrackPlayer.skipToNext();
        } catch (error) {
            console.error('Error in RemoteNext:', error);
        }
    });

    TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
        try {
            await TrackPlayer.skipToPrevious();
        } catch (error) {
            console.error('Error in RemotePrevious:', error);
        }
    });

    TrackPlayer.addEventListener(Event.RemoteSeek, async (event) => {
        try {
            await TrackPlayer.seekTo(event.position);
        } catch (error) {
            console.error('Error in RemoteSeek:', error);
        }
    });

    // Handle playback state changes
    TrackPlayer.addEventListener(Event.PlaybackState, async (state) => {
        try {
            console.log('Playback State Changed:', state);
            if (state.state === State.None) {
                // Playback has been reset or stopped
                await TrackPlayer.seekTo(0);
            }
        } catch (error) {
            console.error('Error in PlaybackState:', error);
        }
    });

    // Handle track changes
    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
        try {
            if (event.track) {
                console.log('Now playing:', event.track.title);
            }
        } catch (error) {
            console.error('Error in PlaybackTrackChanged:', error);
        }
    });

    // Handle playback queue ended
    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async (event) => {
        try {
            console.log('Queue ended');
            await TrackPlayer.seekTo(0);
        } catch (error) {
            console.error('Error in PlaybackQueueEnded:', error);
        }
    });

    // If you add Capability.JumpForward or Capability.JumpBackward in useSetupTrackPlayer,
    // you'll need to handle Event.RemoteJumpForward and Event.RemoteJumpBackward here.
    // Example:
    // TrackPlayer.addEventListener(Event.RemoteJumpForward, async ({ interval }) => {
    //   const position = await TrackPlayer.getPosition();
    //   await TrackPlayer.seekTo(position + (interval || 15)); // Default to 15s if interval not provided
    // });
    // TrackPlayer.addEventListener(Event.RemoteJumpBackward, async ({ interval }) => {
    //   const position = await TrackPlayer.getPosition();
    //   await TrackPlayer.seekTo(position - (interval || 15)); // Default to 15s if interval not provided
    // });
};