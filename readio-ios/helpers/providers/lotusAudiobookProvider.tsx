import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import sql from '@/helpers/neonClient';
import { setStateAsync } from '@/constants/utilityFunctions';
import { useLotusUser } from './lotusUserContext';

interface LotusAudiobookContextType {
  audiobooks: any;
  setAudiobooks: (album: any) => void;
}

const LotusAudiobookContext = createContext<LotusAudiobookContextType | null>(null);

export const LotusAudiobookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {user} = useLotusUser();
  const [audiobooks, setAudiobooks] = useState<any>(null);
  const refreshAudiobookData = async () => {
    try {
      
      /* NOTE - For Lines ___ - ___:
      All of these SQL statements return in array, so it's important where if I only really need one,
      I have to use [0] to get the first item in the array.
      */

      // Get fresh article count directly 
      const audiobooks = await sql`
        SELECT * FROM audiobooks 
        ORDER BY id ASC
      `;
        
      await setStateAsync(setAudiobooks, audiobooks, 'backendData');
      console.log('promise to set audiobooks.')

    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  useEffect(() => {
    
    const handleGetAllAudiobooks = async () => {
      await refreshAudiobookData();
    };

    handleGetAllAudiobooks();

  }, []);

  return (
    <LotusAudiobookContext.Provider value={{
      audiobooks,
      setAudiobooks,
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