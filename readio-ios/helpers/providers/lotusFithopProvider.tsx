import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { setStateAsync } from '@/constants/utilityFunctions';
import { useLotusUser } from './lotusUserContext';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface LotusFithopContextType {
  albums: any;
  // 🎯 REMOVED: Now admin-only operation in AdminSyncDashboard
  // syncTracksToArticles: () => Promise<void>;
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

const LotusFithopContext = createContext<LotusFithopContextType | null>(null);

export const LotusFithopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  // 🎯 HYBRID APPROACH: Get album metadata + tracks from articles (5MB with full metadata)
  const albums = useQuery(api.articles.getMusicWithAlbumMetadata, { limit: 20 });
  // 🎯 REMOVED: Heavy fithop table query (151MB)
  // const albums = useQuery(api.fithop.getFithopAlbumsWithArticleIds);
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // 🎯 REMOVED: Sync is now admin-only operation in AdminSyncDashboard
  // const syncTracksToArticles = async () => {
  //   try {
  //     console.log('🎯 Manual sync requested');
  //     const result = await syncFithopTracksToArticlesMutation({});
  //   } catch (error) {
  //     console.error('Error syncing tracks to articles:', error);
  //   }
  // };

  // 🎯 REMOVED AUTO-SYNC - only sync on manual request to reduce bandwidth
  // useEffect(() => {
  //   if (albums && albums.length > 0) {
  //     syncTracksToArticles();
  //   }
  // }, [albums]);

  const loadMore = () => {
    console.log('🎯 Load more not implemented yet - use paginated query');
    // TODO: Implement with paginated query
  };

  return (
    <LotusFithopContext.Provider value={{
      albums,
      // 🎯 REMOVED: Now admin-only operation in AdminSyncDashboard
      // syncTracksToArticles,
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
