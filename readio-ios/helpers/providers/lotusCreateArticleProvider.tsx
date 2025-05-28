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

// ==================== TYPE DEFINITIONS ====================
type ArticleGenerationStatus = 'idle' | 'generating' | 'submitted' | 'error' | 'resetting' | 'done';

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
  
  // =============== VOICE SELECTION STATE ===============
  selectedVoiceId: string | null;
  selectedVoiceName: string;
  selectedVoiceProvider: string;
  selectedVoiceImage: any;
  tempSelectedVoiceInModal: VoiceOption | null;

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
  
  // =============== VOICE SELECTION ACTIONS ===============
  openVoiceSelectionModal: () => void;
  closeVoiceSelectionModalAndConfirm: () => void;
  closeVoiceSelectionModalAndCancel: () => void;
  setTempSelectedVoiceInModal: (voice: VoiceOption | null) => void;
}

// ==================== CONTEXT CREATION ====================
const LotusCreateArticleContext = createContext<LotusCreateArticleContextType | null>(null);

// ==================== PROVIDER IMPLEMENTATION ====================
export const LotusCreateArticleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // =============== SERVICE HOOKS ===============
  const navigation = useNavigation<RootNavigationProp>();
  const { user, userIsAdmin, setNeedsToRefresh } = useLotusUser();
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
  const [isVoiceSelectionModalOpen, setIsVoiceSelectionModalOpenState] = useState(false);
  const [selectedVoiceId, setSelectedVoiceIdState] = useState<string | null>(null);
  const [selectedVoiceName, setSelectedVoiceNameState] = useState('---');
  const [selectedVoiceProvider, setSelectedVoiceProviderState] = useState('');
  const [selectedVoiceImage, setSelectedVoiceImageState] = useState<any>(null);
  const [tempSelectedVoiceInModal, setTempSelectedVoiceInModalState] = useState<VoiceOption | null>(null);

  // =============== CONSTANTS ===============
  const ARTICLE_LIMIT_ADMIN_DISPLAY = 1000000;
  const DEFAULT_VOICE_OPTIONS: VoiceOptionsData = {
    allPurposeOptions: [
      { value: 'bella', label: 'Bella', provider: 'elevenlabs', image: ImageAssets.unknownArticle },
      { value: 'adam', label: 'Adam', provider: 'elevenlabs', image: ImageAssets.unknownArticle }
    ],
    diyOptions: [
      { value: 'bella', label: 'Bella', provider: 'elevenlabs', image: ImageAssets.unknownArticle },
      { value: 'adam', label: 'Adam', provider: 'elevenlabs', image: ImageAssets.unknownArticle }
    ],
    diyOptionsAdmin: [
      { value: 'bella', label: 'Bella', provider: 'elevenlabs', image: ImageAssets.unknownArticle },
      { value: 'adam', label: 'Adam', provider: 'elevenlabs', image: ImageAssets.unknownArticle },
      { value: 'stic', label: 'Stic', provider: 'elevenlabs', image: ImageAssets.unknownArticle }
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

  // =============== CORE FUNCTIONS ===============
  const setArticleQuery = useCallback((query: string) => {
    setArticleQueryState(query);
  }, []);

  const toggleDIYMode = useCallback(() => {
    mediumFeedback?.();
    setIsDIYModeState(prev => !prev);
    setSelectedVoiceIdState(null);
    setSelectedVoiceNameState('---');
    setSelectedVoiceProviderState('');
    setSelectedVoiceImageState(null);
    setTempSelectedVoiceInModalState(null);
  }, [mediumFeedback]);

  const openVoiceSelectionModal = useCallback(() => {
    lightFeedback?.();
    if (selectedVoiceId) {
      const allOptions = [
        ...DEFAULT_VOICE_OPTIONS.allPurposeOptions,
        ...DEFAULT_VOICE_OPTIONS.diyOptions,
        ...DEFAULT_VOICE_OPTIONS.diyOptionsAdmin
      ];
      const currentSelected = allOptions.find(v => v.value === selectedVoiceId);
      setTempSelectedVoiceInModalState(currentSelected || currentAvailableVoiceOptions[0]);
    } else {
      setTempSelectedVoiceInModalState(currentAvailableVoiceOptions[0]);
    }
    setIsVoiceSelectionModalOpenState(true);
  }, [selectedVoiceId, currentAvailableVoiceOptions, lightFeedback]);

  const closeVoiceSelectionModalAndConfirm = useCallback(() => {
    if (tempSelectedVoiceInModal) {
      setSelectedVoiceIdState(tempSelectedVoiceInModal.value);
      setSelectedVoiceNameState(tempSelectedVoiceInModal.label);
      setSelectedVoiceProviderState(tempSelectedVoiceInModal.provider);
      setSelectedVoiceImageState(tempSelectedVoiceInModal.image);
    }
    setIsVoiceSelectionModalOpenState(false);
  }, [tempSelectedVoiceInModal]);

  const closeVoiceSelectionModalAndCancel = useCallback(() => {
    setIsVoiceSelectionModalOpenState(false);
  }, []);

  // REVIEW STEP 1.1 - THIS IS THE SUBMISSION BUTTON FUNCTION
  const startArticleSubmission = useCallback(async () => {
    if (!isSubmissionReady || !selectedVoiceId || !selectedVoiceProvider || !user?.user_db_id) return;

    try {
      lightFeedback?.();
      setArticleGenerationStatusState('generating');
      
      // Set up form data for compatibility with existing modal context
      await setStateAsync(setForm, () => ({
        query: articleQuery,
        provider: selectedVoiceProvider,
        id: selectedVoiceId
      }), 'backendData');

      // back to library
      router.navigate('/(tabs)/(library)/lib');

      // Set generation flags for compatibility
      if (isDIYMode) {
        await setStateAsync(setWantsToMakeA_D_I_Y_Article, true, 'backendData');
      } else {
        await setStateAsync(setWantsToMakeAnArticle, true, 'backendData');
      }

      await setStateAsync(setIsArticleGenerating, true, 'affectsSomethingVisual');

      // Generate form_id for tracking
      const form_id = `${selectedVoiceProvider}_${Date.now()}_${user.user_db_id}_${user.name || `bug_user_${Date.now()}`}`;

      // Call appropriate Convex action based on provider and mode
      let result;
      if (selectedVoiceProvider === 'replicate') {
        if (isDIYMode) {
          // NOTE STEP 2 - ARTICLE FUNCTION IS CALLED USING CONVEX ACTIONS
          result = await generateArticleReplicateCustom({
            user_db_id: user.user_db_id,
            query: articleQuery,
            form_id: form_id,
            clients: clients,
          });
        } else {
          // NOTE STEP 2 - ARTICLE FUNCTION IS CALLED USING CONVEX ACTIONS
          result = await generateArticleReplicate({
            user_db_id: user.user_db_id,
            query: articleQuery,
            form_id: form_id,
            clients: clients,
          });
        }
      } else if (selectedVoiceProvider === 'elevenlabs') {
        if (isDIYMode) {
          // NOTE STEP 2 - ARTICLE FUNCTION IS CALLED USING CONVEX ACTIONS
          result = await generateArticleElevenLabsCustom({
            user_db_id: user.user_db_id,
            query: articleQuery,
            form_id: form_id,
            clients: clients,
            apiKey: envVariables.EXPO_PUBLIC_ELEVENLABS_API_KEY as string,
          });
        } else {
          // NOTE STEP 2 - ARTICLE FUNCTION IS CALLED USING CONVEX ACTIONS
          result = await generateArticleElevenLabs({
            user_db_id: user.user_db_id,
            query: articleQuery,
            form_id: form_id,
            clients: clients,
            apiKey: envVariables.EXPO_PUBLIC_ELEVENLABS_API_KEY as string,
          });
        }
      }

      if (result?.success === true) {
        setArticleGenerationStatusState('done');
        console.log('Article generation successful:', result);
      } else {
        console.log('Article generation failed:', result);
        setArticleGenerationStatusState('error');
      }

      setArticleGenerationStatusState('submitted');

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
    successFeedback, 
    setForm, 
    setWantsToMakeA_D_I_Y_Article, 
    setWantsToMakeAnArticle,
    setIsArticleGenerating,
    navigation,
    setNeedsToRefresh,
    generateArticleReplicate,
    generateArticleElevenLabs,
    generateArticleReplicateCustom,
    generateArticleElevenLabsCustom
  ]);

  const resetArticleCreationProcess = useCallback(async () => {
    try {
      ProgressQueue?.resetQueue();
      setProgressMessage?.('');
      setGenerationStarted?.(false);

      setArticleQueryState('');
      if (currentAvailableVoiceOptions.length > 0) {
        const defaultVoice = currentAvailableVoiceOptions[0];
        setSelectedVoiceIdState(defaultVoice.value);
        setSelectedVoiceNameState(defaultVoice.label);
        setSelectedVoiceProviderState(defaultVoice.provider);
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
    selectedVoiceId,
    selectedVoiceName,
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
    closeVoiceSelectionModalAndConfirm,
    closeVoiceSelectionModalAndCancel,
    setTempSelectedVoiceInModal: setTempSelectedVoiceInModalState
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