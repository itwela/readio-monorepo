import TrackPlayer, { Event, State } from 'react-native-track-player';

export const PlaybackService = async function() {

    TrackPlayer.addEventListener(Event.RemotePlay, () => {
        console.log('Event.RemotePlay');
        TrackPlayer.play();
    });

    TrackPlayer.addEventListener(Event.RemotePause, () => {
        console.log('Event.RemotePause');
        TrackPlayer.pause();
    });

    TrackPlayer.addEventListener(Event.RemoteStop, () => {
        console.log('Event.RemoteStop');
        // Consider what stop should do. Usually, pause and reset or destroy.
        // TrackPlayer.stop(); // or TrackPlayer.reset(); or TrackPlayer.destroy();
        TrackPlayer.pause(); // For simplicity, let's pause. Adjust as needed.
    });

    TrackPlayer.addEventListener(Event.RemoteNext, () => {
        console.log('Event.RemoteNext');
        TrackPlayer.skipToNext();
    });

    TrackPlayer.addEventListener(Event.RemotePrevious, () => {
        console.log('Event.RemotePrevious');
        TrackPlayer.skipToPrevious();
    });

    TrackPlayer.addEventListener(Event.RemoteSeek, (event) => { // { position: number }
        console.log('Event.RemoteSeek', event.position);
        TrackPlayer.seekTo(event.position);
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

    // You can also listen to other events like:
    // TrackPlayer.addEventListener(Event.PlaybackState, (state) => {
    //   console.log('Playback State:', state);
    // });
    // TrackPlayer.addEventListener(Event.PlaybackTrackChanged, (data) => {
    //   console.log('Track changed:', data);
    // });
};