import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import sql from '@/helpers/neonClient';
import { setStateAsync } from '@/constants/utilityFunctions';
import { useLotusUser } from './lotusUserContext';

interface LotusFithopContextType {
  // defaultString: string;
  // setString: (value: string) => void;
  // defaultBoolean: boolean;
  // setBoolean: (value: boolean) => void;
  // defaultInteger: number;
  // setInteger: (value: number) => void;
  // defaultPromise: () => Promise<void>;

  fithopAlbums: any;
  setFithopAlbums: (album: any) => void;
}

const LotusFithopContext = createContext<LotusFithopContextType | null>(null);

export const LotusFithopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {user} = useLotusUser();
  const [fithopAlbums, setFithopAlbums] = useState<any>(null);

  // const [defaultString, setString] = useState<string>('');
  // const [defaultBoolean, setBoolean] = useState<boolean>(false);
  // const [defaultInteger, setInteger] = useState<number>(0);
  // const [defaultAny, setDefaultAny] = useState<any>(null);

  const refreshFithopData = async () => {
    try {
      
      /* NOTE - For Lines ___ - ___:
      All of these SQL statements return in array, so it's important where if I only really need one,
      I have to use [0] to get the first item in the array.
      */

      // Get fresh article count directly 
      const albums = await sql`
        SELECT * FROM fithop 
        ORDER BY id ASC
      `;
        
      await setStateAsync(setFithopAlbums, albums, 'backendData');
      // console.log('promise to set fithop albums.')

    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  useEffect(() => {
    
    const handleGetAllFithopAlbums = async () => {
      await refreshFithopData();
    };

    handleGetAllFithopAlbums();

  }, []);

  return (
    <LotusFithopContext.Provider value={{
      // defaultString,
      // setString,
      // defaultBoolean,
      // setBoolean,
      // defaultInteger,
      // setInteger,
      // defaultPromise,


      fithopAlbums,
      setFithopAlbums,
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