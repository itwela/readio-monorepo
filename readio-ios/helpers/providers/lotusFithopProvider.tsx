import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { setStateAsync } from '@/constants/utilityFunctions';
import { useLotusUser } from './lotusUserContext';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface LotusFithopContextType {
  albums: any;
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

const LotusFithopContext = createContext<LotusFithopContextType | null>(null);

export const LotusFithopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  // 🎯 HYBRID APPROACH: Get album metadata + tracks from articles (5MB with full metadata)
  const albums = useQuery(api.articles.getMusicWithAlbumMetadata, { limit: 20 });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const loadMore = () => {
    console.log('🎯 Load more not implemented yet - use paginated query');
    // TODO: Implement with paginated query
  };

  return (
    <LotusFithopContext.Provider value={{
      albums,
      loadMore,
      hasMore,
      isLoading,
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
