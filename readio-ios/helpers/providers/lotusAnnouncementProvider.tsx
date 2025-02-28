import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import sql from '@/helpers/neonClient';
import { setStateAsync } from '@/constants/utilityFunctions';

interface LotusAnnouncementContextType {
  showAnnouncement: boolean;
  setShowAnnouncement: (value: boolean) => void;
}

const LotusAnnouncementContext = createContext<LotusAnnouncementContextType | null>(null);

export const LotusAnnouncementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(true);

  useEffect(() => {
    // Effect for managing announcement state if needed
  }, []);

  return (
    <LotusAnnouncementContext.Provider value={{
      showAnnouncement,
      setShowAnnouncement,
    }}>
      {children}
    </LotusAnnouncementContext.Provider>
  );
};

export const useLotusAnnouncement = () => {
  const context = useContext(LotusAnnouncementContext);
  if (!context) throw new Error('useLotusAnnouncement must be used within a LotusAnnouncementProvider');
  return context;
};