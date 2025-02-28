import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import sql from '@/helpers/neonClient';
import { setStateAsync } from '@/constants/utilityFunctions';

interface LotusSettingsContextType {
//   defaultString: string;
//   setString: (value: string) => void;
  settingsOpen: boolean;
  setSettingsOpen: (value: boolean) => void;
//   defaultInteger: number;
//   setInteger: (value: number) => void;
//   defaultPromise: () => Promise<void>;
//   defaultAny: any;
//   setDefaultAny: (value: any) => void;
}

const LotusSettingsContext = createContext<LotusSettingsContextType | null>(null);

export const LotusSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [defaultString, setString] = useState<string>('');
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
//   const [defaultInteger, setInteger] = useState<number>(0);
//   const [defaultAny, setDefaultAny] = useState<any>(null);

  const defaultPromise = async () => {
    try {
      // Your async logic here
    } catch (error) {
      console.error('Error in defaultPromise:', error);
    }
  };

  useEffect(() => {
    // Your effect logic here
  }, []);

  return (
    <LotusSettingsContext.Provider value={{
        settingsOpen,
        setSettingsOpen,
    }}>
      {children}
    </LotusSettingsContext.Provider>
  );
};

export const useLotusSettings = () => {
  const context = useContext(LotusSettingsContext);
  if (!context) throw new Error('useLotusSettings must be used within a LotusSettingsProvider');
  return context;
};