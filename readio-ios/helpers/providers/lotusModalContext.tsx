import { ImageAssets } from '@/constants/imageAssets';
import { colors } from '@/constants/tokens';
import React, { createContext, ReactNode, useContext, useState } from 'react';



type LotusModalContextType = {

  form: {
    query: string;
    provider: string;
    id: string;
  };
  voiceOptions: { label: string; value: string; provider: string; image: any }[];
  diyVoiceOptions: { label: string; value: string; provider: string; image: any }[];
  diyVoiceOptionsAdmin: { label: string; value: string; provider: string; image: any }[];

  currentVoiceOption: any;
  setCurrentVoiceOption: (value: any) => void;
  setForm: React.Dispatch<React.SetStateAction<{
    query: string;
    provider: string;
    id: string;
  }>>;

  isArticleModalVisible: boolean;
  setIsArticleModalVisible: (visible: boolean) => void;

  isStudyModalVisible: boolean;
  setIsStudyModalVisible: (visible: boolean) => void;

  wantsToMakeAnArticle: any;
  setWantsToMakeAnArticle: (article: any) => void;

  wantsToMakeA_D_I_Y_Article: any;
  setWantsToMakeA_D_I_Y_Article: (article: any) => void;

  isArticleGenerating: boolean;
  setIsArticleGenerating: (generating: boolean) => void;
  articleGenerationStatus: string;
  setArticleGenerationStatus: (status: string) => void;

  minuteHasPassed: boolean;
  setMinuteHasPassed: (minuteHasPassed: boolean) => void;

  rFA: boolean;
  setRFA: (rFA: boolean) => void;

  selectedVoiceName: string;
  setSelectedVoiceName: (selectedVoiceName: string) => void;

  selectedVoiceProvider: string;
  setSelectedVoiceProvider: (selectedVoiceProvider: string) => void;

  selectedVoiceId: string | null;
  setSelectedVoiceId: (selectedVoiceId: string | null) => void;

  iconColor: string;

  isDIYMode: boolean;
  setIsDIYMode: (isDIYMode: boolean) => void;

  modalMessege: string;
  setModalMessage: (modalMessege: string) => void;

  placeholderMessege: string;
  setPlaceholderMessage: (placeholderMessege: string) => void;

};

const LotusModalContext = createContext<LotusModalContextType | undefined>(undefined);

export function LotusModalProvider({ children }: { children: ReactNode }) {

  const [form, setForm] = useState({
    query: '',
    provider: '',
    id: '',
  })

  const voiceOptions = [
    { label: 'Grace', value: 'af_kore', provider: 'replicate', image: ImageAssets.graceAvatar  },
    { label: 'Pythagorus', value: 'am_michael', provider: 'replicate', image: ImageAssets.pythagorusAvatar },
    { label: 'Padma', value: 'hf_beta', provider: 'replicate', image: ImageAssets.padmaAvatar },
    { label: 'Stic', value: 'ri3Bh626mOazCBOSTIae', provider: 'elevenlabs', image: ImageAssets.whiteLogo  },
  ];
  
  const diyVoiceOptions = [
    { label: 'Grace', value: 'af_kore', provider: 'replicate', image: ImageAssets.graceAvatar  },
    { label: 'Pythagorus', value: 'am_michael', provider: 'replicate', image: ImageAssets.pythagorusAvatar },
    { label: 'Padma', value: 'hf_beta', provider: 'replicate', image: ImageAssets.padmaAvatar },
    { label: 'Stic', value: 'ri3Bh626mOazCBOSTIae', provider: 'elevenlabs', image: ImageAssets.whiteLogo  },
  ];

  const diyVoiceOptionsAdmin = [
    { label: 'Grace', value: 'af_kore', provider: 'replicate', image: ImageAssets.graceAvatar  },
    { label: 'Pythagorus', value: 'am_michael', provider: 'replicate', image: ImageAssets.pythagorusAvatar },
    { label: 'Padma', value: 'hf_beta', provider: 'replicate', image: ImageAssets.padmaAvatar },
    { label: 'Stic', value: 'ri3Bh626mOazCBOSTIae', provider: 'elevenlabs', image: ImageAssets.whiteLogo  },
  ];

  const [currentVoiceOption, setCurrentVoiceOption] = useState<any>(null)

  const [isArticleModalVisible, setIsArticleModalVisible] = useState<boolean>(false);
  const [isStudyModalVisible, setIsStudyModalVisible] = useState<boolean>(false);

  const [wantsToMakeAnArticle, setWantsToMakeAnArticle] = React.useState<any>(null)
  const [wantsToMakeA_D_I_Y_Article, setWantsToMakeA_D_I_Y_Article] = React.useState<any>(null)

  const [isArticleGenerating, setIsArticleGenerating] = useState<boolean>(false);
  const [articleGenerationStatus, setArticleGenerationStatus] = useState('')
  
  const [minuteHasPassed, setMinuteHasPassed] = useState<boolean>(false);


  const [rFA, setRFA] = React.useState<boolean>(false)
  const [selectedVoiceName, setSelectedVoiceName] = React.useState<string>('---')
  const [selectedVoiceProvider, setSelectedVoiceProvider] = React.useState<string>('')
  const [selectedVoiceId, setSelectedVoiceId] = React.useState<string | null>(null)
  const iconColor = selectedVoiceId ? colors.readioOrange : 'rgba(255, 255, 255, 0.3)'
  const [isDIYMode, setIsDIYMode] = React.useState(false);
  const [modalMessege, setModalMessage] = React.useState('')
  const [placeholderMessege, setPlaceholderMessage] = React.useState('')



  return (
    <LotusModalContext.Provider
      value={{

        form,
        setForm,

        voiceOptions,
        diyVoiceOptions,
        diyVoiceOptionsAdmin,
        currentVoiceOption,
        setCurrentVoiceOption,

        isArticleModalVisible,
        setIsArticleModalVisible,
        
        isStudyModalVisible,
        setIsStudyModalVisible,

        wantsToMakeAnArticle,
        setWantsToMakeAnArticle,

        wantsToMakeA_D_I_Y_Article,
        setWantsToMakeA_D_I_Y_Article,

        isArticleGenerating,
        setIsArticleGenerating,
        articleGenerationStatus,
        setArticleGenerationStatus,

        minuteHasPassed,
        setMinuteHasPassed,

        rFA,
        setRFA,
        selectedVoiceName,
        setSelectedVoiceName,
        selectedVoiceProvider,
        setSelectedVoiceProvider,
        selectedVoiceId,
        setSelectedVoiceId,
        iconColor,
        isDIYMode,
        setIsDIYMode,
        modalMessege,
        setModalMessage,
        placeholderMessege,
        setPlaceholderMessage,

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
