import TrackPlayer, { Event, State, Track } from 'react-native-track-player';
import { useState, useCallback, useRef } from 'react';
import { useLotusUser } from './lotusUserContext';
import sql from '../neonClient';

type ContentType = 'article' | 'music' | 'audiobook' | 'liner_notes' | 'docu_series' | 'meditation_intro';

export const useLotusPlayTracking = () => {
  const { user } = useLotusUser();
  const [trackedPlays, setTrackedPlays] = useState<Record<string, boolean>>({});
  const listenersSetup = useRef(false);

  const recordPlayEvent = useCallback(async (
    track: any,
    eventType: 'play' | 'complete' | 'skip'
  ) => {
    if (!track || !user) return;

    try {
      await sql`
        INSERT INTO content_analytics (
          contentType,
          content_id,
          item_url,
          plays,
          completes,
          skips
        ) VALUES (
          ${track.contentType || 'article'},
          ${track.id ? parseInt(track.id) : null},
          ${track.url},
          ${eventType === 'play' ? 1 : 0},
          ${eventType === 'complete' ? 1 : 0},
          ${eventType === 'skip' ? 1 : 0}
        )
        ON CONFLICT (contentType, content_id, item_url) 
        DO UPDATE SET
          plays = CASE 
            WHEN ${eventType === 'play'} THEN content_analytics.plays + 1 
            ELSE content_analytics.plays 
          END,
          completes = CASE 
            WHEN ${eventType === 'complete'} THEN content_analytics.completes + 1 
            ELSE content_analytics.completes 
          END,
          skips = CASE 
            WHEN ${eventType === 'skip'} THEN content_analytics.skips + 1 
            ELSE content_analytics.skips 
          END,
          last_played_at = NOW()
      `;
      
      console.log('✅ Play event recorded:', { contentType: track.contentType || 'article', contentId: track.id, itemUrl: track.url });
    } catch (error) {
      console.error('❌ Error recording play event:', error);
    }
  }, [user]);

  const setupListeners = useCallback(() => {
    if (listenersSetup.current) {
      return () => {}; // Return empty cleanup function
    }

    listenersSetup.current = true;

    const trackChangedSub = TrackPlayer.addEventListener(
      Event.PlaybackActiveTrackChanged,
      async (event) => {
        try {
          if (event.track?.url) {
            setTrackedPlays(prev => ({
              ...prev,
              [event.track!.url]: false // Reset counted status for new track
            }));
          }
        } catch (error) {
          console.error('Error in track changed listener:', error);
        }
      }
    );

    const progressSub = TrackPlayer.addEventListener(
      Event.PlaybackProgressUpdated,
      async (event) => {
        try {
          const track = await TrackPlayer.getActiveTrack();
          if (!track?.url || trackedPlays[track.url]) return;

          const threshold = event.duration < 30 ? 
            event.duration * 0.9 : 30;

          if (event.position >= threshold) {
            await recordPlayEvent(track, 'complete');
            setTrackedPlays(prev => ({
              ...prev,
              [track.url]: true
            }));
          }
        } catch (error) {
          console.error('Error in progress listener:', error);
        }
      }
    );

    const queueEndedSub = TrackPlayer.addEventListener(
      Event.PlaybackQueueEnded,
      async () => {
        try {
          const track = await TrackPlayer.getActiveTrack();
          if (track?.url && !trackedPlays[track.url]) {
            await recordPlayEvent(track, 'skip');
          }
        } catch (error) {
          console.error('Error in queue ended listener:', error);
        }
      }
    );

    return () => {
      listenersSetup.current = false;
      try {
        trackChangedSub.remove();
        progressSub.remove();
        queueEndedSub.remove();
      } catch (error) {
        console.error('Error removing listeners:', error);
      }
    };
  }, [trackedPlays, recordPlayEvent]);

  return {
    setupListeners,
    resetTracking: () => {
      setTrackedPlays({});
      listenersSetup.current = false;
    }
  };
};
