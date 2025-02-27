import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { LotusArticle } from '@/types/type';
import { tokenCache } from '@/lib/auth';
import sql from '@/helpers/neonClient';
import { setStateAsync } from '@/constants/utilityFunctions';

interface LotusUserContextType {
  // TODO add types
  user?: any;
  setUser?: (value: any) => void;
  isSignedInLotus?: boolean;
  setIsSignedInLotus?: (value: boolean) => void;
  hasAccount?: any;
  setHasAccount?: (value: any) => void;
  needsToRefresh?: any, 
  setNeedsToRefresh?: (value: any) => void;
  // TODO ddd types
  userArticles?: any;
  setUserArticles?: (value: any) => void;
  userArticleCount: number;
  setUserArticleCount?: (value: number) => void;
  userUpvoteCount?: number;
  setUserUpvoteCount?: (value: number) => void;
  userStepCount?: number;
  setUserStepCount?: (value: number) => void;
  totalSteps?: number;  
  setTotalSteps?: (value: number) => void;
  isSignedIn?: any;
  setIsSignedIn?: (value: any) => void;
  checkSignInStatus: () => Promise<void>; 
  refreshUserData: () => Promise<void>;
}

const LotusUserContext = createContext<LotusUserContextType | null>(null);

export const LotusUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  const [user, setUser] = useState<any>();
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [needsToRefresh, setNeedsToRefresh] = useState(false);
  const [userArticles, setUserArticles] = useState<LotusArticle[]>([]);
  const [userArticleCount, setUserArticleCount] = useState(0)
  const [userUpvoteCount, setUserUpvoteCount] = useState(0)
  const [userStepCount, setUserStepCount] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0);
  const [isSignedInLotus, setIsSignedInLotus] = useState<boolean>(false);


  const checkSignInStatus = async () => {
    try {
      const savedHash = await tokenCache.getToken('lotusJWTAlwaysGrowingToken');
      await setStateAsync(setIsSignedInLotus, Boolean(savedHash), 'backendData');
 
      if (savedHash) {
        // im just going to set the user here. this serves the purpose so i can refresh data when ever i want
        const userInfo = await sql`SELECT * FROM users WHERE jwt = ${savedHash}`;
        if (userInfo && userInfo[0]) {  

          // set user
          await setStateAsync(setUser, userInfo[0], 'backendData');
          await setStateAsync(setHasAccount, true, 'backendData');

        } else {

          await setStateAsync(setHasAccount, false, 'backendData');
          await setStateAsync(setUser, null, 'backendData');

        }
      } else {

        await setStateAsync(setHasAccount, false, 'backendData');
        await setStateAsync(setUser, null, 'backendData');   
          
      }
    } catch (error) {
      console.error('Error checking sign in status:', error);
      await setStateAsync(setIsSignedIn, false, 'backendData');
      await setStateAsync(setHasAccount, false, 'backendData');
      await setStateAsync(setUser, null, 'backendData');

    } finally {
      await setStateAsync(setNeedsToRefresh, false, 'backendData');
    }
  };

  const refreshUserData = async () => {
    try {
      const savedHash = await tokenCache.getToken('lotusJWTAlwaysGrowingToken');
      
      if (savedHash && user) {
        // Get fresh article count directly
        const articles = await sql`
          SELECT * FROM readios 
          WHERE clerk_id = ${user.clerk_id}
          ORDER BY id DESC
        `;

        await setStateAsync(setUserArticles, articles, 'backendData');
        console.log('promise to set user articles.')

        await setStateAsync(setUserArticleCount, articles.length, 'backendData');
        console.log('promise to set user articles initial length.')

        await setStateAsync(setUserStepCount, user.usersteps, 'backendData');
        console.log('promise to set user steps.')

        await setStateAsync(setUserUpvoteCount, user.upvotes, 'backendData');
        console.log('promise to set user upvotes.')
        
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  useEffect(() => {

    const initializeData = async () => {
      await checkSignInStatus();

      setTimeout(() => {
      }, 1000);

      await refreshUserData();
    };

    initializeData();
  }, [needsToRefresh]);


  return (
    <LotusUserContext.Provider value={{
      user,
      setUser,
      isSignedInLotus,
      setIsSignedInLotus,
      hasAccount,
      setHasAccount,
      needsToRefresh, 
      setNeedsToRefresh,
      userArticles,
      setUserArticles,
      userArticleCount,
      setUserArticleCount,
      userUpvoteCount,
      setUserUpvoteCount,
      userStepCount,
      setUserStepCount,
      totalSteps,  
      setTotalSteps,
      isSignedIn,
      setIsSignedIn,
      checkSignInStatus,
      refreshUserData
    }}>
      {children}
    </LotusUserContext.Provider>
  );
};

export const useLotusUser = (match?: string) => {
  const context = useContext(LotusUserContext);
  if (!context) throw new Error('useLotusUser must be used within a LotusUserProvider');
  return context;
};