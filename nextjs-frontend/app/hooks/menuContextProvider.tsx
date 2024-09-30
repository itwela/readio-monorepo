'use client'

import React, { createContext, useState, useContext } from 'react';
import { Message } from '../actions';

interface ReadioMenuContextType {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
}

const ReadioMenuContext = createContext<ReadioMenuContextType | null>(null);

export const ReadioMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  return (
    <ReadioMenuContext.Provider value={{
      isMenuOpen,
      setIsMenuOpen,
    }}>
      {children}
    </ReadioMenuContext.Provider>
  );
};

export const useReadioMenu = () => {
  const context = useContext(ReadioMenuContext);
  if (!context) throw new Error('useReadioMenu must be used within a ReadioMenuProvider');
  return context;
};
