import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { LotusArticle } from '@/types/type';
import { tokenCache } from '@/lib/auth';
import sql from '@/helpers/neonClient';
import { setStateAsync } from '@/constants/utilityFunctions';
import { useLotusUtils } from './lotusUtilsContext';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';


// SECTION TYPES AND CONTEXT
interface LotusUserContextType {
  // TODO add types
  user?: any;
  setUser?: (value: any) => void;
  isSignedIn?: boolean;
  setIsSignedIn?: (value: boolean) => void;
  hasAccount?: boolean;
  setHasAccount?: (value: boolean) => void;
  subscription_plan?: string;
  coin_balance?: number;
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
  communityPlaylistArticles?: any;
  setCommunityPlaylistArticles?: (value: any) => void;
  playlistCategories?: any;
  newlyGeneratedArticle?: any;
  setNewlyGeneratedArticle?: (value: any) => void;
  setPlaylistCategories?: (value: any) => void;
  setLinerNoteArticles?: (value: any) => void;
  userArticleCount: number;
  setUserArticleCount?: (value: number) => void;
  userFavoriteArticles?: any;
  setUserFavoriteArticles?: (value: any) => void;
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
  userMinutesMeditated?: number;
  setUserMinutesMeditated?: (value: number) => void;

  userIsSubscribed?: boolean;
  setUserIsSubscribed?: (value: boolean) => void;

  userIsOnStarterPlan?: boolean;
  setUserIsOnStarterPlan?: (value: boolean) => void;

  userIsOnPremiumPlan?: boolean;
  setUserIsOnPremiumPlan?: (value: boolean) => void;

  userIsAdmin?: boolean;
  setUserIsAdmin?: (value: boolean) => void;

  userIsNotSubscribed?: boolean;
  setUserIsNotSubscribed?: (value: boolean) => void;

  // need to add subscription status
  // need to add coin balance
};

interface LotusSubscriptionAndDataInitType extends
  LotusUserContextType { };

interface SubscriptionResult {
  success: boolean;
  plan?: 'starter'|'premium';
  coins?: number;
  error?: string;
}

const LotusUserContext = createContext<LotusSubscriptionAndDataInitType | null>(null);

export const LotusUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  // SECTION Subscription Management ----
  const [subscriptionStatus, setSubscriptionStatus] = useState<'starter'|'premium'|'none'>('none');
  const [coinBalance, setCoinBalance] = useState(0);

  const handleSubscriptionUpdate = async (newPlan: 'starter'|'premium', coins?: number) => {
    if (!user?.id) {
      console.warn('[handleSubscriptionUpdate] No user logged in');
      return;
    }

    try {
      // First verify entitlements with RevenueCat
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlements = customerInfo.entitlements.active;
      
      // Validate subscription against RevenueCat entitlements
      const validPlan = (newPlan === 'premium' && entitlements['Premium Features']) || 
                       (newPlan === 'starter' && entitlements['Starter Features']);
      
      if (!validPlan) {
        throw new Error('Subscription plan does not match RevenueCat entitlements');
      }

      // Update database with verified plan
      await sql`
        UPDATE users 
        SET subscription_plan = ${newPlan},
            ${coins ? sql`coin_balance = COALESCE(coin_balance, 0) + ${coins},` : sql``}
            updated_at = NOW()
        WHERE id = ${user.id}
      `;

      // Update local state with verified plan
      setUser((prev: any) => ({
        ...prev,
        subscription_plan: newPlan,
        coin_balance: coins ? prev.coin_balance + coins : prev.coin_balance
      }));
      
      console.log(`[handleSubscriptionUpdate] Subscription updated to ${newPlan}`);
    } catch (error) {
      console.error('[handleSubscriptionUpdate] Failed to update subscription:', error);
      alert('Failed to update subscription. Please try again.');
    }
  };

  const [user, setUser] = useState<any>();
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [hasAccount, setHasAccount] = useState<boolean>(false);
  const [needsToRefresh, setNeedsToRefresh] = useState<boolean>(false);
  const [userArticles, setUserArticles] = useState<LotusArticle[]>([]);
  const [userFavoriteArticles, setUserFavoriteArticles] = useState<LotusArticle[]>([]);
  const [mostRecentUserArticles, setMostRecentUserArticles] = useState<LotusArticle[]>([]);
  const [newlyGeneratedArticle, setNewlyGeneratedArticle] = useState<LotusArticle>();
  const [homepageArticle, setHomepageArticle] = useState<LotusArticle[]>([]);
  const [linerNoteArticles, setLinerNoteArticles] = useState<LotusArticle[]>([]);
  const [communityPlaylistArticles, setCommunityPlaylistArticles] = useState<LotusArticle[]>([]);
  const [userArticleCount, setUserArticleCount] = useState(0);
  const [userUpvoteCount, setUserUpvoteCount] = useState(0);
  const [userStepCount, setUserStepCount] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [userMinutesMeditated, setUserMinutesMeditated] = useState(0);
  const [startPlayingLinerNote, setStartPlayingLinerNote] = useState<boolean>(false);
  const [playlistCategories, setPlaylistCategories] = useState<any[]>([]);
  const linerNoteTopic = "Lotus Liner Notes";
  const { masterDebugMode } = useLotusUtils()
  const [userIsSubscribed, setUserIsSubscribed] = useState<boolean>(false);
  const [userIsOnStarterPlan, setUserIsOnStarterPlan] = useState<boolean>(false);
  const [userIsOnPremiumPlan, setUserIsOnPremiumPlan] = useState<boolean>(false);
  const [userIsAdmin, setUserIsAdmin] = useState<boolean>(false);
  const [userIsNotSubscribed, setUserIsNotSubscribed] = useState<boolean>(false);

  


  const checkSignInStatus = async () => {


    try {
      const savedHash = await tokenCache.getToken(masterDebugMode ? 'DebuglotusJWTAlwaysGrowingToken' : 'lotusJWTAlwaysGrowingToken');

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
      await setStateAsync(setNeedsToRefresh as Function, false, 'backendData');
    }
  };

  const refreshUserData = async () => {
    try {

      const savedHash = await tokenCache.getToken(masterDebugMode ? 'DebuglotusJWTAlwaysGrowingToken' : 'lotusJWTAlwaysGrowingToken');

      if (savedHash && user) {
        // --- Start: Sync with RevenueCat Entitlements ---
        try {
          console.log('[refreshUserData] Fetching latest CustomerInfo from RevenueCat...');
          const customerInfo = await Purchases.getCustomerInfo();
          const entitlements = customerInfo.entitlements.active;
          
          let planFromRevenueCat: 'premium' | 'starter' | 'blank' = 'blank';

          if (entitlements['Premium Features']) { // Replace with your premium entitlement ID
            planFromRevenueCat = 'premium';
          } else if (entitlements['Starter Features']) { // Replace with your starter entitlement ID
            planFromRevenueCat = 'starter';
          }

          console.log(`[refreshUserData] Plan from RevenueCat entitlements: ${planFromRevenueCat}`);
          console.log(`[refreshUserData] Current plan in DB (before potential update): ${user.subscription_plan}`);

          // If the plan from RevenueCat differs from the one in our DB (via local user state), update the DB.
          if (planFromRevenueCat !== user.subscription_plan) {
            console.log(`[refreshUserData] Plan mismatch. Updating DB from ${user.subscription_plan} to ${planFromRevenueCat} for user ID: ${user.id}`);
            await sql`
              UPDATE users 
              SET subscription_plan = ${planFromRevenueCat},
                  updated_at = NOW()
              WHERE id = ${user.id}
            `;
            console.log(`[refreshUserData] Database successfully updated to ${planFromRevenueCat} for user ID: ${user.id}`);
            // The user object in local state will be updated by the subsequent SELECT query.
          }
        } catch (rcError) {
          console.error('[refreshUserData] Error fetching CustomerInfo or updating plan from RevenueCat:', rcError);
          // Decide if you want to halt refresh or continue with potentially stale plan data
        }
        // --- End: Sync with RevenueCat Entitlements ---

        // Now, refresh user data directly from database (which includes the potentially updated plan)
        const userData = await sql`SELECT * FROM users WHERE id = ${user.id}`;
        if (userData?.[0]) {
          setUser((prev: any) => ({
            ...prev,
            subscription_plan: userData[0].subscription_plan,
            coin_balance: userData[0].coin_balance
          }));
        }
        // At this point, `user.subscription_plan` in the local state (if updated by setUser above)
        // and `userData[0].subscription_plan` will reflect the latest from the database.

        /* NOTE - :
        All of these SQL statements return in array, so it's important where if I only really need one,
        I have to use [0] to get the first item in the array.
        */

        // NOTE Get fresh article count directly - SQL 
        const articles = await sql`
        SELECT * FROM readios
        ORDER BY created_at DESC
        `;

        // NOTE - Get playlist categories - SQL
        const playlistCategories = await sql`
          SELECT * FROM stations 
        `
        setPlaylistCategories(playlistCategories)

        // NOTE - Liner Notes
        const linerNotes = await sql`
          SELECT * FROM liner_notes
        `
        const sortedLinerNotes = linerNotes.sort((a, b) => a.id - b.id);


        // NOTE - Fresh user-specific articles
        const userArticles = articles.filter(article => article.user_db_id === user.user_db_id);

        // NOTE - Fresh user-specific favorite articles
        const userFavoriteArticles = articles.filter(article => article.favorited === true && article.user_db_id === user.user_db_id);
        console.log('userFavoriteArticles', userFavoriteArticles)



        // NOTE - Featured Articles (NOT liner notes)
        const featuredArticles = articles
          .filter(article => article.topic !== linerNoteTopic && article.featured)
          .sort((a, b) => (b.featured === a.featured ? 0 : b.featured ? 1 : -1))
          .slice(0, 100);

        // NOTE - Homepage Article (the most recently featured one)
        const homeArticle = articles.find(article => article.featured);

        // NOTE COMMUNITY PLAYLISTS ESSENTIALLY
        // Now, categorize the articles based on playlistCategories
        const categorizedArticles = playlistCategories
          .filter(category => category.name === 'Move' || category.name === 'Thrive' || category.name === 'Create' || category.name === 'Care' || category.name === 'Discover' || category.name === 'Imagine') // Omit "Lotus" category
          .map(category => {
            const matchedArticles = articles.filter(article => article.topic === category.name);

            console.log(`[refreshUserData] Matched ${matchedArticles.length} articles for category ${category.name}`);
            console.log(matchedArticles.length);

            return {
              category: category.name,
              categoryImage: category.imageurl,
              articles: matchedArticles,
            };
          });

        // NOTE IS USER SUBSCRIBED
        const userIsAdmin = user?.user_role === 'admin';
        const userIsSubscribed = user?.subscription_tier === 'starter' || user?.subscription_tier === 'premium' || user?.user_role === 'admin'
        const userIsOnStarterPlan = user?.subscription_plan === 'starter' || user?.user_role === 'admin';
        const userIsOnPremiumPlan = user?.subscription_plan === 'premium' || user?.user_role === 'admin';
        const userIsNotSubscribed = user?.subscription_plan === 'blank';

        // const combinedLinerNotes = [...linerNotes, ...featuredArticles];

        await setStateAsync(setUserIsSubscribed, userIsSubscribed, 'backendData');
        console.log('promise to set user is subscribed.')

        await setStateAsync(setUserIsOnStarterPlan, userIsOnStarterPlan, 'backendData');
        console.log('promise to set user is on starter plan.')

        await setStateAsync(setUserIsOnPremiumPlan, userIsOnPremiumPlan, 'backendData');
        console.log('promise to set user is on premium plan.')

        await setStateAsync(setUserIsAdmin, userIsAdmin, 'backendData');
        console.log('promise to set user is admin.')

        await setStateAsync(setUserIsNotSubscribed, userIsNotSubscribed, 'backendData');
        console.log('promise to set user is not subscribed.')

        await setStateAsync(setUserArticles, userArticles, 'backendData');
        console.log('promise to set user articles.')

        await setStateAsync(setUserFavoriteArticles, userFavoriteArticles, 'backendData');
        console.log('promise to set user favorite articles.')

        await setStateAsync(setMostRecentUserArticles, userArticles.slice(0, 6), 'backendData');
        console.log('promise to set most recent 6 user articles.')

        await setStateAsync(setLinerNoteArticles, sortedLinerNotes, 'backendData');
        console.log('promise to set liner note articles.')

        await setStateAsync(setCommunityPlaylistArticles, categorizedArticles, 'backendData');
        console.log('promise to set community playlist articles.')

        await setStateAsync(setHomepageArticle, homeArticle, 'backendData');
        console.log('promise to set homepage article.')

        await setStateAsync(setUserArticleCount, userArticles.length, 'backendData');
        console.log('promise to set user articles initial length.')

        await setStateAsync(setUserStepCount, user.usersteps, 'backendData');
        console.log('promise to set user steps.')

        await setStateAsync(setUserUpvoteCount, user.upvotes, 'backendData');
        console.log('promise to set user upvotes.')

        await setStateAsync(setUserMinutesMeditated, user.user_meditation_minutes, 'backendData');
        console.log('promise to set user upvotes.')


      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const initializeData = async () => {

    await checkSignInStatus();

    setTimeout(() => {
    }, 1000);

    await refreshUserData();
  };

  const handleExpoUpdatesAndData = async () => {

    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        console.log('Update available, initializing fresh data...');
        await initializeData();
      }
    } catch (error) {

    }

  };



  // NOTE 🟨 - REFRESHING USER AND APP DATA WHEN NECESSARY
  useEffect(() => {

    initializeData();
    handleExpoUpdatesAndData();

    return () => {
      console.log('Unmounting...');
      setNeedsToRefresh?.(false)
    };
    
  }, [needsToRefresh]);

  // if (!revenueCatIsReady) {
  //   return <></>;
  //  }

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
      playlistCategories,
      setPlaylistCategories,
      mostRecentUserArticles,
      setMostRecentUserArticles,
      newlyGeneratedArticle,
      setNewlyGeneratedArticle,
      homepageArticle,
      setHomepageArticle,
      linerNoteArticles,
      setLinerNoteArticles,
      communityPlaylistArticles,
      setCommunityPlaylistArticles,
      userFavoriteArticles,
      setUserFavoriteArticles,
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
      setStartPlayingLinerNote,
      userMinutesMeditated,
      setUserMinutesMeditated,

      userIsSubscribed,
      setUserIsSubscribed,

      userIsOnPremiumPlan,
      setUserIsOnPremiumPlan,
      userIsOnStarterPlan,
      setUserIsOnStarterPlan,
      userIsAdmin,
      setUserIsAdmin,

      userIsNotSubscribed,
      setUserIsNotSubscribed,


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
