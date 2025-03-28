import { router } from 'expo-router';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';



type LotusModalContextType = {

  form: {
    query: string;
  };
  voiceOptions: { label: string; value: string; provider: string; }[];

  currentVoiceOption: any;
  setCurrentVoiceOption: (value: any) => void;
  setForm: React.Dispatch<React.SetStateAction<{
    query: string;
  }>>;

  isArticleModalVisible: boolean;
  setIsArticleModalVisible: (visible: boolean) => void;

  isStudyModalVisible: boolean;
  setIsStudyModalVisible: (visible: boolean) => void;

  wantsToMakeAnArticle: any;
  setWantsToMakeAnArticle: (article: any) => void;

  wantsToMakeAStudyArticle: any;
  setWantsToMakeAStudyArticle: (article: any) => void;

  isArticleGenerating: boolean;
  setIsArticleGenerating: (generating: boolean) => void;
  articleGenerationStatus: string;
  setArticleGenerationStatus: (status: string) => void;

  minuteHasPassed: boolean;
  setMinuteHasPassed: (minuteHasPassed: boolean) => void;

};

const LotusModalContext = createContext<LotusModalContextType | undefined>(undefined);

export function LotusModalProvider({ children }: { children: ReactNode }) {

  const [form, setForm] = useState({
    query: '',
  })

  const voiceOptions = [
    { label: 'Kore', value: 'af_kore', provider:'replicate'  },
    { label: 'Michael', value: 'am_michael', provider: 'replicate'  },
    { label: 'Beta', value: 'hf_beta', provider: 'replicate' },
    { label: 'Stic', value: 'ri3Bh626mOazCBOSTIae', provider: 'elevenlabs'  },
  ];

  const [currentVoiceOption, setCurrentVoiceOption] = useState<any>(null)

  const [isArticleModalVisible, setIsArticleModalVisible] = useState<boolean>(false);
  const [isStudyModalVisible, setIsStudyModalVisible] = useState<boolean>(false);

  const [wantsToMakeAnArticle, setWantsToMakeAnArticle] = React.useState<any>(null)
  const [wantsToMakeAStudyArticle, setWantsToMakeAStudyArticle] = React.useState<any>(null)

  const [isArticleGenerating, setIsArticleGenerating] = useState<boolean>(false);
  const [articleGenerationStatus, setArticleGenerationStatus] = useState('')
  
  const [minuteHasPassed, setMinuteHasPassed] = useState<boolean>(false);



  return (
    <LotusModalContext.Provider
      value={{

        form,
        setForm,

        voiceOptions,
        currentVoiceOption,
        setCurrentVoiceOption,

        isArticleModalVisible,
        setIsArticleModalVisible,
        
        isStudyModalVisible,
        setIsStudyModalVisible,

        wantsToMakeAnArticle,
        setWantsToMakeAnArticle,

        wantsToMakeAStudyArticle,
        setWantsToMakeAStudyArticle,

        isArticleGenerating,
        setIsArticleGenerating,
        articleGenerationStatus,
        setArticleGenerationStatus,

        minuteHasPassed,
        setMinuteHasPassed,

      }}>
      {children}
    </LotusModalContext.Provider>
  );
}

export function useLotusModal() {
  const context = useContext(LotusModalContext);
  if (context === undefined) {
    throw new Error('useLotusArticle must be used within an LotusArticleProvider');
  }
  return context;
}
