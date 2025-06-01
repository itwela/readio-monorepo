import React, { createContext, useContext, useEffect } from 'react';
import TrackPlayer, { Event } from 'react-native-track-player';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface LotusPlayTrackingContextType {
  // This provider handles tracking automatically via listeners
}

const LotusPlayTrackingContext = createContext<LotusPlayTrackingContextType>({});

export const useLotusPlayTracking = () => {
  const context = useContext(LotusPlayTrackingContext);
  if (!context) {
    throw new Error('useLotusPlayTracking must be used within LotusPlayTrackingProvider');
  }
  return context;
};

interface LotusPlayTrackingProviderProps {
  children: React.ReactNode;
}

export const LotusPlayTrackingProvider = ({ children }: LotusPlayTrackingProviderProps) => {
  const recordTrackingToken = useMutation(api.contentAnalytics.recordTrackingToken);

  // Helper function to decide if i should record the play event
  const extractValidUrl = (track: any): { url: string, contentType: string } | undefined => {
    if (
      !track || 
      !track.url ||
      track.id === 'welcome1' ||
      track.id === 'howtomeditate1' ||
      track.contentType === 'meditation_intro' ||
      track.contentType === 'meditation_music'
    ) {
      console.log('🎵 Skipping play event recording for welcome or how to meditate track');
      return undefined;
    }

    return {
      url: track.url,
      contentType: track.contentType
    };
  };

  useEffect(() => {
    console.log('🎵 Setting up simple TrackPlayer listeners (play + complete only)');

    // Listen for when playback starts
    const playbackStartedListener = TrackPlayer.addEventListener(Event.PlaybackState, async (event) => {
      if (event.state === 'playing') {
        try {
          const activeTrack = await TrackPlayer.getActiveTrack();
          if (activeTrack) {
            console.log('🎵 Play detected for:', activeTrack.title);
            
            // Extract and validate URL
            const validToRecord = extractValidUrl(activeTrack);
            if (!validToRecord) {
              console.log('⚠️ Skipping play token recording - no valid URL');
              return;
            }

            console.log('🎵 Valid URL:', validToRecord);
            
            await recordTrackingToken({
              contentType: activeTrack.contentType || 'article',
              content_id: activeTrack._id || undefined,
              item_url: validToRecord.url,
              token_type: 'play_token'
            });
            console.log('📊 Play token recorded');
          }
        } catch (error) {
          console.error('❌ Error recording play token:', error);
        }
      }
    });

    // Listen for queue completion
    const queueEndedListener = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
      try {
        const activeTrack = await TrackPlayer.getActiveTrack();
        if (activeTrack) {
          console.log('🎵 Complete detected for:', activeTrack.title);
          
          // Extract and validate URL
          const validToRecord = extractValidUrl(activeTrack);
          if (!validToRecord) {
            console.log('⚠️ Skipping complete token recording - no valid URL');
            return;
          }
          
          await recordTrackingToken({
            contentType: validToRecord.contentType || 'article',
            content_id: activeTrack._id || undefined,
            item_url: validToRecord.url,
            token_type: 'complete'
          });
          console.log('📊 Complete token recorded');
        }
      } catch (error) {
        console.error('❌ Error recording complete token:', error);
      }
    });

    return () => {
      console.log('🎵 Cleaning up listeners');
      playbackStartedListener.remove();
      queueEndedListener.remove();
    };
  }, [recordTrackingToken]);

  const value: LotusPlayTrackingContextType = {};

  return (
    <LotusPlayTrackingContext.Provider value={value}>
      {children}
    </LotusPlayTrackingContext.Provider>
  );
}; 