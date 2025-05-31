import { useCallback } from 'react';
import TrackPlayer from 'react-native-track-player';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';

interface UseProgressTrackingProps {
  contentType: 'audiobook' | 'liner_note' | 'article';
  contentId: string;
  contentName?: string;
}

export const useProgressTracking = ({
  contentType,
  contentId,
  contentName
}: UseProgressTrackingProps) => {
  const { saveUserProgress, getUserProgress, currentProgress } = useLotusUser();

  // Manual save progress function
  const saveCurrentProgress = useCallback(async () => {
    console.log('🐛 DEBUG saveCurrentProgress called');
    console.log('🐛 DEBUG saveUserProgress exists:', !!saveUserProgress);
    console.log('🐛 DEBUG contentId:', contentId);
    
    if (!saveUserProgress || !contentId) {
      console.log('❌ saveCurrentProgress failed: missing saveUserProgress or contentId');
      return false;
    }

    try {
      console.log('🐛 DEBUG Getting TrackPlayer info...');
      const position = await TrackPlayer.getPosition();
      const duration = await TrackPlayer.getDuration();
      const currentTrack = await TrackPlayer.getCurrentTrack();
      const trackObject = currentTrack ? await TrackPlayer.getTrack(currentTrack) : null;

      console.log('🐛 DEBUG TrackPlayer info:', {
        position,
        duration,
        currentTrack,
        trackObject: trackObject ? { id: trackObject.id, title: trackObject.title, index: trackObject.index } : null
      });

      const progressData = {
        contentType: contentType,
        content_id: contentId,
        content_name: contentName,
        chapter_index: trackObject?.index,
        chapter_id: trackObject?.id,
        chapter_title: trackObject?.title,
        position_seconds: Math.floor(position),
        duration_seconds: Math.floor(duration || 0),
      };

      console.log('🐛 DEBUG About to save progress data:', progressData);

      await saveUserProgress(progressData);

      console.log('📌 Progress bookmarked:', {
        content: contentName,
        position: Math.floor(position),
        chapter: trackObject?.title
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error saving progress:', error);
      console.error('❌ Error details:', (error as Error).message);
      return false;
    }
  }, [saveUserProgress, contentType, contentId, contentName]);

  // Load saved progress
  const loadSavedProgress = useCallback(async () => {
    if (!getUserProgress || !contentId) return null;

    try {
      console.log('🔍 Loading saved progress for:', { contentType, contentId });
      const savedProgress = await getUserProgress(contentType, contentId);
      
      if (savedProgress) {
        console.log('📍 Found saved progress:', savedProgress);
        return savedProgress;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error loading progress:', error);
      return null;
    }
  }, [getUserProgress, contentType, contentId]);

  // Get current progress from cache
  const getCurrentProgress = useCallback(() => {
    const progressKey = `${contentType}_${contentId}`;
    return currentProgress?.[progressKey] || null;
  }, [currentProgress, contentType, contentId]);

  // Seek to saved position
  const seekToSavedPosition = useCallback(async () => {
    const savedProgress = getCurrentProgress();
    if (savedProgress && savedProgress.position_seconds > 0) {
      console.log('⏭️ Seeking to saved position:', savedProgress.position_seconds);
      await TrackPlayer.seekTo(savedProgress.position_seconds);
      return true;
    }
    return false;
  }, [getCurrentProgress]);

  return {
    saveCurrentProgress,
    loadSavedProgress,
    getCurrentProgress,
    seekToSavedPosition,
    currentProgress: getCurrentProgress(),
  };
}; 