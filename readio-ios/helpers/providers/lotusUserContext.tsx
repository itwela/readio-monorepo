import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { LotusArticle } from '@/types/type';
import { tokenCache } from '@/lib/auth';
import sql from '@/helpers/neonClient';
import { setStateAsync } from '@/constants/utilityFunctions';
import { useLotusUtils } from './lotusUtilsContext';
import * as Updates from 'expo-updates'; import Constants from 'expo-constants';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import Purchases, { CustomerInfo, PurchasesError, PurchasesOfferings, PurchasesPackage, LOG_LEVEL, CustomerInfoUpdateListener } from "react-native-purchases";


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

  subscribeToLotus: () => Promise<boolean>;

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
  LotusUserContextType,
  RevenueCatContextType { };

interface RichPaywallResult {
  paywallResult: PAYWALL_RESULT;
  customerInfo?: CustomerInfo; // Optional, as it might not always be present
  productIdentifier?: string;  // Optional
  errorString?: string;        // Optional, for error cases
}

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

        // NOTE IS USER SUBSCRIBED
        const userIsAdmin = user?.user_role === 'admin';
        const userIsSubscribed = user?.subscription_tier === 'starter' || user?.subscription_tier === 'premium' || user?.user_role === 'admin'
        const userIsOnStarterPlan = user?.subscription_plan === 'starter' || user?.user_role === 'admin';
        const userIsOnPremiumPlan = user?.subscription_plan === 'premium' || user?.user_role === 'admin';
        const userIsNotSubscribed = user?.subscription_tier === 'blank';

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

  // NOTE - Subscribe to Lotus
  const subscribeToLotus = async () => {
    // Call presentPaywall and expect a potentially richer object than just the enum
    const paywallResultUntyped: any = await RevenueCatUI.presentPaywall({
      displayCloseButton: false, // As per your original code
    });

    // Coerce the result into a consistent RichPaywallResult structure
    const paywallResult: RichPaywallResult = (typeof paywallResultUntyped === 'object' && paywallResultUntyped !== null)
      ? paywallResultUntyped
      : { paywallResult: paywallResultUntyped as PAYWALL_RESULT };

    console.log('[subscribeToLotus] Paywall presented. Full result object:', JSON.stringify(paywallResult, null, 2));

    switch (paywallResult.paywallResult) {
      case PAYWALL_RESULT.NOT_PRESENTED:
        console.log('[subscribeToLotus] Paywall was not presented.');
        return false;
      case PAYWALL_RESULT.ERROR:
        console.error('[subscribeToLotus] Error presenting paywall:', paywallResult.errorString || 'Unknown error');
        return false;
      case PAYWALL_RESULT.CANCELLED:
        console.log('[subscribeToLotus] User cancelled the paywall.');
        return false;
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        console.log(paywallResult.paywallResult === PAYWALL_RESULT.PURCHASED
          ? '[subscribeToLotus] Purchase successful!'
          : '[subscribeToLotus] Restore successful!');

        if (paywallResult.customerInfo) {
          console.log('[subscribeToLotus] CustomerInfo from paywall result:', JSON.stringify(paywallResult.customerInfo, null, 2));
        }

        const productIdentifier = paywallResult.productIdentifier;

        if (productIdentifier && user?.id) {
          console.log('[subscribeToLotus] Purchased/Restored Product Identifier:', productIdentifier, 'for User ID:', user.id);

          let targetSubscriptionPlan: string | null = null;

          if (productIdentifier === 'lotus_awg_premium_tier_y' || productIdentifier === 'lotus_awg_premium_tier_m') {
            targetSubscriptionPlan = 'premium';
          } else if (productIdentifier === 'lotus_awg_starter_tier_y' || productIdentifier === 'lotus_awg_starter_tier_m') {
            targetSubscriptionPlan = 'starter';
          }

          if (targetSubscriptionPlan) {
            try {
              console.log(`[subscribeToLotus] Attempting direct DB update: User ID ${user.id}, Plan ${targetSubscriptionPlan}`);
              await sql`
                  UPDATE users
                  SET subscription_plan = ${targetSubscriptionPlan}
                  WHERE id = ${user.id}
                `;
              console.log(`[subscribeToLotus] Direct DB update successful for plan: ${targetSubscriptionPlan}`);
            } catch (dbError) {
              console.error(`[subscribeToLotus] Error during direct DB update:`, dbError);
              // Even if direct DB update fails, we still call setNeedsToRefresh
              // The LotusUserProvider will attempt to sync based on entitlements.
            }
          } else {
            console.warn(`[subscribeToLotus] Product identifier ${productIdentifier} does not map to a known subscription plan for direct update.`);
          }
        } else {
          if (!productIdentifier) console.warn('[subscribeToLotus] No productIdentifier in paywall result for DB update.');
          if (!user?.id) console.warn('[subscribeToLotus] No user ID available for DB update.');
        }

        // Log the purchased package details if available
        if (productIdentifier && packages) {
          const purchasedPackageObject = packages.find(p => p.product.identifier === productIdentifier);
          if (purchasedPackageObject) {
            console.log('[subscribeToLotus] Details of specific purchased/restored package:', JSON.stringify(purchasedPackageObject, null, 2));
          } else {
            console.warn('[subscribeToLotus] Could not find full package details in context for identifier:', productIdentifier);
          }
        }


        // CRITICAL STEP: This tells LotusUserProvider to refresh all user data.
        // This will:
        // 1. Fetch the latest CustomerInfo from RevenueCat.
        // 2. Call `updateCustomerInfo` in LotusUserProvider, which updates your DB based on *entitlements* (the ultimate source of truth).
        // 3. Fetch the updated user data (including the plan) from your DB.
        // 4. Update the user state in the context, re-rendering UI.
        if (setNeedsToRefresh) {
          console.log('[subscribeToLotus] Triggering data refresh via setNeedsToRefresh(true).');
          setNeedsToRefresh(true);
        } else {
          console.warn('[subscribeToLotus] setNeedsToRefresh is not available. UI might not update immediately or sync with entitlements.');
        }

        return true;
      default:
        console.warn('[subscribeToLotus] Unknown paywall result:', paywallResult.paywallResult);
        return false;
    }
  };

  // NOTE - Debug Lotus
  const debugLogAllRevenueCatProductIdentifiers = async () => {
    try {
      console.log("Fetching RevenueCat Offerings for debugging...");
      const offerings = await Purchases.getOfferings(); // Directly fetch offerings

      if (offerings && Object.keys(offerings.all).length > 0) {
        console.log("--- All Available RevenueCat Product Identifiers ---");
        for (const offeringKey in offerings.all) {
          const offering = offerings.all[offeringKey];
          if (offering) {
            console.log(`\nOffering: "${offering.serverDescription}" (ID: ${offering.identifier})`);
            if (offering.availablePackages.length > 0) {
              offering.availablePackages.forEach(pkg => {
                console.log(
                  `  - Package: "${pkg.product.title}" (Type: ${pkg.packageType}, ID: ${pkg.identifier})` +
                  `\n    Product ID: ${pkg.product.identifier}` +
                  `\n    Product Type: ${pkg.product.productCategory}` +
                  `\n    Description: ${pkg.product.description}` +
                  `\n    Price: ${pkg.product.priceString}`
                );
              });
            } else {
              console.log("    No available packages in this offering.");
            }
          }
        }
        console.log("----------------------------------------------------");
      } else {
        console.log("No RevenueCat offerings found or offerings.all is empty.");
      }
    } catch (error) {
      console.error("Error fetching or logging RevenueCat offerings:", error);
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
      subscribeToLotus,

      userIsOnPremiumPlan,
      setUserIsOnPremiumPlan,
      userIsOnStarterPlan,
      setUserIsOnStarterPlan,
      userIsAdmin,
      setUserIsAdmin,

      userIsNotSubscribed,
      setUserIsNotSubscribed

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