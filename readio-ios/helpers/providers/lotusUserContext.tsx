import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { LotusArticle } from '@/types/type';
import { tokenCache } from '@/lib/auth';
import sql from '@/helpers/neonClient';
import { useLotusUtils } from './lotusUtilsContext';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { setStateAsync } from '@/constants/utilityFunctions';
import TrackPlayer from 'react-native-track-player';
import { useLastActiveTrack } from '@/hooks/useLastActiveTrack';
import { router } from 'expo-router';
import { s3 } from '@/helpers/s3Client';


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

  article_generation_runs?: number;
  article_generation_runs_limit?: number;
  article_runs_last_reset_at?: Date | null; // For the monthly reset

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
  setOptimisticSubscriptionPlan?: (plan: 'starter' | 'premium' | 'blank') => void;

  isSubscriptionProcessing?: boolean;
  setIsSubscriptionProcessing?: (value: boolean) => void;

  handleDeleteReadio?: (id: number) => Promise<void>;
};

interface LotusSubscriptionAndDataInitType extends
  LotusUserContextType { };

interface SubscriptionResult {
  success: boolean;
  plan?: 'starter' | 'premium';
  coins?: number;
  error?: string;
}

const LotusUserContext = createContext<LotusSubscriptionAndDataInitType | null>(null);

export const LotusUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const ARTICLE_LIMIT_BLANK = 0;
  const ARTICLE_LIMIT_STARTER = 50; // Or -1 for truly unlimited
  const ARTICLE_LIMIT_PREMIUM = 100; // Or -1 for truly unlimited
  const ARTICLE_LIMIT_ADMIN = 1000000; // -1 can represent unlimited

  // SECTION Subscription Management ----
  const [subscriptionStatus, setSubscriptionStatus] = useState<'starter' | 'premium' | 'none'>('none');
  const [coinBalance, setCoinBalance] = useState(0);

  const [user, setUser] = useState<any>();
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [hasAccount, setHasAccount] = useState<boolean>(false);
  const [needsToRefresh, setNeedsToRefresh] = useState<boolean>(false);
  const [userArticles, setUserArticles] = useState<LotusArticle[]>([]);
  const [userArticlesSafe, setUserArticlesSafe] = useState<LotusArticle[]>([]);
  const [userArticlesNSFW, setUserArticlesNSFW] = useState<LotusArticle[]>([]);
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

  const [article_generation_runs, setArticleGenerationRuns] = useState(0);
  const [article_generation_runs_limit, setArticleGenerationRunsLimit] = useState(0);
  const [article_runs_last_reset_at, setArticleRunsLastResetAt] = useState<any>();

  const [userIsNotSubscribed, setUserIsNotSubscribed] = useState<boolean>(false);

  const [isSubscriptionProcessing, setIsSubscriptionProcessing] = useState<boolean>(false);

  const { clearLastActiveTrack, setLastActiveTrack } = useLastActiveTrack();

  const setOptimisticSubscriptionPlan = (plan: 'starter' | 'premium' | 'blank') => {
    if (user) {
      console.log(`[LotusUserProvider] Optimistically setting plan to: ${plan}`);
      setUser((prevUser: any) => ({
        ...prevUser,
        subscription_plan: plan,
      }));

      // Update boolean flags optimistically based on the new plan
      // Assumes user.user_role is already correctly set and doesn't change with subscription plan optimistically
      const isAdmin = user?.user_role === 'admin';
      setUserIsSubscribed(plan === 'starter' || plan === 'premium' || isAdmin);
      setUserIsOnStarterPlan(plan === 'starter' || isAdmin);
      setUserIsOnPremiumPlan(plan === 'premium' || isAdmin);
      setUserIsNotSubscribed(plan === 'blank' && !isAdmin);
    } else {
      console.warn('[LotusUserProvider] setOptimisticSubscriptionPlan called but no user is set.');
    }
  };




  const checkSignInStatus = async () => {


    try {
      const savedHash = await tokenCache.getToken(masterDebugMode ? 'DebuglotusJWTAlwaysGrowingToken' : 'lotusJWTAlwaysGrowingToken');

      if (savedHash) {
        // im just going to set the user here. this serves the purpose so i can refresh data when ever i want
        const userInfo = await sql`SELECT * FROM users WHERE jwt = ${savedHash}`;
        if (userInfo && userInfo[0]) {

          // NOTE SETTING ARTICLE GENERATION LIMIT INITIALLY FROM DB
          // Determine initial limit if not set, based on plan or admin status
          let initialLimit = userInfo[0]?.article_generation_runs_limit;
          // If limit is 0 (our new default) or null/undefined, set it based on plan
          if (initialLimit === 0 || initialLimit === null || initialLimit === undefined) {
            if (userInfo[0].user_role === 'admin') {
              initialLimit = ARTICLE_LIMIT_ADMIN;
            } else if (userInfo[0].subscription_plan === 'premium') {
              initialLimit = ARTICLE_LIMIT_PREMIUM;
            } else if (userInfo[0].subscription_plan === 'starter') {
              initialLimit = ARTICLE_LIMIT_STARTER;
            } else {
              initialLimit = ARTICLE_LIMIT_BLANK;
            }
          }

          // If the calculated initialLimit is different from what's in the DB, update the DB.
          if (userInfo[0]?.article_generation_runs_limit !== initialLimit) {
            console.log(`[checkSignInStatus] Mismatch in DB limit (${userInfo[0]?.article_generation_runs_limit}) and calculated initialLimit (${initialLimit}). Updating DB for user ID: ${userInfo[0].id}`);
            try {
              await sql`UPDATE users SET article_generation_runs_limit = ${initialLimit} WHERE id = ${userInfo[0].id}`;
              console.log(`[checkSignInStatus] Successfully updated article_generation_runs_limit in DB to ${initialLimit} for user ID: ${userInfo[0].id}`);
            } catch (dbUpdateError) {
              console.error(`[checkSignInStatus] Failed to update article_generation_runs_limit in DB for user ID: ${userInfo[0].id}`, dbUpdateError);
              // Decide if you want to proceed with potentially inconsistent local state or handle error differently
            }
          }

          // set user
          await setStateAsync(setUser, {
            ...userInfo[0],
            article_generation_runs_limit: initialLimit, // Ensure limit is set
            article_runs_last_reset_at: userInfo[0].article_runs_last_reset_at ? new Date(userInfo[0].article_runs_last_reset_at) : null,
          }, 'backendData');
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
        // NOTE --- Start: Sync with RevenueCat Entitlements ---

        try { // Outer try for the entire RevenueCat sync and DB update block
          try { // Inner try for specific RC and DB operations
            console.log('[refreshUserData] Fetching latest CustomerInfo from RevenueCat...');
            const customerInfo = await Purchases.getCustomerInfo();
            const entitlements = customerInfo?.entitlements?.active; // Added safe navigation

            let planFromRevenueCat: 'premium' | 'starter' | 'blank' | 'admin' = 'blank';

            if (entitlements && entitlements['Premium Features']) { // Check entitlements exists
              planFromRevenueCat = 'premium';
            } else if (entitlements && entitlements['Starter Features']) { // Check entitlements exists
              planFromRevenueCat = 'starter';
            }

            let planToSetInDb: 'premium' | 'starter' | 'blank' | 'admin';
            let newLimitToSet: number;

            if (user && user.user_role === 'admin') {
              // If user is admin, set their plan to 'premium' for limit purposes,
              // and use the admin-specific article limit.
              // Their actual user_role in the DB remains 'admin'.
              planToSetInDb = 'premium'; // Treat admin as having premium plan benefits
              newLimitToSet = ARTICLE_LIMIT_ADMIN;
              console.log(`[refreshUserData] User is admin. Plan will be maintained as: ${planToSetInDb}, Limit set to: ${newLimitToSet}`);
            } else {
              // For non-admins, determine limit based on RevenueCat plan
              planToSetInDb = planFromRevenueCat; // Use plan directly from RevenueCat
              if (planFromRevenueCat === 'premium') {
                newLimitToSet = ARTICLE_LIMIT_PREMIUM;
              } else if (planFromRevenueCat === 'starter') {
                newLimitToSet = ARTICLE_LIMIT_STARTER;
              } else { // 'blank'
                newLimitToSet = ARTICLE_LIMIT_BLANK;
              }
            }

            console.log(`[refreshUserData] Plan from RevenueCat entitlements: ${planFromRevenueCat}`);
            console.log(`[refreshUserData] Current plan in local state (before potential update): ${user?.subscription_plan}`);
            console.log(`[refreshUserData] Plan to set in DB: ${planToSetInDb}`);
            console.log(`[refreshUserData] Limit to set in DB: ${newLimitToSet}`);

            // Update DB if the determined plan or limit differs from the user's current local state.
            // For non-admins, planToSetInDb comes from RevenueCat.
            if (user && typeof user.id !== 'undefined' && 
                (planToSetInDb !== user.subscription_plan || newLimitToSet !== user.article_generation_runs_limit)) {
              
              console.log(`[refreshUserData] Mismatch or necessary update. DB Plan: ${user.subscription_plan} -> ${planToSetInDb}. DB Limit: ${user.article_generation_runs_limit} -> ${newLimitToSet}. User ID: ${user.id}`);

              // For non-admins, reset runs if their plan from RevenueCat is changing to a subscription.
              // Admins are not affected by this specific run reset logic because their planToSetInDb is 'premium'
              // and this condition checks against planFromRevenueCat for non-admins.
              const shouldResetRunsForNonAdmin = 
                user.user_role !== 'admin' &&
                user.subscription_plan !== planFromRevenueCat && // Compare with RC plan for non-admins
                (planFromRevenueCat === 'starter' || planFromRevenueCat === 'premium');

              if (shouldResetRunsForNonAdmin) {
                  await sql`
                    UPDATE users 
                    SET subscription_plan = ${planToSetInDb},
                        article_generation_runs_limit = ${newLimitToSet},
                        article_generation_runs = 0, 
                        article_runs_last_reset_at = NOW()
                    WHERE id = ${user.id}
                  `;
              } else { // Handles admins, or non-admins whose plan isn't changing to a new subscription
                  await sql`
                    UPDATE users 
                    SET subscription_plan = ${planToSetInDb}, 
                        article_generation_runs_limit = ${newLimitToSet}
                    WHERE id = ${user.id}
                  `;
              }
              console.log(`[refreshUserData] Database successfully updated for plan/limit for user ID: ${user.id}`);
            }

          } catch (rcError) {
            console.error('[refreshUserData] Error during RevenueCat API call or DB update for plan/limit:', rcError);
            // If this error is critical, you might want to re-throw it or return to stop further processing.
            // For example: throw rcError;
          }
        } catch (overallErrorInRCSyncBlock) {
          console.error('[refreshUserData] Broader error occurred within the RevenueCat sync/update section:', overallErrorInRCSyncBlock);
          // Decide if you want to halt refresh or continue with potentially stale plan data
        }

        // STUB --- End: Sync with RevenueCat Entitlements ---

        // |
        // |
        // |

        // NOTE --- Start: Monthly Reset Logic for Article Generation Runs ---
        // Fetch the latest user data again, as plan/limit/reset_date might have just been updated by RC sync
        const currentDbUserData = await sql`SELECT article_generation_runs_limit, article_runs_last_reset_at FROM users WHERE id = ${user.id}`;
        const lastResetDate = currentDbUserData[0]?.article_runs_last_reset_at ? new Date(currentDbUserData[0].article_runs_last_reset_at) : null;

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        if (user.article_generation_runs_limit !== ARTICLE_LIMIT_ADMIN && (!lastResetDate || lastResetDate <= oneMonthAgo)) {
          // Don't reset for admins unless you want to, or if their limit is not effectively unlimited.
          // Reset if no last reset date OR if last reset date is more than a month ago.
          console.log(`[refreshUserData] Monthly article generation reset due for user ID: ${user.id}. Last reset: ${lastResetDate}`);
          await sql`
            UPDATE users
            SET article_generation_runs = 0, article_runs_last_reset_at = NOW(), stic_voice_usage_seconds = 0
            WHERE id = ${user.id}
          `;
          console.log(`[refreshUserData] Monthly reset complete for user ID: ${user.id}`);
        }
        // STUB --- End: Monthly Reset Logic ---


        // NOTE - Now, refresh user data directly from database (which includes the potentially updated plan)
        const userData = await sql`SELECT * FROM users WHERE id = ${user.id}`;
        if (userData?.[0]) {
          setUser((prev: any) => ({
            ...prev,
            subscription_plan: userData[0].subscription_plan,
            coin_balance: userData[0].coin_balance,
            article_generation_runs: userData[0].article_generation_runs,
            article_generation_runs_limit: userData[0].article_generation_runs_limit,
            article_runs_last_reset_at: userData[0].article_runs_last_reset_at ? new Date(userData[0].article_runs_last_reset_at) : null,
          }));
        }

        // NOTE -- At this point, `user.subscription_plan` in the local state (if updated by setUser above)
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

        const articlesSafe = articles.filter(article => article.nsfw === false);
        const articlesNSFW = articles.filter(article => article.nsfw === true);

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
        console.log('userFavoriteArticles')



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
            const matchedArticles = articlesSafe.filter(article => article.topic === category.name);

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

  const handleDeleteReadio = async (id: number) => {
		const s3Key = `${id}.mp3`;  
		s3.deleteObject({
			Bucket: "readio-audio-files",  // Your S3 bucket name
			Key: s3Key,
		}, (err, data) => {

			if (err) {
				console.error(err);
			} else {

				console.log("S3 object deleted: ", s3Key);

				console.log("readio deleted")

			}
		});
		s3.deleteObject({
			Bucket: "lotus-image-files",  // Your S3 bucket name
			Key: s3Key,
		}, (err, data) => {

			if (err) {
				console.error(err);
			} else {

				console.log("S3 object deleted: ", s3Key);

			// 	retryWithBackoff(async () => {


			// 	fetchAPI(`/(api)/del/deleteReadio`, {
			// 		method: "POST",
			// 		body: JSON.stringify({
			// 			readioId: id,
			// 			clerkId: user?.id
			// 		}),
			// 	});

			// }, 3, 1000)

				console.log("readio deleted")

			}
		});
		try {
			await sql`
			DELETE FROM readios WHERE id = ${id}
			`.then(() => {
				console.log('Record deleted successfully');
			}).catch((error) => {
				console.error('Error deleting record:', error);
			});
			console.log('success')
		} catch (error) {
			console.log('fail')
		}
		if (setNeedsToRefresh) {
			await setStateAsync(setNeedsToRefresh, true, 'backendData')
		}

		TrackPlayer.reset();
		clearLastActiveTrack?.();
		router.back();

	}



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

      article_generation_runs,
      article_generation_runs_limit,
      article_runs_last_reset_at,

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
      setOptimisticSubscriptionPlan,

      isSubscriptionProcessing,
      setIsSubscriptionProcessing,

      handleDeleteReadio,

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
