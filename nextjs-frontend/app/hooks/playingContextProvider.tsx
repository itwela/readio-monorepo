'use client'

import React, { createContext, useState, useContext } from 'react';
import { Message } from '../actions';

interface ReadioMainContextType {
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
  selectedText: string;
  setSelectedText: React.Dispatch<React.SetStateAction<string>>;
}

const ReadioMainContext = createContext<ReadioMainContextType | null>(null);

export const ReadioMainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');


  return (
    <ReadioMainContext.Provider value={{
      isPlaying,
      selectedText,
      setIsPlaying,
      setSelectedText,
    }}>
      {children}
    </ReadioMainContext.Provider>
  );
};

export const useReadioMain = () => {
  const context = useContext(ReadioMainContext);
  if (!context) throw new Error('useReadioMain must be used within a ReadioMainProvider');
  return context;
};
