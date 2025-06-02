import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useLotusUser } from './lotusUserContext';
import { useProgressQueue } from '@/handleArticleGenerations/processingQueue';
import { useLotusHaptic } from './lotusHapticProvider';
import { setStateAsync } from '@/constants/utilityFunctions';
import { RootNavigationProp } from '@/types/type';
import { useLotusModal } from './lotusModalContext';
import { ImageAssets } from '@/constants/imageAssets';
import { useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { router } from 'expo-router';
import { useLotusEnv } from './LotusEnvHandler';
import * as Notifications from 'expo-notifications';

// ==================== TYPE DEFINITIONS ====================
type ArticleGenerationStatus = 'idle' | 'generating' | 'submitted' | 'error' | 'resetting' | 'done' | 'limitReached';

interface VoiceOption {
  value: string;
  label: string;
  provider: string;
  image?: any;
}

interface VoiceOptionsData {
  allPurposeOptions: VoiceOption[];
  diyOptions: VoiceOption[];
  diyOptionsAdmin: VoiceOption[];
}

interface LotusCreateArticleContextType {
  // =============== CORE STATE ===============
  articleQuery: string;
  isDIYMode: boolean;
  articleGenerationStatus: ArticleGenerationStatus;
  placeholderMessage: string;
  modalMessage: string;
  isVoiceSelectionModalOpen: boolean;
  isLimitReached: boolean;

  setIsVoiceSelectionModalOpen: (open: boolean) => void;
  
  // =============== VOICE SELECTION STATE ===============
  selectedVoiceId: string | null;
  selectedVoiceName: string;
  selectedVoiceProvider: string;
  selectedVoiceImage: any;
  tempSelectedVoiceInModal: VoiceOption | null;

  setSelectedVoiceName: (name: string) => void;
  setSelectedVoiceId: (id: string) => void;
  setSelectedVoiceProvider: (provider: string) => void;

  // =============== DERIVED VALUES ===============
  currentAvailableVoiceOptions: VoiceOption[];
  isSubmissionReady: boolean;
  user: any | null;
  userIsAdmin: boolean;
  articleGenerationRuns: number;
  articleGenerationRunsLimit: number | string;


  // =============== CORE ACTIONS ===============
  setArticleQuery: (query: string) => void;
  toggleDIYMode: () => void;
  startArticleSubmission: () => Promise<void>;
  resetArticleCreationProcess: () => void;
  setArticleGenerationStatus: (status: ArticleGenerationStatus) => void;
  openVoiceSelectionModal: () => void;
  // =============== VOICE SELECTION ACTIONS ===============
}

// ==================== CONTEXT CREATION ====================
const LotusCreateArticleContext = createContext<LotusCreateArticleContextType | null>(null);

// ==================== PROVIDER IMPLEMENTATION ====================
export const LotusCreateArticleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // =============== SERVICE HOOKS ===============
  const navigation = useNavigation<RootNavigationProp>();
  const { user, userIsAdmin, setNeedsToRefresh, setNewlyGeneratedArticle } = useLotusUser();
  const { ProgressQueue, setGenerationStarted, setProgressMessage } = useProgressQueue();
  const { successFeedback, mediumFeedback, lightFeedback } = useLotusHaptic();
  const { setForm, setWantsToMakeAnArticle, setWantsToMakeA_D_I_Y_Article, setIsArticleGenerating } = useLotusModal();
  const { clients, envVariables } = useLotusEnv();

  // =============== CONVEX HOOKS ===============
  const generateArticleReplicate = useAction(api.articleGeneration.generateArticleReplicate);
  const generateArticleElevenLabs = useAction(api.articleGeneration.generateArticleElevenLabs);
  const generateArticleReplicateCustom = useAction(api.articleGeneration.generateArticleReplicateCustom);
  const generateArticleElevenLabsCustom = useAction(api.articleGeneration.generateArticleElevenLabsCustom);

  // =============== COMPONENT STATE ===============
  const [articleQuery, setArticleQueryState] = useState<string>('');
  const [isDIYMode, setIsDIYModeState] = useState(false);
  const [articleGenerationStatus, setArticleGenerationStatusState] = useState<ArticleGenerationStatus>('idle');
  const [placeholderMessage, setPlaceholderMessageState] = useState('Turn your thoughts into narrated articles');
  const [modalMessage, setModalMessageState] = useState('Speak Life Into Your Ideas');
  const [isVoiceSelectionModalOpen, setIsVoiceSelectionModalOpen] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [selectedVoiceName, setSelectedVoiceName] = useState('---');
  const [selectedVoiceProvider, setSelectedVoiceProvider] = useState('');
  const [selectedVoiceImage, setSelectedVoiceImageState] = useState<any>(null);
  const [tempSelectedVoiceInModal, setTempSelectedVoiceInModalState] = useState<VoiceOption | null>(null);

  // =============== CONSTANTS ===============
  const ARTICLE_LIMIT_ADMIN_DISPLAY = 1000000;
  const DEFAULT_VOICE_OPTIONS: VoiceOptionsData = {
    allPurposeOptions: [
      // Back to original voice IDs that work with Replicate SDK
      { value: 'af_kore', label: 'Grace', provider: 'replicate', image: ImageAssets.graceAvatar },
      { value: 'hf_beta', label: 'Padma', provider: 'replicate', image: ImageAssets.padmaAvatar },
      { value: 'am_michael', label: 'Pythagorus', provider: 'replicate', image: ImageAssets.pythagorusAvatar },
      { value: 'XFYDnaQFQ0Mygtem97ek', label: 'Stic', provider: 'elevenlabs', image: ImageAssets.babaAvatar },
    ],
    diyOptions: [
      { value: 'af_kore', label: 'Grace', provider: 'replicate', image: ImageAssets.graceAvatar },
      { value: 'hf_beta', label: 'Padma', provider: 'replicate', image: ImageAssets.padmaAvatar },
      { value: 'am_michael', label: 'Pythagorus', provider: 'replicate', image: ImageAssets.pythagorusAvatar },
    ],
    diyOptionsAdmin: [
      { value: 'af_kore', label: 'Grace', provider: 'replicate', image: ImageAssets.graceAvatar },
      { value: 'hf_beta', label: 'Padma', provider: 'replicate', image: ImageAssets.padmaAvatar },
      { value: 'am_michael', label: 'Pythagorus', provider: 'replicate', image: ImageAssets.pythagorusAvatar },
      { value: 'XFYDnaQFQ0Mygtem97ek', label: 'Stic', provider: 'elevenlabs', image: ImageAssets.babaAvatar },
    ]
  };

  // =============== DERIVED VALUES ===============
  const currentAvailableVoiceOptions = useMemo(() => {
    return isDIYMode 
      ? userIsAdmin ? DEFAULT_VOICE_OPTIONS.diyOptionsAdmin : DEFAULT_VOICE_OPTIONS.diyOptions
      : DEFAULT_VOICE_OPTIONS.allPurposeOptions;
  }, [isDIYMode, userIsAdmin, DEFAULT_VOICE_OPTIONS]);

  const isSubmissionReady = useMemo(() => 
    articleQuery.length > 0 && selectedVoiceId !== null, 
    [articleQuery, selectedVoiceId]
  );

  const articleGenerationRuns = user?.article_generation_runs || 0;
  const articleGenerationRunsLimit = userIsAdmin 
    ? 'Unlimited'
    : user?.article_generation_runs_limit === ARTICLE_LIMIT_ADMIN_DISPLAY
      ? 'Unlimited'
      : user?.article_generation_runs_limit || 0;

  // =============== NEW: Check if user has reached their limit ===============
  const isLimitReached = useMemo(() => {
    if (userIsAdmin) return false; // Admins never hit limits
    if (typeof articleGenerationRunsLimit === 'string') return false; // 'Unlimited' case
    return articleGenerationRuns >= articleGenerationRunsLimit;
  }, [articleGenerationRuns, articleGenerationRunsLimit, userIsAdmin]);

  // =============== INITIALIZATION EFFECT ===============
  useEffect(() => {
    // Initialize voice selection when voice options change or on mount
    if (currentAvailableVoiceOptions.length > 0 && !selectedVoiceId) {
      const defaultVoice = currentAvailableVoiceOptions[0];
      console.log('Initializing default voice:', defaultVoice);
      setSelectedVoiceId(defaultVoice.value);
      setSelectedVoiceName(defaultVoice.label);
      setSelectedVoiceProvider(defaultVoice.provider);
      setSelectedVoiceImageState(defaultVoice.image);
      setTempSelectedVoiceInModalState(defaultVoice);
    }
  }, [currentAvailableVoiceOptions, selectedVoiceId]);

  // =============== CORE FUNCTIONS ===============
  const setArticleQuery = useCallback((query: string) => {
    setArticleQueryState(query);
  }, []);

  const toggleDIYMode = useCallback(() => {
    mediumFeedback?.();
    setIsDIYModeState(prev => !prev);
    // setSelectedVoiceIdState(null);
    // setSelectedVoiceNameState('---');
    // setSelectedVoiceProviderState('');
    // setSelectedVoiceImageState(null);
    // setTempSelectedVoiceInModalState(null);
  }, [mediumFeedback]);

  const openVoiceSelectionModal = () => {
    setIsVoiceSelectionModalOpen(true);
  }

  // REVIEW STEP 1.1 - THIS IS THE SUBMISSION BUTTON FUNCTION
  const startArticleSubmission = useCallback(async () => {
    if (!isSubmissionReady || !selectedVoiceId || !selectedVoiceProvider || !user?.user_db_id) return;

    // Check if user has reached their limit before starting
    if (isLimitReached) {
      setArticleGenerationStatusState('limitReached');
      return;
    }

    try {
      lightFeedback?.();
      setArticleGenerationStatusState('generating');
      
      // // Set up form data for compatibility with existing modal context
      await setStateAsync(setForm, () => ({
        query: articleQuery,
        provider: selectedVoiceProvider,
        id: selectedVoiceId
      }), 'backendData');

      // // back to library
      router.navigate('/(tabs)/(library)/lib');

      // // Set generation flags for compatibility
      if (isDIYMode) {
        await setStateAsync(setWantsToMakeA_D_I_Y_Article, true, 'backendData');

      } else {
        await setStateAsync(setWantsToMakeAnArticle, true, 'backendData');

      }

      await setStateAsync(setIsArticleGenerating, true, 'affectsSomethingVisual');

      // // Generate form_id for tracking
      const form_id = `${selectedVoiceProvider}_${Date.now()}_${user.user_db_id}_${user.name || `bug_user_${Date.now()}`}`;

      // FIXME
      // // Call appropriate Convex action based on provider and mode
      let result;
      if (selectedVoiceProvider === 'replicate') {
        if (isDIYMode) {
          // NOTE STEP 2 - ARTICLE FUNCTION IS CALLED USING CONVEX ACTIONS

          console.log('selectedVoiceId', selectedVoiceId)

          result = await generateArticleReplicateCustom({
            user: {
              _id: user._id,
              name: user.name || 'Unknown User',
              user_db_id: user.user_db_id,
              article_generation_runs: user.article_generation_runs || 0,
              article_generation_runs_limit: user.article_generation_runs_limit || 0,
            },
            query: articleQuery,
            form_id: form_id,
            customVoiceId: selectedVoiceId,
            replicateApiKey: envVariables.EXPO_PUBLIC_REPLICATE_API_TOKEN as string,
            elevenLabsApiKey: envVariables.EXPO_PUBLIC_ELEVENLABS_API_KEY as string,
            awsAccessKey: envVariables.EXPO_PUBLIC_AWS_ACCESS_KEY_ID as string,
            awsSecretKey: envVariables.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
          });
        } else {
          // NOTE STEP 2 - ARTICLE FUNCTION IS CALLED USING CONVEX ACTIONS
          result = await generateArticleReplicate({
            user: {
              _id: user._id,
              name: user.name || 'Unknown User',
              user_db_id: user.user_db_id,
              article_generation_runs: user.article_generation_runs || 0,
              article_generation_runs_limit: user.article_generation_runs_limit || 0,
            },
            query: articleQuery,
            form_id: form_id,
            customVoiceId: selectedVoiceId,
            replicateApiKey: envVariables.EXPO_PUBLIC_REPLICATE_API_TOKEN as string,
            elevenLabsApiKey: envVariables.EXPO_PUBLIC_ELEVENLABS_API_KEY as string,
            awsAccessKey: envVariables.EXPO_PUBLIC_AWS_ACCESS_KEY_ID as string,
            awsSecretKey: envVariables.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
          });
        }
      } else if (selectedVoiceProvider === 'elevenlabs') {
        if (isDIYMode) {
          // NOTE STEP 2 - ARTICLE FUNCTION IS CALLED USING CONVEX ACTIONS
          result = await generateArticleElevenLabsCustom({
            user: {
              _id: user._id,
              name: user.name || 'Unknown User',
              user_db_id: user.user_db_id,
              article_generation_runs: user.article_generation_runs || 0,
              article_generation_runs_limit: user.article_generation_runs_limit || 0,
              user_role: user.user_role || 'user',
              stic_voice_usage_seconds: user.stic_voice_usage_seconds || 0,
              article_runs_last_reset_at: user.article_runs_last_reset_at || new Date().toISOString(),
            },
            query: articleQuery,
            form_id: form_id,
            customVoiceId: selectedVoiceId,
            replicateApiKey: envVariables.EXPO_PUBLIC_REPLICATE_API_TOKEN as string,
            elevenLabsApiKey: envVariables.EXPO_PUBLIC_ELEVENLABS_API_KEY as string,
            awsAccessKey: envVariables.EXPO_PUBLIC_AWS_ACCESS_KEY_ID as string,
            awsSecretKey: envVariables.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
          });
        } else {
          // NOTE STEP 2 - ARTICLE FUNCTION IS CALLED USING CONVEX ACTIONS
          result = await generateArticleElevenLabs({
            user: {
              _id: user._id,
              name: user.name || 'Unknown User',
              user_db_id: user.user_db_id,
              article_generation_runs: user.article_generation_runs || 0,
              article_generation_runs_limit: user.article_generation_runs_limit || 0,
              user_role: user.user_role || 'user',
              stic_voice_usage_seconds: user.stic_voice_usage_seconds || 0,
              article_runs_last_reset_at: user.article_runs_last_reset_at || new Date().toISOString(),
            },
            query: articleQuery,
            form_id: form_id,
            replicateApiKey: envVariables.EXPO_PUBLIC_REPLICATE_API_TOKEN as string,
            elevenLabsApiKey: envVariables.EXPO_PUBLIC_ELEVENLABS_API_KEY as string,
            awsAccessKey: envVariables.EXPO_PUBLIC_AWS_ACCESS_KEY_ID as string,
            awsSecretKey: envVariables.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
          });
        }
      }

      // 🎯 SIMPLIFIED: Check if generation was successful and set proper status
      if (result?.success === true) {
        setArticleGenerationStatusState('done');
        console.log('✅ Article generation successful:', result);
        
        // STUB - LETS ARCHIVE THIS FOR NOW IDK IF I WANT TO DO. THIS YET
        // // 🎯 Store the generated article in user context for playback
        // if (result.article && setNewlyGeneratedArticle) {
        //   // Format article data for TrackPlayer compatibility
        //   const trackData = [{
        //     id: result.article.id,
        //     title: result.article.title,
        //     artist: result.article.artist || user.name || 'Unknown User',
        //     url: result.article.url || '', // Will be empty until audio is generated
        //     artwork: result.article.artwork || '', // Will be empty until artwork is generated
        //     duration: result.article.duration || 0,
        //     // Include all article metadata
        //     text: result.article.text,
        //     topic: result.article.topic,
        //     nsfw: result.article.nsfw,
        //     user_db_id: result.article.user_db_id,
        //   }];
          
        //   // Store in user context for header to access
        //   setNewlyGeneratedArticle(trackData);
                  
        //   console.log('📱 Stored generated article for playback:', trackData[0].title);
        // }

        // Send notification
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Article Generated',
            body: 'Your article has been successfully generated!',
          },
          trigger: null,
        });
        
      } else {
        console.log('❌ Article generation failed:', result);
        
        // Check if it's specifically a limit reached error
        if (result?.isLimitReached) {
          setArticleGenerationStatusState('limitReached');
        } else {
          setArticleGenerationStatusState('error');
        }
      }

    } catch (error) {

      console.error("Article generation error:", error);
      setArticleGenerationStatusState('error');

    } finally {
      // Reset generation flags
      await setStateAsync(setWantsToMakeAnArticle, false, 'backendData');
      await setStateAsync(setWantsToMakeA_D_I_Y_Article, false, 'backendData');
    }
  }, [
    isSubmissionReady, 
    selectedVoiceId, 
    selectedVoiceProvider, 
    articleQuery, 
    isDIYMode, 
    user,
    isLimitReached,
    lightFeedback, 
    setForm, 
    setWantsToMakeA_D_I_Y_Article, 
    setWantsToMakeAnArticle,
    setIsArticleGenerating,
    navigation,
    setNeedsToRefresh,
    generateArticleReplicate,
    generateArticleElevenLabs,
    generateArticleReplicateCustom,
    generateArticleElevenLabsCustom,
    setNewlyGeneratedArticle,
    envVariables
  ]);

  const resetArticleCreationProcess = useCallback(async () => {
    try {
      ProgressQueue?.resetQueue();
      setProgressMessage?.('');
      setGenerationStarted?.(false);

      setArticleQueryState('');
      if (currentAvailableVoiceOptions.length > 0) {
        const defaultVoice = currentAvailableVoiceOptions[0];
        setSelectedVoiceId(defaultVoice.value);
        setSelectedVoiceName(defaultVoice.label);
        setSelectedVoiceProvider(defaultVoice.provider);
        setSelectedVoiceImageState(defaultVoice.image);
        setTempSelectedVoiceInModalState(defaultVoice);
      }

      setPlaceholderMessageState('Type your query here...');
      setModalMessageState('Transform your ideas into narrated articles');
      setArticleGenerationStatusState('idle');

      setNeedsToRefresh?.(true);
      setTimeout(() => setNeedsToRefresh?.(false), 200);

    } catch (error) {
      console.error("Reset error:", error);
      setArticleGenerationStatusState('error');
    }
  }, [ProgressQueue, setProgressMessage, setGenerationStarted, currentAvailableVoiceOptions, setNeedsToRefresh]);

  // =============== CONTEXT VALUE ===============
  const contextValue: LotusCreateArticleContextType = {
    articleQuery,
    isDIYMode,
    articleGenerationStatus: articleGenerationStatus,
    placeholderMessage,
    modalMessage,
    isVoiceSelectionModalOpen,
    isLimitReached,
    setIsVoiceSelectionModalOpen,
    selectedVoiceId,
    selectedVoiceName,
    setSelectedVoiceName,
    setSelectedVoiceId,
    setSelectedVoiceProvider,
    selectedVoiceProvider,
    selectedVoiceImage,
    tempSelectedVoiceInModal,
    currentAvailableVoiceOptions,
    isSubmissionReady,
    user,
    userIsAdmin: !!userIsAdmin,
    articleGenerationRuns,
    articleGenerationRunsLimit,
    setArticleQuery,
    toggleDIYMode,
    startArticleSubmission,
    resetArticleCreationProcess,
    setArticleGenerationStatus: setArticleGenerationStatusState,
    openVoiceSelectionModal,
  };

  // =============== PROVIDER RENDER ===============
  return (
    <LotusCreateArticleContext.Provider value={contextValue}>
      {children}
    </LotusCreateArticleContext.Provider>
  );
};

// ==================== CONTEXT HOOK ====================
export const useLotusCreateArticle = () => {
  const context = useContext(LotusCreateArticleContext);
  if (!context) throw new Error('useLotusCreateArticle must be used within a LotusCreateArticleProvider'); 
  return context;
};