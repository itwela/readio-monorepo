import TrackPlayer, { Event, State, Track } from 'react-native-track-player';
import { useState, useCallback } from 'react';
import { useLotusUser } from './lotusUserContext';
import sql from '../neonClient';

type ContentType = 'article' | 'music' | 'audiobook' | 'liner_notes' | 'docu_series' | 'meditation_intro';

export const useLotusPlayTracking = () => {
  const { user } = useLotusUser();
  const [trackedPlays, setTrackedPlays] = useState<Record<string, boolean>>({});

  const recordPlayEvent = useCallback(async (track: Track, eventType: 'play'|'complete'|'skip') => {
    if (!user?.id || !track?.url) return;

    try {
      await sql`
        INSERT INTO content_analytics 
          (user_id, content_type, content_url, title, artist, 
           ${eventType === 'play' ? 'plays' : ''}
           ${eventType === 'complete' ? 'completes' : ''}
           ${eventType === 'skip' ? 'skips' : ''})
        VALUES 
          (${user.id}, ${track.contentType || 'article'}, ${track.url}, 
           ${track.title || 'Untitled'}, ${track.artist || 'Unknown'},
           ${eventType === 'play' ? 1 : 0}
           ${eventType === 'complete' ? 1 : 0}
           ${eventType === 'skip' ? 1 : 0})
        ON CONFLICT (user_id, content_url) 
        DO UPDATE SET
          ${eventType === 'play' ? 'plays = content_analytics.plays + 1' : ''}
          ${eventType === 'complete' ? 'completes = content_analytics.completes + 1' : ''}
          ${eventType === 'skip' ? 'skips = content_analytics.skips + 1' : ''},
          last_played_at = NOW()
      `;
    } catch (error) {
      console.error('Error recording play event:', error);
    }
  }, [user]);

  const setupListeners = useCallback(() => {
    const trackChangedSub = TrackPlayer.addEventListener(
      Event.PlaybackActiveTrackChanged,
      async () => {
        const index = await TrackPlayer.getActiveTrackIndex();
        if (index != null) {
          const track = await TrackPlayer.getTrack(index);
          if (track?.url) {
            setTrackedPlays(prev => ({
              ...prev,
              [track.url]: false // Reset counted status for new track
            }));
          }
        }
      }
    );

    const progressSub = TrackPlayer.addEventListener(
      Event.PlaybackProgressUpdated,
      async (event) => {
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
      }
    );

    const queueEndedSub = TrackPlayer.addEventListener(
      Event.PlaybackQueueEnded,
      async () => {
        const track = await TrackPlayer.getActiveTrack();
        if (track?.url && !trackedPlays[track.url]) {
          await recordPlayEvent(track, 'skip');
        }
      }
    );

    return () => {
      trackChangedSub.remove();
      progressSub.remove();
      queueEndedSub.remove();
    };
  }, [trackedPlays, recordPlayEvent]);

  return {
    setupListeners,
    resetTracking: () => setTrackedPlays({})
  };
};
