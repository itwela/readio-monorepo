import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import sql from '@/helpers/neonClient';
import { useLotusUser } from './lotusUserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { FileSystemDownloadResult } from 'expo-file-system';

// Define clear types for our data structures
export interface Audiobook {
  id: number;
  audiobook_name: string;
  author: string;
  duration: number;
  audio_url: string;
  audiobook_image?: string;
  audiobook_description?: string;
  chapters?: Chapter[];
  // Add any other properties from your database
}

export interface Chapter {
  id: string;
  title: string;
  url: string;
  duration: number;
  artist?: string;
  artwork?: string;
}

interface DownloadProgressData {
  progress: number;
  isComplete: boolean;
  error?: string | boolean;
}

interface DownloadedAudiobook {
  localUri: string;
  downloadDate: string;
  fileSize: number;
  checksum?: string; // For file integrity verification
}

interface LotusAudiobookContextType {
  audiobooks: Audiobook[] | null;
  isLoading: boolean;
  error: string | null;
  refreshAudiobooks: () => Promise<void>;
  downloadedAudiobooks: Record<string, DownloadedAudiobook>;
  downloadAudiobook: (audiobookId: string, audioUrl: string) => Promise<void>;
  cancelDownload: (audiobookId: string) => Promise<void>;
  getLocalAudioUri: (audiobookId: string) => string | null;
  isDownloaded: (audiobookId: string) => boolean;
  isDownloading: (audiobookId: string) => boolean;
  deleteDownload: (audiobookId: string) => Promise<void>;
  downloadProgress: Record<string, DownloadProgressData>;
  downloadResumables: Record<string, FileSystem.DownloadResumable>;
  setDownloadProgress: (newProgress: Record<string, DownloadProgressData> | ((prev: Record<string, DownloadProgressData>) => Record<string, DownloadProgressData>)) => void;
  markAudiobookDownloaded: (audiobookId: string, localUriPlaceholder?: string, fileSize?: number) => Promise<void>;
}

const LotusAudiobookContext = createContext<LotusAudiobookContextType | null>(null);

const STORAGE_KEY = '@lotus_downloaded_audiobooks';

export const LotusAudiobookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useLotusUser();
  const [audiobooks, setAudiobooks] = useState<Audiobook[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadedAudiobooks, setDownloadedAudiobooks] = useState<Record<string, DownloadedAudiobook>>({});
  const [downloadProgress, setDownloadProgress] = useState<Record<string, DownloadProgressData>>({});
  const [downloadResumables, setDownloadResumables] = useState<Record<string, FileSystem.DownloadResumable>>({});

  // Load persisted downloads on mount
  useEffect(() => {
    loadDownloads();
    refreshAudiobooks();
  }, []);

  const loadDownloads = async () => {
    try {
      const savedDownloads = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedDownloads) {
        const parsed = JSON.parse(savedDownloads) as Record<string, DownloadedAudiobook>;
        
        // Verify that downloaded files still exist
        const verified: Record<string, DownloadedAudiobook> = {};
        
        for (const [id, download] of Object.entries(parsed)) {
          const fileInfo = await FileSystem.getInfoAsync(download.localUri);
          if (fileInfo.exists) {
            verified[id] = download;
          }
        }
        
        setDownloadedAudiobooks(verified);
        
        // If some files were missing, update storage
        if (Object.keys(verified).length !== Object.keys(parsed).length) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(verified));
        }
      }
    } catch (e) {
      console.error('Failed to load downloads', e);
      setError('Failed to load your downloaded audiobooks');
    }
  };

  const refreshAudiobooks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await sql`
        SELECT * FROM audiobooks 
        ORDER BY id ASC
      `;
      
      // Type assertion to ensure result matches Audiobook[] type
      setAudiobooks(result as unknown as Audiobook[]);
    } catch (error) {
      console.error('Error fetching audiobooks:', error);
      setError('Failed to load audiobooks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadAudiobook = async (audiobookId: string, audioUrl: string) => {
    try {
      // Check if already downloaded
      if (downloadedAudiobooks[audiobookId]) {
        return;
      }
      
      // Check if already downloading
      if (downloadResumables[audiobookId]) {
        return;
      }
      
      // Set initial progress
      setDownloadProgress(prev => ({
        ...prev,
        [audiobookId]: {
          progress: 0,
          isComplete: false
        }
      }));
      
      const fileUri = `${FileSystem.documentDirectory}audiobooks/${audiobookId}.mp3`;
      
      // Ensure directory exists
      const dirUri = `${FileSystem.documentDirectory}audiobooks`;
      const dirInfo = await FileSystem.getInfoAsync(dirUri);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
      }

      // console.log("Audio URL:", audioUrl);
      // console.log("File URI:", fileUri);
      
      // Create download resumable
      const downloadResumable = FileSystem.createDownloadResumable(
        audioUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(prev => ({
            ...prev,
            [audiobookId]: {
              progress,
              isComplete: false
            }
          }));
        }
      );
      
      // Store the resumable for potential cancellation
      setDownloadResumables(prev => ({
        ...prev,
        [audiobookId]: downloadResumable
      }));
      
      // Start the download
      const downloadResult = await downloadResumable.downloadAsync();
      
      // Guard against undefined result
      if (!downloadResult) {
        throw new Error('Download failed: No result returned');
      }
      
      const { uri } = downloadResult;
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });
      
      if (!fileInfo.exists || !fileInfo.size) {
        throw new Error('Download failed: File does not exist or is empty');
      }
      
      // Record the download
      const newDownload = {
        localUri: uri,
        downloadDate: new Date().toISOString(),
        fileSize: fileInfo.size
      };
      
      const updatedDownloads = {
        ...downloadedAudiobooks,
        [audiobookId]: newDownload
      };
      
      // Update state and storage
      setDownloadedAudiobooks(updatedDownloads);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDownloads));
      
      // Update progress to complete
      setDownloadProgress(prev => ({
        ...prev,
        [audiobookId]: {
          progress: 1,
          isComplete: true
        }
      }));
      
      // Clean up resumable
      setDownloadResumables(prev => {
        const updated = { ...prev };
        delete updated[audiobookId];
        return updated;
      });
      
    } catch (e) {
      console.error('Download failed', e);
      
      // Update progress with error
      setDownloadProgress(prev => ({
        ...prev,
        [audiobookId]: {
          progress: 0,
          isComplete: false,
          error: e instanceof Error ? e.message : 'Download failed'
        }
      }));
      
      // Clean up resumable
      setDownloadResumables(prev => {
        const updated = { ...prev };
        delete updated[audiobookId];
        return updated;
      });
      
      throw e;
    }
  };

  const cancelDownload = async (audiobookId: string) => {
    const resumable = downloadResumables[audiobookId];
    
    if (resumable) {
      try {
        await resumable.cancelAsync();
        
        // Clean up partial file
        const fileUri = `${FileSystem.documentDirectory}audiobooks/${audiobookId}.mp3`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(fileUri);
        }
      } catch (e) {
        console.error('Error canceling download:', e);
      }
      
      // Update states
      setDownloadResumables(prev => {
        const updated = { ...prev };
        delete updated[audiobookId];
        return updated;
      });
      
      setDownloadProgress(prev => {
        const updated = { ...prev };
        delete updated[audiobookId];
        return updated;
      });
    }
  };

  const deleteDownload = async (audiobookId: string) => {
    try {
      // Cancel any ongoing download
      if (downloadResumables[audiobookId]) {
        await cancelDownload(audiobookId);
      }
      
      // Delete the file if it exists
      const download = downloadedAudiobooks[audiobookId];
      if (download) {
        // Check if it's a directory-based audiobook (chapters)
        if (download.localUri.includes('chapters_downloaded')) {
          // Handle chapter directory deletion
          const dirPath = `${FileSystem.documentDirectory}audiobooks/${audiobookId}/`;
          const dirInfo = await FileSystem.getInfoAsync(dirPath);
          if (dirInfo.exists) {
            await FileSystem.deleteAsync(dirPath, { idempotent: true });
          }
        } else {
          // Handle single file deletion
          const fileInfo = await FileSystem.getInfoAsync(download.localUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(download.localUri);
          }
        }
        
        // Update state
        const updatedDownloads = { ...downloadedAudiobooks };
        delete updatedDownloads[audiobookId];
        
        setDownloadedAudiobooks(updatedDownloads);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDownloads));
      }
    } catch (e) {
      console.error('Failed to delete download:', e);
      throw e;
    }
  };

  const getLocalAudioUri = (audiobookId: string) => {
    return downloadedAudiobooks[audiobookId]?.localUri || null;
  };

  const isDownloaded = (audiobookId: string) => {
    return !!downloadedAudiobooks[audiobookId];
  };

  const isDownloading = (audiobookId: string) => {
    return !!downloadProgress[audiobookId] && !downloadProgress[audiobookId].isComplete;
  };

  // Function to manually mark an audiobook as downloaded (e.g., after chapter downloads)
  const markAudiobookDownloaded = async (audiobookId: string, localUriPlaceholder: string = 'chapters_downloaded', fileSize: number = 0) => {
    try {
      const newDownload: DownloadedAudiobook = {
        // Using a placeholder URI as we don't have a single file URI for chapters
        localUri: `${FileSystem.documentDirectory}audiobooks/${audiobookId}/${localUriPlaceholder}`,
        downloadDate: new Date().toISOString(),
        fileSize: fileSize, // You might want to sum chapter sizes if relevant
      };

      const updatedDownloads = {
        ...downloadedAudiobooks,
        [audiobookId]: newDownload,
      };

      setDownloadedAudiobooks(updatedDownloads);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDownloads));

      // Ensure progress state reflects completion
      setDownloadProgress(prev => ({
        ...prev,
        [audiobookId]: { 
          progress: 1, 
          isComplete: true 
        },
      }));

    } catch (e) {
      console.error('Failed to mark audiobook as downloaded:', e);
      // Optionally update progress state with an error
      setDownloadProgress(prev => ({
        ...prev,
        [audiobookId]: { 
          progress: 0, 
          isComplete: false,
          error: e instanceof Error ? e.message : 'Failed to mark as downloaded'
        },
      }));
    }
  };

  return (
    <LotusAudiobookContext.Provider value={{
      audiobooks,
      isLoading,
      error,
      refreshAudiobooks,
      downloadedAudiobooks,
      downloadProgress,
      downloadAudiobook,
      cancelDownload,
      getLocalAudioUri,
      isDownloaded,
      isDownloading,
      setDownloadProgress,
      downloadResumables,
      deleteDownload,
      markAudiobookDownloaded
    }}>
      {children}
    </LotusAudiobookContext.Provider>
  );
};

export const useLotusAudiobook = () => {
  const context = useContext(LotusAudiobookContext);
  if (!context) throw new Error('useLotusAudiobook must be used within a LotusAudiobookProvider');
  return context;
};