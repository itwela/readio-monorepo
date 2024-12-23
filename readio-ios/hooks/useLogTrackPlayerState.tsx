import { Event, useTrackPlayerEvents } from "react-native-track-player";

const events = [Event.PlaybackState, Event.PlaybackError, Event.PlaybackTrackChanged]

export const useLogTrackPlayerState = () => {
    useTrackPlayerEvents(events, async (event) => {

        if(event.type == Event.PlaybackError) {
            console.error('An Error Occured:', event)
        }
    
        if(event.type == Event.PlaybackState) {
            console.log('Playback State:', event)
        }
   
        if(event.type == Event.PlaybackTrackChanged) {
            console.log('Track Changed:', event)
        }
    })
}