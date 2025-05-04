import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { LotusArticle } from '@/types/type';
import { tokenCache } from '@/lib/auth';
import sql from '@/helpers/neonClient';
import { setStateAsync } from '@/constants/utilityFunctions';
import { useLotusUtils } from './lotusUtilsContext';
import * as Updates from 'expo-updates';
import Purchases, { PurchasesOfferings, CustomerInfo, PurchasesPackage, LOG_LEVEL,
  CustomerInfoUpdateListener } from 'react-native-purchases';
import Constants from 'expo-constants';


// SECTION TYPES AND CONTEXT
interface RevenueCatContextType {
  packages: PurchasesPackage[];
  purchasePackage: (pkg: PurchasesPackage) => Promise<void>;
  restorePermissions: () => Promise<CustomerInfo>;
};
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

  // need to add subscription status
  // need to add coin balance
};

interface LotusSubscriptionAndDataInitType extends 
LotusUserContextType, 
RevenueCatContextType 
{};

const LotusUserContext = createContext<LotusSubscriptionAndDataInitType | null>(null);

export const LotusUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  // SECTION RevenueCat ----

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [revenueCatIsReady, setRevenueCatIsReady] = useState(false);

  const productIdentifiers = [
    'lotus_awg_starter_tier_m',
    'lotus_awg_starter_tier_y',
    'lotus_awg_premium_tier_m',
    'lotus_awg_premium_tier_y',
    'lotus_awg_5_coins',
    'lotus_awg_10_coins',
    'lotus_awg_20_coins',
  ];

  const restorePermissions = async () => {
    try {
      const restoredCustomerInfo = await Purchases.restorePurchases();
      return restoredCustomerInfo;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return {} as CustomerInfo;
    }
  };

  // --- Make sure purchasePackage passes both customerInfo and pkg ---
  const purchasePackage = async (pkg: PurchasesPackage) => {
    try {
      console.log(`[purchasePackage] Attempting to purchase: ${pkg.product.identifier}`);
      // *** Important: Get customerInfo from the purchase result ***
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      console.log(`[purchasePackage] Purchase successful for ${pkg.product.identifier}. CustomerInfo:`, customerInfo);

      // Call updateCustomerInfo immediately after successful purchase
      await updateCustomerInfo(customerInfo, pkg); // Pass both

    } catch (e: any) {
      if (!e.userCancelled) {
        console.error('[purchasePackage] Error purchasing package:', e);
        alert(`Purchase failed: ${e.message}`);
      } else {
        console.log('[purchasePackage] User cancelled the purchase.');
      }
    }
  };

  // NOTE - Updates customer info in my database.
  const updateCustomerInfo = async (customerInfo: CustomerInfo, pkg?: PurchasesPackage, INSIDE_OF_REFRESH_USER_FUNCTION: boolean = false) => {
    // Ensure we have a user context to update the database
    if (!user?.id) {
      console.warn('[updateCustomerInfo] User context not available. Cannot update database.');
      return;
    }

    console.log('[updateCustomerInfo] Received customerInfo:', customerInfo);
    if (pkg) {
      console.log('[updateCustomerInfo] Direct purchase detected:', pkg.product.identifier);
    }

    let newSubscriptionPlan = 'blank'; // Start with the default/base plan
    let coinsToAdd = 0;

    // --- 1. Determine Subscription Plan from Entitlements (Source of Truth) ---
    const entitlements = customerInfo.entitlements.active;

    if (entitlements['Premium Features'] !== undefined) {
      newSubscriptionPlan = 'premium';
      console.log('[updateCustomerInfo] Active Premium entitlement found. New Subscription Plan:', newSubscriptionPlan);
    } else if (entitlements['Starter Features'] !== undefined) {
      newSubscriptionPlan = 'starter';
      console.log('[updateCustomerInfo] Active Starter entitlement found. New Subscription Plan:', newSubscriptionPlan);
    } else {
      console.log('[updateCustomerInfo] No active paid entitlements found. Plan set to,' + newSubscriptionPlan);
    }

    // --- 2. This runs when a user directly buys something. Determine Coins Added (Only for Direct Consumable Purchase) ---
    if (pkg) {
      const identifier = pkg.product.identifier;
      switch (identifier) {
        case productIdentifiers[4]: // 5 Coins
          coinsToAdd = 5;
          console.log(`[updateCustomerInfo] User purchased 5 coins.`);
          break;
        case productIdentifiers[5]: // 10 Coins
          coinsToAdd = 10;
          console.log(`[updateCustomerInfo] User purchased 10 coins.`);
          break;
        case productIdentifiers[6]: // 20 Coins
          coinsToAdd = 20;
          console.log(`[updateCustomerInfo] User purchased 20 coins.`);
          break;
        // No need to handle subscription identifiers here, entitlements cover it.
        default:
          if (!identifier.includes('_tier_')) { // Avoid warning for subscription purchases
            console.warn(`[updateCustomerInfo] Unhandled non-subscription product identifier during purchase: ${identifier}`);
          }
      }
    }

    // --- 3. Perform Database Updates ---
    try {

      // Update subscription plan if it has changed from the current user state
      if (newSubscriptionPlan !== user.subscription_plan) {
        console.log(`[updateCustomerInfo] Updating DB: Setting subscription_plan to ${newSubscriptionPlan} for user ID ${user.id}`);
        await sql`
          UPDATE users
          SET subscription_plan = ${newSubscriptionPlan}
          WHERE id = ${user.id}
        `;
      } else {
        console.log(`[updateCustomerInfo] Subscription plan has not changed. No update needed for user ID ${user.id}`);
      }

      // Add coins if purchased
      if (coinsToAdd > 0) {
        console.log(`[updateCustomerInfo] Updating DB: Adding ${coinsToAdd} coins for user ID ${user.id}`);
        // Use a single query to update and get the new balance if your DB supports RETURNING
        // Otherwise, you might need a separate SELECT or just update local state optimistically
        const result = await sql`
          UPDATE users
          SET coin_balance = COALESCE(coin_balance, 0) + ${coinsToAdd}
          WHERE id = ${user.id}
          RETURNING coin_balance
        `;
        // Update local state immediately
        const newCoinBalance = result[0]?.coin_balance ?? (user.coin_balance || 0) + coinsToAdd;
      } else {
        console.log(`[updateCustomerInfo] No coins added. No update needed for user ID ${user.id}`);
      }

    } catch (dbError) {
      console.error('[updateCustomerInfo] Error updating database:', dbError);
      // Consider adding user-facing error handling here (e.g., alert)
    }
  };


  const [user, setUser] = useState<any>();
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [hasAccount, setHasAccount] = useState<boolean>(false);
  const [needsToRefresh, setNeedsToRefresh] = useState<boolean>(false);
  const [userArticles, setUserArticles] = useState<LotusArticle[]>([]);
  const [userFavoriteArticles, setUserFavoriteArticles] = useState<LotusArticle[]>([]);
  const [mostRecentUserArticles, setMostRecentUserArticles] = useState<LotusArticle[]>([]);
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
  const {masterDebugMode} = useLotusUtils()

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
      await setStateAsync(setNeedsToRefresh, false, 'backendData');
    }
  };

  const refreshUserData = async () => {
    try {

      const savedHash = await tokenCache.getToken(masterDebugMode ? 'DebuglotusJWTAlwaysGrowingToken' : 'lotusJWTAlwaysGrowingToken');

      if (savedHash && user) {

        const customerInfo = await Purchases.getCustomerInfo();
        console.log(`[refreshUserData] Received CustomerInfo. Processing with updateCustomerInfo...`);

        // NOTE 🟪 - Call your existing function to check entitlements and update DB/state if needed.
        // Pass only customerInfo; pkg is not relevant for a general refresh.
        await updateCustomerInfo(customerInfo, undefined, true);

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
        

        // const combinedLinerNotes = [...linerNotes, ...featuredArticles];

        await setStateAsync(setUserArticles, userArticles, 'backendData');
        console.log('promise to set user articles.')

        await setStateAsync(setUserFavoriteArticles, userFavoriteArticles, 'backendData');
        console.log('promise to set user favorite articles.')

        await setStateAsync(setMostRecentUserArticles, userArticles.slice(0, 6), 'backendData');
        console.log('promise to set most recent 6 user articles.')

        await setStateAsync(setLinerNoteArticles, sortedLinerNotes, 'backendData');
        console.log('promise to set liner note articles.', linerNotes[0])

        await setStateAsync(setCommunityPlaylistArticles, categorizedArticles, 'backendData');
        console.log('promise to set community playlist articles.')

        await setStateAsync(setHomepageArticle, homeArticle, 'backendData');
        console.log('promise to set homepage article.')

        await setStateAsync(setUserArticleCount, articles.length, 'backendData');
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


  // NOTE 🟨 - This is the useEffect that will update the app when the customer info changes,
  useEffect(() => {
    // This function returns an object that knows how to remove itself
    const listener = Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      console.log('\n\n\n[RevenueCat] Customer info update received via listener:', customerInfo);
      updateCustomerInfo(customerInfo, undefined, false);
    });
 
    // --- Cleanup function ---
    return () => {
      // --- This is the intended way to remove THIS specific listener ---
      // We need to tell TypeScript to trust us here if the types are wrong
      if (typeof (listener as any).remove === 'function') {
         (listener as any).remove(); // Use type assertion 'any' or a custom interface
         console.log('[RevenueCat] Removed CustomerInfoUpdateListener via listener object.');
      } else {
         console.warn('[RevenueCat] Listener object or remove method not available for cleanup.');
      }
    };

  }, []); // <-- Empty dependency array is correct!

  // NOTE 🟨 - REFRESHING USER AND APP DATA WHEN NECESSARY
  useEffect(() => {

    initializeData();
    handleExpoUpdatesAndData();

  }, [needsToRefresh]);

  // if (!revenueCatIsReady) {
  //   return <></>;
  //  }

  return (
    <LotusUserContext.Provider value={{

      purchasePackage,
      packages,
      restorePermissions,

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