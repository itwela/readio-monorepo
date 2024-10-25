'use client'

import React, { createContext, useContext, useState } from 'react';

interface ReadioContextType {
//   isStarted: boolean;
//   message: string[];
//   selectedCompatibility: number;
  readioSelectedTopics?: string[];
  setReadioSelectedTopics?: (value: string[]) => void;
  readioSelectedReadioId?: number;
  setReadioSelectedReadioId?: (value: number) => void;
}

const ReadioContext = createContext<ReadioContextType | null>(null);

export const ReadioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [readioSelectedTopics, setReadioSelectedTopics] = useState<string[]>([]);
    const [readioSelectedReadioId, setReadioSelectedReadioId] = useState<number>();

  return (
    <ReadioContext.Provider value={{
        readioSelectedTopics,
        setReadioSelectedTopics,
        readioSelectedReadioId,
        setReadioSelectedReadioId,
    }}>
      {children}
    </ReadioContext.Provider>
  );
};

export const useReadio = (match?: string) => {
  const context = useContext(ReadioContext);
  if (!context) throw new Error('useReadio must be used within a QuizProvider');
  return context;
};