import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import sql from '@/helpers/neonClient';
import { setStateAsync } from '@/constants/utilityFunctions';

interface LotusPresenceContextType {
  defaultString: string;
  setString: (value: string) => void;
  defaultBoolean: boolean;
  setBoolean: (value: boolean) => void;
  defaultInteger: number;
  setInteger: (value: number) => void;
  defaultPromise: () => Promise<void>;

  selectedPresenceDuration: any;
  setSelectedPresenceDuration: (value: any) => void;
  selectedPresenceLesson: any;
  setSelectedPresenceLesson: (value: any) => void;
  selectedPresenceBackgroundMusic: any;
  setSelectedPresenceBackgroundMusic: (value: any) => void;

}

const LotusPresenceContext = createContext<LotusPresenceContextType | null>(null);

export const LotusPresenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [defaultString, setString] = useState<string>('');
  const [defaultBoolean, setBoolean] = useState<boolean>(false);
  const [defaultInteger, setInteger] = useState<number>(0);

  const [selectedPresenceDuration, setSelectedPresenceDuration] = useState<any>(null);
  const [selectedPresenceLesson, setSelectedPresenceLesson] = useState<any>(null);
  const [selectedPresenceBackgroundMusic, setSelectedPresenceBackgroundMusic] = useState<any>(null);

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
    <LotusPresenceContext.Provider value={{
      defaultString,
      setString,
      defaultBoolean,
      setBoolean,
      defaultInteger,
      setInteger,
      defaultPromise,

      selectedPresenceDuration,
      setSelectedPresenceDuration,
      selectedPresenceLesson,
      setSelectedPresenceLesson,
      selectedPresenceBackgroundMusic,
      setSelectedPresenceBackgroundMusic,
    }}>
      {children}
    </LotusPresenceContext.Provider>
  );
};

export const useLotusPresence = () => {
  const context = useContext(LotusPresenceContext);
  if (!context) throw new Error('useLotusPresence must be used within a LotusPresenceProvider');
  return context;
};