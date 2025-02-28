import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { LotusArticle } from '@/types/type';
import { tokenCache } from '@/lib/auth';
import sql from '@/helpers/neonClient';
import { setStateAsync } from '@/constants/utilityFunctions';

interface LotusUserContextType {
  // TODO add types
  user?: any;
  setUser?: (value: any) => void;
  isSignedIn?: boolean;
  setIsSignedIn?: (value: boolean) => void;
  hasAccount?: boolean;
  setHasAccount?: (value: boolean) => void;
  needsToRefresh?: boolean, 
  setNeedsToRefresh?: (value: boolean) => void;
  // TODO add types
  userArticles?: any;
  setUserArticles?: (value: any) => void;
  mostRecentUserArticles?: any;
  setMostRecentUserArticles?: (value: any) => void;
  homepageArticle?: any;
  setHomepageArticle?: (value: any) => void;
  linerNoteArticles?: any;
  setLinerNoteArticles?: (value: any) => void;
  userArticleCount: number;
  setUserArticleCount?: (value: number) => void;
  userUpvoteCount?: number;
  setUserUpvoteCount?: (value: number) => void;
  userStepCount?: number;
  setUserStepCount?: (value: number) => void;
  totalSteps?: number;  
  setTotalSteps?: (value: number) => void;
  checkSignInStatus: () => Promise<void>; 
  refreshUserData: () => Promise<void>;
  startPlayingLinerNote?: boolean;
  setStartPlayingLinerNote?: (value: boolean) => void;
}

const LotusUserContext = createContext<LotusUserContextType | null>(null);

export const LotusUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  const [user, setUser] = useState<any>();
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [hasAccount, setHasAccount] = useState<boolean>(false);
  const [needsToRefresh, setNeedsToRefresh] = useState<boolean>(false);
  const [userArticles, setUserArticles] = useState<LotusArticle[]>([]);
  const [mostRecentUserArticles, setMostRecentUserArticles] = useState<LotusArticle[]>([]);

  // FIXME
  const [homepageArticle, setHomepageArticle] = useState<LotusArticle[]>([]);
  // FIXME
  const [linerNoteArticles, setLinerNoteArticles] = useState<LotusArticle[]>([]);
  const [userArticleCount, setUserArticleCount] = useState(0)
  const [userUpvoteCount, setUserUpvoteCount] = useState(0)
  const [userStepCount, setUserStepCount] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0);
  const [startPlayingLinerNote, setStartPlayingLinerNote] = useState<boolean>(false)
  
  const linerNoteTopic = "Lotus Liner Notes";

  const checkSignInStatus = async () => {
    try {
      const savedHash = await tokenCache.getToken('lotusJWTAlwaysGrowingToken');
 
      if (savedHash) {
        // im just going to set the user here. this serves the purpose so i can refresh data when ever i want
        const userInfo = await sql`SELECT * FROM users WHERE jwt = ${savedHash}`;
        if (userInfo && userInfo[0]) {  

          // set user
          await setStateAsync(setUser, userInfo[0], 'backendData');
          await setStateAsync(setHasAccount, true, 'backendData');
          await setStateAsync(setIsSignedIn, true, 'backendData');

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

        /* NOTE - For Lines 111 - 136:
        All of these SQL statements return in array, so it's important where if I only really need one,
        I have to use [0] to get the first item in the array.
        */

        // Get fresh article count directly 
        const articles = await sql`
          SELECT * FROM readios 
          WHERE clerk_id = ${user.clerk_id}
          ORDER BY created_at DESC
        `;
  
        // Get liner notes
        const linerNotes = await sql`
          SELECT * FROM readios
          WHERE topic = ${linerNoteTopic} 
          ORDER BY featured DESC LIMIT 100
        `;

        // Get featured articles to pair with liner notes
        const featuredArticles = await sql`
          SELECT * FROM readios 
          WHERE topic = ${!linerNoteTopic} 
          AND featured = true 
          ORDER BY featured DESC LIMIT 100
        `;

        // Get homepage article
        const homeArticle = await sql`
          SELECT * FROM readios WHERE featured = true
        `;
        
        const combinedLinerNotes = [...linerNotes, ...featuredArticles];

        await setStateAsync(setUserArticles, articles, 'backendData');
        console.log('promise to set user articles.')

        await setStateAsync(setMostRecentUserArticles, articles.slice(0, 6), 'backendData');
        console.log('promise to set most recent 6 user articles.')

        await setStateAsync(setLinerNoteArticles, combinedLinerNotes, 'backendData');
        console.log('promise to set liner note articles.')

        await setStateAsync(setHomepageArticle, homeArticle[0], 'backendData');
        console.log('promise to set homepage article.', homeArticle)
        
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
      hasAccount,
      setHasAccount,
      needsToRefresh, 
      setNeedsToRefresh,
      userArticles,
      setUserArticles,
      mostRecentUserArticles,
      setMostRecentUserArticles,
      homepageArticle,
      setHomepageArticle,
      linerNoteArticles,
      setLinerNoteArticles,
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
      refreshUserData,
      startPlayingLinerNote,
      setStartPlayingLinerNote
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