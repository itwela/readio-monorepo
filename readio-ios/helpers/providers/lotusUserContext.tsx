import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { LotusArticle } from '@/types/type';
import { tokenCache } from '@/lib/auth';
import { useLotusUtils } from './lotusUtilsContext';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { setStateAsync } from '@/constants/utilityFunctions';
import TrackPlayer from 'react-native-track-player';
import { useLastActiveTrack } from '@/hooks/useLastActiveTrack';
import { router } from 'expo-router';
import { useLotusEnv } from './LotusEnvHandler';
import { api } from "@/convex/_generated/api";
import { useMutation, useConvex, useQuery } from "convex/react";
import { useLotusAuth } from './LotusAuthContext';
import { Id } from "@/convex/_generated/dataModel";

// 🎯 REACTIVE CONVEX SOLUTION
// Uses useQuery hooks for real-time updates + convex.close() for fresh auth state
// Best of both worlds: reactive data + fresh login state!

// SECTION TYPES AND CONTEXT
interface LotusUserContextType {
  user?: any;
  sessionKey?: number; // 🔥 Nuclear session key for forcing remounts
  isSignedIn?: boolean;
  setIsSignedIn?: (value: boolean) => void;
  hasAccount?: boolean;
  setHasAccount?: (value: boolean) => void;
  subscription_plan?: string;
  coin_balance?: number;
  needsToRefresh?: boolean,
  setNeedsToRefresh?: (value: boolean) => void;

  article_generation_runs?: number;
  article_generation_runs_limit?: number;
  article_runs_last_reset_at?: Date | null;

  // 🔥 MANUAL DATA - No more caching issues!
  userArticles?: any[];
  userPlaylists?: any[];
  userFavoriteArticles?: any[];
  continueReadingPlaylist?: any; // 🎯 NEW: Auto-managed bookmarked playlist
  safeArticles?: any[];
  communityPlaylistArticles?: any[];
  linerNoteArticles?: any[];
  dataLoading?: boolean;
  
  // Manual refresh function
  fetchAllUserData?: () => Promise<void>;
  clearAllData?: () => void;

  // 🎯 NEW: Progress Tracking
  saveUserProgress?: (args: {
    contentType: string;
    content_id: string;
    content_name?: string;
    chapter_index?: number;
    chapter_id?: string;
    chapter_title?: string;
    position_seconds: number;
    duration_seconds?: number;
  }) => Promise<any>;
  
  getUserProgress?: (contentType: string, content_id: string) => Promise<any>;
  getAllUserProgress?: () => Promise<any[]>;
  clearUserProgress?: (contentType: string, content_id: string) => Promise<any>;
  
  // Quick access to current progress states
  currentProgress?: { [key: string]: any }; // Map of content_id -> progress
  setCurrentProgress?: (value: { [key: string]: any }) => void;

  // Mutations
  toggleArticleFavoriteMutation?: any;
  createPlaylistMutation?: any;
  updatePlaylistMutation?: any;
  deletePlaylistMutation?: any;
  addToPlaylistMutation?: any;
  removeFromPlaylistMutation?: any;

  // Legacy support
  setUserArticles?: (value: any) => void;
  mostRecentUserArticles?: any;
  setMostRecentUserArticles?: (value: any) => void;
  homepageArticle?: any;
  setHomepageArticle?: (value: any) => void;
  playlistCategories?: any;
  newlyGeneratedArticle?: any;
  setNewlyGeneratedArticle?: (value: any) => void;
  setPlaylistCategories?: (value: any) => void;
  userArticleCount: number;
  setUserArticleCount?: (value: number) => void;
  setUserFavoriteArticles?: (value: any) => void;
  userUpvoteCount?: number;
  setUserUpvoteCount?: (value: number) => void;
  userStepCount?: number;
  setUserStepCount?: (value: number) => void;
  totalSteps?: number;
  setTotalSteps?: (value: number) => void;
  checkSignInStatus: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  startPlayingLinerNote?: boolean;
  setStartPlayingLinerNote?: (value: boolean) => void;
  userMinutesMeditated?: number;
  setUserMinutesMeditated?: (value: number) => void;

  userIsSubscribed?: boolean;
  setUserIsSubscribed?: (value: boolean) => void;

  userIsOnStarterPlan?: boolean;
  setUserIsOnStarterPlan?: (value: boolean) => void;

  userIsOnPremiumPlan?: boolean;
  setUserIsOnPremiumPlan?: (value: boolean) => void;

  userIsAdmin?: boolean;
  setUserIsAdmin?: (value: boolean) => void;

  userIsNotSubscribed?: boolean;
  setUserIsNotSubscribed?: (value: boolean) => void;
  setOptimisticSubscriptionPlan?: (plan: 'starter' | 'premium' | 'blank') => void;

  isSubscriptionProcessing?: boolean;
  setIsSubscriptionProcessing?: (value: boolean) => void;

  handleDeleteArticle?: (id: Id<"articles">) => Promise<void>;
  handleFavoriteArticle?: (id: Id<"articles">, favorited: boolean) => Promise<void>;

  setUserProgress?: (args: { user_db_id: string; contentType: string; content_id: string; content_name?: string; chapter_index?: number; chapter_id?: string; chapter_title?: string; position_seconds: number; duration_seconds?: number; }) => Promise<any>;

  // 🎯 BANDWIDTH CONTROL
  loadHeavyData?: boolean;
  loadHeavyDataNow?: () => void;
}

interface LotusSubscriptionAndDataInitType extends LotusUserContextType { }

interface SubscriptionResult {
  success: boolean;
  plan?: 'starter' | 'premium';
  coins?: number;
  error?: string;
}

const LotusUserContext = createContext<LotusSubscriptionAndDataInitType | null>(null);

export const LotusUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  // Define article limits
  const ARTICLE_LIMIT_BLANK = 0;
  const ARTICLE_LIMIT_STARTER = 50;
  const ARTICLE_LIMIT_PREMIUM = 100;
  const ARTICLE_LIMIT_ADMIN = 1000000;

  const { masterDebugMode } = useLotusUtils()
  const { token, userId, user } = useLotusAuth();
  const convex = useConvex();

  // 🎯 CONDITIONAL LOADING - Load heavy data only when needed
  const [loadHeavyData, setLoadHeavyData] = useState(false);

  // 🎯 BANDWIDTH OPTIMIZED: Use light queries for list views
  const userArticlesResult = useQuery(
    api.articles.getArticlesByUserLight, 
    user?.user_db_id ? { user_db_id: user.user_db_id, limit: 100 } : "skip"
  );
  
  // Extract articles from paginated response
  const userArticles = userArticlesResult?.articles || [];
  
  const userFavoriteArticles = useQuery(
    api.articles.getComprehensiveFavorites, 
    user?.user_db_id && loadHeavyData ? { user_db_id: user.user_db_id } : "skip"
  );
  
  const userPlaylists = useQuery(
    api.playlists.getPlaylistsByUser, 
    user?.user_db_id ? { user_db_id: user.user_db_id } : "skip"
  );
  
  // 🎯 NEW: Continue Reading playlist with progress info
  const continueReadingPlaylist = useQuery(
    api.playlists.getContinueReadingWithProgress,
    user?.user_db_id && loadHeavyData ? { user_db_id: user.user_db_id } : "skip"
  );
  
  const safeArticles = useQuery(
    api.articles.getSafeArticlesLight, 
    loadHeavyData ? { limit: 100 } : "skip"
  );
  const communityPlaylistArticles = useQuery(
    api.articles.getCommunityPlaylistArticlesLight, 
    { limit: 100 } // Load immediately since this is needed for playlists page
  );
  
  // 🎯 HYBRID APPROACH: Get season metadata + episodes from articles (2MB with full metadata)
  const linerNoteArticles = useQuery(
    api.articles.getLinerNotesWithSeasonMetadata, 
    loadHeavyData ? { limit: 5 } : "skip"
  );
  
  // 🎯 Progress data - load only when needed
  const allUserProgress = useQuery(
    api.userProgress.getAllUserProgress,
    user?.user_db_id && loadHeavyData ? { user_db_id: user.user_db_id } : "skip"
  );

  // 🔥 Session key for forcing component remounts when needed
  const [sessionKey, setSessionKey] = useState(Date.now());
  
  // 🎯 Progress tracking state (derived from query)
  const [currentProgress, setCurrentProgress] = useState<{ [key: string]: any }>({});

  // Auto-load heavy data after 2 seconds (lazy loading)
  useEffect(() => {
    if (user?.user_db_id && !loadHeavyData) {
      const timer = setTimeout(() => {
        console.log('🎯 Loading heavy data after initial load...');
        setLoadHeavyData(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user?.user_db_id, loadHeavyData]);

  // NOTE - Update progress state when query data changes
  useEffect(() => {
    if (allUserProgress) {
      const progressMap: { [key: string]: any } = {};
      allUserProgress.forEach(progress => {
        const progressKey = `${progress.contentType}_${progress.content_id}`;
        progressMap[progressKey] = progress;
      });
      setCurrentProgress(progressMap);
    } else {
      setCurrentProgress({});
    }
  }, [allUserProgress]);

  // 🎯 Derived values from reactive data
  const dataLoading = userArticles === undefined || safeArticles === undefined || communityPlaylistArticles === undefined;
  const userArticleCount = userArticles?.length || 0;
  const mostRecentUserArticles = userArticles?.slice(0, 6) || [];

  // Other mutations
  const toggleArticleFavoriteMutation = useMutation(api.articles.toggleArticleFavorite);
  const createPlaylistMutation = useMutation(api.playlists.createPlaylist);
  const updatePlaylistMutation = useMutation(api.playlists.updatePlaylist);
  const deletePlaylistMutation = useMutation(api.playlists.deletePlaylist);
  const addToPlaylistMutation = useMutation(api.playlists.addToPlaylist);
  const removeFromPlaylistMutation = useMutation(api.playlists.removeFromPlaylist);
  const deleteArticleMutation = useMutation(api.articles.deleteArticle);

  // 🎯 NEW: Progress tracking mutations
  const saveUserProgressMutation = useMutation(api.userProgress.saveUserProgress);
  const deleteUserProgressMutation = useMutation(api.userProgress.deleteUserProgress);

  // States
  const hasAccount = false;
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [needsToRefresh, setNeedsToRefresh] = useState<boolean>(false);
  const [userUpvoteCount, setUserUpvoteCount] = useState(0);
  const [userStepCount, setUserStepCount] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [userMinutesMeditated, setUserMinutesMeditated] = useState(0);
  const [startPlayingLinerNote, setStartPlayingLinerNote] = useState<boolean>(false);
  const [playlistCategories, setPlaylistCategories] = useState<any[]>([]);
  const [userIsSubscribed, setUserIsSubscribed] = useState<boolean>(false);
  const [userIsOnStarterPlan, setUserIsOnStarterPlan] = useState<boolean>(false);
  const [userIsOnPremiumPlan, setUserIsOnPremiumPlan] = useState<boolean>(false);
  const [userIsAdmin, setUserIsAdmin] = useState<boolean>(false);
  const [article_generation_runs, setArticleGenerationRuns] = useState(0);
  const [article_generation_runs_limit, setArticleGenerationRunsLimit] = useState(0);
  const [article_runs_last_reset_at, setArticleRunsLastResetAt] = useState<any>();
  const [userIsNotSubscribed, setUserIsNotSubscribed] = useState<boolean>(false);
  const [isSubscriptionProcessing, setIsSubscriptionProcessing] = useState<boolean>(false);

  // Legacy states for compatibility
  const [homepageArticle, setHomepageArticle] = useState<any>(null);
  const [newlyGeneratedArticle, setNewlyGeneratedArticle] = useState<any>(null);

  const { clearLastActiveTrack, setLastActiveTrack } = useLastActiveTrack();
  const { clients, getEnv } = useLotusEnv();
  const s3 = clients.s3Client;

  // 🔥 DEBOUNCED PROGRESS SAVING - Prevent excessive bandwidth usage
  const [progressSaveTimeout, setProgressSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // 🔥 CLEAR DATA FUNCTION (simplified since useQuery handles most state)
  const clearAllData = () => {
    console.log('🔥 CLEAR: Wiping local state (useQuery data will clear via convex.close())');
    setUserUpvoteCount(0);
    setUserStepCount(0);
    setUserMinutesMeditated(0);
    setStartPlayingLinerNote(false);
    setPlaylistCategories([]);
    setUserIsSubscribed(false);
    setUserIsOnStarterPlan(false);
    setUserIsOnPremiumPlan(false);
    setUserIsAdmin(false);
    setUserIsNotSubscribed(true);
    setArticleGenerationRuns(0);
    setArticleGenerationRunsLimit(ARTICLE_LIMIT_BLANK);
    setArticleRunsLastResetAt(null);
    setHomepageArticle(null);
    setNewlyGeneratedArticle(null);
    // Progress will be cleared when useQuery re-runs
    setCurrentProgress({});
  };

  // 🎯 NUCLEAR PROGRESS FUNCTIONS - No caching issues!
  const saveUserProgress = async (args: {
    contentType: string;
    content_id: string;
    content_name?: string;
    chapter_index?: number;
    chapter_id?: string;
    chapter_title?: string;
    position_seconds: number;
    duration_seconds?: number;
  }) => {
    if (!user?.user_db_id) {
      console.log('❌ No user_db_id available for progress saving');
      return { success: false, error: 'No user logged in' };
    }

    // 🎯 DEBOUNCE: Clear existing timeout
    if (progressSaveTimeout) {
      clearTimeout(progressSaveTimeout);
    }

    // Update local cache immediately for UI responsiveness
    const progressKey = `${args.contentType}_${args.content_id}`;
    setCurrentProgress(prev => ({
      ...prev,
      [progressKey]: {
        ...args,
        user_db_id: user.user_db_id,
        last_updated: new Date().toISOString()
      }
    }));

    // 🎯 DEBOUNCE: Save to database after 2 seconds of inactivity
    const newTimeout = setTimeout(async () => {
      try {
        console.log('💾 Debounced progress save:', args);
        
        await saveUserProgressMutation({
          user_db_id: user.user_db_id,
          ...args
        });

        console.log('✅ Progress saved successfully (debounced)');
      } catch (error) {
        console.error('❌ Error saving debounced progress:', error);
      }
    }, 2000); // Save after 2 seconds of no new progress updates

    setProgressSaveTimeout(newTimeout);
    return { success: true, debounced: true };
  };

  const getUserProgress = async (contentType: string, content_id: string) => {
    if (!user?.user_db_id) {
      console.log('❌ No user_db_id available for progress retrieval');
      return null;
    }

    try {
      
      const progress = await convex.query(api.userProgress.getUserProgressForContent, {
        user_db_id: user.user_db_id,
        contentType,
        content_id
      });

      // Update local cache
      if (progress) {
        const progressKey = `${contentType}_${content_id}`;
        setCurrentProgress(prev => ({
          ...prev,
          [progressKey]: progress
        }));
      }

      return progress;
    } catch (error) {
      console.log('❌ Error getting progress:', error);
      return null;
    }

  };

  const getAllUserProgress = async () => {
    if (!user?.user_db_id) {
      console.log('❌ No user_db_id available for progress retrieval');
      return [];
    }

    try {
      console.log('📚 Getting all user progress');
      
      
      const allProgress = await convex.query(api.userProgress.getAllUserProgress, {
        user_db_id: user.user_db_id
      });

      // Update local cache with all progress
      const progressMap: { [key: string]: any } = {};
      allProgress?.forEach(progress => {
        const progressKey = `${progress.contentType}_${progress.content_id}`;
        progressMap[progressKey] = progress;
      });
      setCurrentProgress(progressMap);

      console.log('📖 All progress retrieved:', allProgress?.length || 0, 'items');
      return allProgress || [];
    } catch (error) {
      console.error('❌ Error getting all progress:', error);
      return [];
    }
  };

  const clearUserProgress = async (contentType: string, content_id: string) => {
    if (!user?.user_db_id) {
      console.log('❌ No user_db_id available for progress clearing');
      return { success: false, error: 'No user logged in' };
    }

    try {
      console.log('🗑️ Clearing progress for:', { contentType, content_id });
      
      const result = await deleteUserProgressMutation({
        user_db_id: user.user_db_id,
        contentType,
        content_id
      });

      // Update local cache
      const progressKey = `${contentType}_${content_id}`;
      setCurrentProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[progressKey];
        return newProgress;
      });

      console.log('🗑️ Progress cleared successfully');
      return { success: true, result };
    } catch (error) {
      console.error('❌ Error clearing progress:', error);
      return { success: false, error: (error as Error).message || 'Unknown error' };
    }
  };

  // 🎯 USER STATE UPDATE FUNCTION
  const updateUserStates = (user: any) => {
    if (!user) return;

    const isAdmin = user.user_role === 'admin';
    const currentPlan = user.subscription_plan;

    setUserIsAdmin(isAdmin);
    setUserIsOnStarterPlan(currentPlan === 'starter' || isAdmin);
    setUserIsOnPremiumPlan(currentPlan === 'premium' || isAdmin);
    setUserIsSubscribed(currentPlan === 'starter' || currentPlan === 'premium' || isAdmin);
    setUserIsNotSubscribed(currentPlan === 'blank' && !isAdmin);

    // Update article generation stats
    setArticleGenerationRuns(user.article_generation_runs ?? 0);
    let limit = ARTICLE_LIMIT_BLANK;
    if (isAdmin) {
      limit = ARTICLE_LIMIT_ADMIN;
    } else if (currentPlan === 'premium') {
      limit = ARTICLE_LIMIT_PREMIUM;
    } else if (currentPlan === 'starter') {
      limit = ARTICLE_LIMIT_STARTER;
    }
    setArticleGenerationRunsLimit(limit);
    setArticleRunsLastResetAt(user.article_runs_last_reset_at ? new Date(user.article_runs_last_reset_at) : null);

    // Update other user-specific counts/data
    setUserUpvoteCount(user.upvotes ?? 0);
    setUserStepCount(user.usersteps ?? 0); 
    setUserMinutesMeditated(user.user_meditation_minutes ?? 0);
  };

  // 🎯 REACTIVE AUTHENTICATION EFFECT - The magic happens here!
  useEffect(() => {
    console.log('🎯 [REACTIVE AUTH] User change detected:', user?.user_db_id);
    
    if (user?.user_db_id) {
      console.log('✅ [REACTIVE AUTH] USER LOGIN - useQuery will auto-fetch fresh data');
      
      // Force new session key to remount components if needed
      setSessionKey(Date.now());
      
      // Update user states immediately
      updateUserStates(user);
      
      // Note: No manual fetching needed! useQuery hooks handle everything reactively
      
    } else {
      console.log('🔄 [REACTIVE AUTH] USER LOGOUT - Using sessionKey approach for fresh state');
      
      // 🎯 SESSION KEY APPROACH: Force complete component remount
      // Combined with "skip" pattern in useQuery, this ensures fresh data
      setSessionKey(Date.now());
      
      // Clear local state
      clearAllData();
      
      console.log('🔄 Auth state cleaned via sessionKey, ready for fresh login');
    }
  }, [user?.user_db_id]); // Only depend on user_db_id

  // 🔥 SIMPLIFIED FETCH FUNCTION - Now just forces useQuery refresh
  const fetchAllUserData = async () => {
    console.log('🎯 REACTIVE REFRESH: useQuery hooks will auto-refresh');
    // Note: No manual fetching needed! useQuery hooks are reactive
    // This function is kept for compatibility but does nothing
  };

  // 🎯 BANDWIDTH CONTROL: Manual heavy data loading
  const loadHeavyDataNow = () => {
    console.log('🎯 Manually loading heavy data...');
    setLoadHeavyData(true);
  };

  // Legacy functions for compatibility
  const setOptimisticSubscriptionPlan = (plan: 'starter' | 'premium' | 'blank') => {
    if (user) {
      const isAdmin = user?.user_role === 'admin';
      setUserIsSubscribed(plan === 'starter' || plan === 'premium' || isAdmin);
      setUserIsOnStarterPlan(plan === 'starter' || isAdmin);
      setUserIsOnPremiumPlan(plan === 'premium' || isAdmin);
      setUserIsNotSubscribed(plan === 'blank' && !isAdmin);
    }
  };

  const handleFavoriteArticle = async (id: Id<"articles">, newFavorited: boolean) => {
    try {
      await toggleArticleFavoriteMutation({
        articleId: id,
        favorited: newFavorited,
      });
      // Note: useQuery will automatically refresh the data!
      console.log('✅ Favorite toggled - useQuery will auto-refresh data');
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  }


  const checkSignInStatus = async () => {
    console.log("checkSignInStatus called - handled by reactive auth");
  };

  const refreshUserData = async () => {
    console.log("🎯 REACTIVE REFRESH: useQuery hooks will auto-refresh");
    // Note: No manual refresh needed! useQuery hooks are reactive
  };

  const handleDeleteArticle = async (id: Id<"articles">) => {
    const s3Key = `${id}.mp3`;  
    s3?.deleteObject({
      Bucket: "readio-audio-files",
      Key: s3Key,
    }, (err, data) => {
      if (err) {
        console.error("Error deleting audio from S3:", err);
      }
    });

    s3?.deleteObject({
      Bucket: "lotus-image-files",
      Key: s3Key,
    }, (err, data) => {
      if (err) {
        console.error("Error deleting image from S3:", err);
      }
    });

    try {
      await deleteArticleMutation({
        articleId: id,
        user_db_id: user?.user_db_id || "",
      });
      // Note: useQuery will automatically refresh the data!
      console.log('✅ Article deleted - useQuery will auto-refresh data');
    } catch (error) {
      console.error('Error deleting article via Convex:', error);
    }
    
    TrackPlayer.reset();
    clearLastActiveTrack?.();
    router.back();
  }

  return (
    <LotusUserContext.Provider value={{
      // 🎯 Reactive state
      user,
      sessionKey,
      dataLoading,
      fetchAllUserData,
      clearAllData,

      // Reactive data (from useQuery hooks)
      userArticles: userArticles || [],
      userFavoriteArticles: userFavoriteArticles || [],
      userPlaylists: userPlaylists || [],
      safeArticles: safeArticles?.articles || [],
      communityPlaylistArticles: communityPlaylistArticles || [],
      linerNoteArticles: linerNoteArticles || [],
      continueReadingPlaylist: continueReadingPlaylist || [],

      // Legacy compatibility functions (kept as no-ops for compatibility)
      setUserArticles: () => console.log('setUserArticles: useQuery handles this reactively'),
      setUserFavoriteArticles: () => console.log('setUserFavoriteArticles: useQuery handles this reactively'),

      // Legacy compatibility
      hasAccount,
      needsToRefresh,
      setNeedsToRefresh,
      mostRecentUserArticles,
      setMostRecentUserArticles: () => console.log('setMostRecentUserArticles: derived reactively'),
      homepageArticle,
      setHomepageArticle,
      newlyGeneratedArticle,
      setNewlyGeneratedArticle,
      playlistCategories,
      setPlaylistCategories,
      userArticleCount,
      setUserArticleCount: () => console.log('setUserArticleCount: derived reactively'),
      userUpvoteCount,
      setUserUpvoteCount,
      userStepCount,
      setUserStepCount,
      totalSteps,
      setTotalSteps,
      isSignedIn,
      setIsSignedIn,
      checkSignInStatus,
      refreshUserData,
      startPlayingLinerNote,
      setStartPlayingLinerNote,
      userMinutesMeditated,
      setUserMinutesMeditated,
      article_generation_runs,
      article_generation_runs_limit,
      article_runs_last_reset_at,

      // Mutations
      toggleArticleFavoriteMutation,
      createPlaylistMutation,
      updatePlaylistMutation, 
      deletePlaylistMutation,
      addToPlaylistMutation,
      removeFromPlaylistMutation,

      // User states
      userIsSubscribed,
      setUserIsSubscribed,
      userIsOnPremiumPlan,
      setUserIsOnPremiumPlan,
      userIsOnStarterPlan,
      setUserIsOnStarterPlan,
      userIsAdmin,
      setUserIsAdmin,
      userIsNotSubscribed,
      setUserIsNotSubscribed,
      setOptimisticSubscriptionPlan,
      isSubscriptionProcessing,
      setIsSubscriptionProcessing,

      // Functions
      handleDeleteArticle,
      handleFavoriteArticle,

      // 🎯 Progress tracking
      saveUserProgress,
      getUserProgress,
      getAllUserProgress,
      clearUserProgress,
      currentProgress,
      setCurrentProgress,

      setUserProgress: async (args: { user_db_id: string; contentType: string; content_id: string; content_name?: string; chapter_index?: number; chapter_id?: string; chapter_title?: string; position_seconds: number; duration_seconds?: number; }) => {
        // Implementation of setUserProgress
      },

      // 🎯 BANDWIDTH CONTROL
      loadHeavyData,
      loadHeavyDataNow,

    }}>
      {children}
    </LotusUserContext.Provider>
  );
};

export const useLotusUser = (match?: string) => {
  const context = useContext(LotusUserContext);
  if (!context) throw new Error('useLotusUser must be used within a LotusUserProvider');
  return context;
};
