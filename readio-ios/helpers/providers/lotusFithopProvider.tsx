import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import sql from '@/helpers/neonClient';
import { setStateAsync } from '@/constants/utilityFunctions';

interface LotusFithopContextType {
  defaultString: string;
  setString: (value: string) => void;
  defaultBoolean: boolean;
  setBoolean: (value: boolean) => void;
  defaultInteger: number;
  setInteger: (value: number) => void;
  defaultPromise: () => Promise<void>;
  defaultAny: any;
  setDefaultAny: (value: any) => void;
}

const LotusFithopContext = createContext<LotusFithopContextType | null>(null);

export const LotusFithopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [defaultString, setString] = useState<string>('');
  const [defaultBoolean, setBoolean] = useState<boolean>(false);
  const [defaultInteger, setInteger] = useState<number>(0);
  const [defaultAny, setDefaultAny] = useState<any>(null);

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
    <LotusFithopContext.Provider value={{
      defaultString,
      setString,
      defaultBoolean,
      setBoolean,
      defaultInteger,
      setInteger,
      defaultPromise,
      defaultAny,
      setDefaultAny,
    }}>
      {children}
    </LotusFithopContext.Provider>
  );
};

export const useLotusFithop = () => {
  const context = useContext(LotusFithopContext);
  if (!context) throw new Error('useLotusFithop must be used within a LotusFithopProvider');
  return context;
};