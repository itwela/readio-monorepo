import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Updates from 'expo-updates'; import Constants from 'expo-constants';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import Purchases, { CustomerInfo, PurchasesError, PurchasesOfferings, PurchasesPackage, LOG_LEVEL, CustomerInfoUpdateListener } from "react-native-purchases";
import { useLotusUser } from './lotusUserContext';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

type RevenueCatContextType = {
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  restorePurchases: () => Promise<void>;
  subscribeToLotus: () => Promise<boolean>;
  debugLogAllRevenueCatProductIdentifiers: () => Promise<void>;
  getPurchasesInstance: () => Purchases | null;
  validateAndSyncSubscription: (customerInfo: CustomerInfo, skipOptimistic?: boolean) => Promise<void>;
};

type PurchaseResult = {
  success: boolean;
  error?: string;
};

const RevenueCatContext = createContext<RevenueCatContextType>({
  customerInfo: null,
  offerings: null,
  isLoading: true,
  refreshData: async () => {},
  purchasePackage: async () => ({ success: false }),
  restorePurchases: async () => {},
  subscribeToLotus: async () => false,
  debugLogAllRevenueCatProductIdentifiers: async () => {},
  getPurchasesInstance: () => null,
  validateAndSyncSubscription: async () => {},
});

interface RichPaywallResult {
  paywallResult: PAYWALL_RESULT;
  customerInfo?: CustomerInfo; // Optional, as it might not always be present
  productIdentifier?: string;  // Optional
  errorString?: string;        // Optional, for error cases
}


export const RevenueCatProvider = ({ children }: { children: React.ReactNode }) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {setNeedsToRefresh, user, setOptimisticSubscriptionPlan, isSubscriptionProcessing, setIsSubscriptionProcessing} = useLotusUser()
  
  // 🎯 Add Convex mutation for updating subscription plan
  const updateUserSubscriptionMutation = useMutation(api.users.updateUserSubscription);

  // 🎯 NEW: Debounce timer for subscription validation
  const [syncTimeoutRef, setSyncTimeoutRef] = useState<NodeJS.Timeout | null>(null);

  // 🎯 NEW: Debounced subscription validation function
  const debouncedValidateAndSync = (customerInfo: CustomerInfo, skipOptimistic = false) => {
    // Clear existing timeout
    if (syncTimeoutRef) {
      clearTimeout(syncTimeoutRef);
    }

    // Set new timeout
    const timeoutId = setTimeout(() => {
      validateAndSyncSubscription(customerInfo, skipOptimistic);
    }, 1000); // Wait 1 second before syncing

    setSyncTimeoutRef(timeoutId);
  };

  // 🎯 NEW: Subscription validation function - handles ongoing subscription sync
  const validateAndSyncSubscription = async (customerInfo: CustomerInfo, skipOptimistic = false) => {
    if (!user?._id) {
      console.warn('[validateAndSyncSubscription] No user ID available');
      return;
    }

    try {
      console.log('[validateAndSyncSubscription] Validating subscription status...');
      
      // Check for active entitlements in RevenueCat
      const activeEntitlements = customerInfo.entitlements.active;
      const hasActiveSubscription = Object.keys(activeEntitlements).length > 0;
      
      let currentPlan: 'starter' | 'premium' | 'blank' = 'blank';
      let articleGenerationLimit = 0; // Default free limit
      
      if (hasActiveSubscription) {
        // Look for your specific entitlements/products
        for (const entitlementKey in activeEntitlements) {
          const entitlement = activeEntitlements[entitlementKey];
          const productId = entitlement.productIdentifier;
          
          // console.log('[validateAndSyncSubscription] Active entitlement:', {
          //   key: entitlementKey,
          //   productId,
          //   isActive: entitlement.isActive,
          //   willRenew: entitlement.willRenew,
          //   expirationDate: entitlement.expirationDate
          // });
          
          // Map product IDs to subscription plans
          if (productId === 'lotus_awg_premium_tier_m' || productId === 'lotus_awg_premium_tier_y') {
            currentPlan = 'premium';
            articleGenerationLimit = 100;
          } else if (productId === 'lotus_awg_starter_tier_m' || productId === 'lotus_awg_starter_tier_y') {
            currentPlan = 'starter';
            articleGenerationLimit = 50;
          }
          
          // Take the highest plan if multiple active
          if (currentPlan === 'premium') break;
        }
      }
      
      console.log('[validateAndSyncSubscription] Determined plan:', {
        currentPlan,
        articleGenerationLimit,
        hasActiveSubscription
      });
      
      // Update optimistic state (UI feedback)
      if (!skipOptimistic) {
        setOptimisticSubscriptionPlan?.(currentPlan);
      }
      
      // Update Convex database
      await updateUserSubscriptionMutation({
        userId: user._id,
        subscription_plan: user?.user_role === 'admin' ? 'premium' : currentPlan,
        article_generation_runs_limit: user?.user_role === 'admin' ? 10000 : articleGenerationLimit,
        resetRuns: false, // Don't reset runs during validation, only on new purchases
      });
      
      console.log('[validateAndSyncSubscription] ✅ Successfully synced subscription to Convex');
      
    } catch (error) {
      console.error('[validateAndSyncSubscription] ❌ Failed to sync subscription:', error);
    }
  };

  // const isPro = !!customerInfo?.entitlements.active.pro;

  useEffect(() => {
    const initialize = async () => {
      try {

        const [customer, offerings] = await Promise.all([
          Purchases.getCustomerInfo(),
          Purchases.getOfferings(),
        ]);
        
        setCustomerInfo(customer);
        setOfferings(offerings);
      } catch (error) {
        console.error('RevenueCat initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
    
    let listener: { remove: () => void } | null = null;
    
    try {
      listener = Purchases.addCustomerInfoUpdateListener((info) => {
        setCustomerInfo(info);
        // 🎯 NEW: Use debounced validation to prevent rapid fire updates
        if (user?._id) {
          debouncedValidateAndSync(info, true); // Skip optimistic update since we're already updating
        }
      }) as unknown as { remove: () => void };
    } catch (error) {
      console.error('Failed to add RevenueCat listener:', error);
    }

    return () => {
      if (listener && typeof listener.remove === 'function') {
        try {
          listener.remove();
        } catch (error) {
          console.error('Error removing RevenueCat listener:', error);
        }
      }
      // Clean up timeout
      if (syncTimeoutRef) {
        clearTimeout(syncTimeoutRef);
      }
    };
  }, []);

  // 🎯 NEW: Validate subscription when user changes (login/logout scenarios)
  useEffect(() => {
    if (user?._id && customerInfo) {
      console.log('[RevenueCat] User changed, validating subscription...');
      debouncedValidateAndSync(customerInfo);
    }
  }, [user?._id]);

  const refreshData = async () => {
    try {
      const [customer, offerings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);
      setCustomerInfo(customer);
      setOfferings(offerings);
    } catch (error) {
      console.error('Failed to refresh RevenueCat data:', error);
    }
  };

  const purchasePackage = async (pkg: PurchasesPackage): Promise<PurchaseResult> => {
    try {
      const { customerInfo: purchaserInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(purchaserInfo);
      return { success: true };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        const err = error as { code: string, message: string, userCancelled?: boolean };
        // console.log('Purchase error:', err.code, err.message);
        return { 
          success: false,
          error: err.userCancelled ? 'Purchase cancelled' : 'Purchase failed'
        };
      }
      return { success: false, error: 'Unknown error occurred' };
    }
  };

  const restorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      setCustomerInfo(customerInfo);
    } catch (error) {
      console.error('Restore purchases failed:', error);
      throw error;
    }
  };

  const subscribeToLotus = async () => {

    const loginResult = Purchases.logIn(user?.user_db_id) // await Purchases.login

    // console.log('[subscribeToLotus] Login result:', loginResult)

    // Call presentPaywall and expect a potentially richer object than just the enum
    const paywallResultUntyped: any = await RevenueCatUI.presentPaywall({
      displayCloseButton: false, // As per your original code
    });

    // Coerce the result into a consistent RichPaywallResult structure
    const paywallResult: RichPaywallResult = (typeof paywallResultUntyped === 'object' && paywallResultUntyped !== null)
      ? paywallResultUntyped
      : { paywallResult: paywallResultUntyped as PAYWALL_RESULT };

    // console.log('[subscribeToLotus] Paywall presented. Full result object:', JSON.stringify(paywallResult, null, 2));

    switch (paywallResult.paywallResult) {
      case PAYWALL_RESULT.NOT_PRESENTED:
        // console.log('[subscribeToLotus] Paywall was not presented.');
        return false;
      case PAYWALL_RESULT.ERROR:
        console.error('[subscribeToLotus] Error presenting paywall:', paywallResult.errorString || 'Unknown error');
        return false;
      case PAYWALL_RESULT.CANCELLED:
        // console.log('[subscribeToLotus] User cancelled the paywall.');
        return false;
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        // console.log(paywallResult.paywallResult === PAYWALL_RESULT.PURCHASED
        //   ? '[subscribeToLotus] Purchase successful!'
        //   : '[subscribeToLotus] Restore successful!');

        if (paywallResult.customerInfo) {
          // console.log('[subscribeToLotus] CustomerInfo from paywall result:', JSON.stringify(paywallResult.customerInfo, null, 2));
        }

        const productIdentifier = paywallResult.productIdentifier;
        // console.log('[subscribeToLotus] Purchased/Restored Product Identifier from Paywall:', productIdentifier);

        // Set the processing state to true to show the modal
        setIsSubscriptionProcessing?.(true);

        // --- Optimistic Update Step ---
        if (productIdentifier) {
          let optimisticPlan: 'starter' | 'premium' | 'blank' = 'blank';
          
          // Mapping based on your provided product identifiers:
          if (productIdentifier === 'lotus_awg_premium_tier_m' || productIdentifier === 'lotus_awg_premium_tier_y') {
            optimisticPlan = 'premium';
          } else if (productIdentifier === 'lotus_awg_starter_tier_m' || productIdentifier === 'lotus_awg_starter_tier_y') {
            optimisticPlan = 'starter';
          }
          
          setOptimisticSubscriptionPlan?.(optimisticPlan);
          
          // 🎯 NEW: Directly update Convex with subscription plan
          try {
            if (user?._id && optimisticPlan !== 'blank') {
              console.log('[subscribeToLotus] Updating subscription in Convex:', {
                userId: user._id,
                plan: optimisticPlan,
                productIdentifier
              });
              
              // Set appropriate limits based on plan
              let articleGenerationLimit = 0; // Default free limit
              if (optimisticPlan === 'starter') {
                articleGenerationLimit = 50;
              } else if (optimisticPlan === 'premium') {
                articleGenerationLimit = 100;
              }
              
              await updateUserSubscriptionMutation({
                userId: user._id,
                subscription_plan: optimisticPlan,
                article_generation_runs_limit: articleGenerationLimit,
                resetRuns: true, // Reset their runs when they subscribe
              });
              
              console.log('[subscribeToLotus] ✅ Successfully updated subscription in Convex');
              setIsSubscriptionProcessing?.(false);

            } else {
              console.warn('[subscribeToLotus] Missing user ID or invalid plan for Convex update');
              setIsSubscriptionProcessing?.(false);
            }
          } catch (error) {
            console.error('[subscribeToLotus] ❌ Failed to update subscription in Convex:', error);
            setIsSubscriptionProcessing?.(false);
          }
        } else {
          console.warn('[subscribeToLotus] No productIdentifier found in paywall result for optimistic update.');
        }
        // --- End Optimistic Update Step ---

        // Only trigger refresh as backup if Convex update failed
        // console.log('[subscribeToLotus] Subscription update complete');

        return true;
      default:
        console.warn('[subscribeToLotus] Unknown paywall result:', paywallResult.paywallResult);
        return false;
    }
  };

  // NOTE - Debug Lotus
  const debugLogAllRevenueCatProductIdentifiers = async () => {
    try {
      // console.log("Fetching RevenueCat Offerings for debugging...");
      const offerings = await Purchases.getOfferings(); // Directly fetch offerings

      if (offerings && Object.keys(offerings.all).length > 0) {
        // console.log("--- All Available RevenueCat Product Identifiers ---");
        for (const offeringKey in offerings.all) {
          const offering = offerings.all[offeringKey];
          if (offering) {
            // console.log(`\nOffering: "${offering.serverDescription}" (ID: ${offering.identifier})`);
            if (offering.availablePackages.length > 0) {
              offering.availablePackages.forEach(pkg => {
                // console.log(
                //   `  - Package: "${pkg.product.title}" (Type: ${pkg.packageType}, ID: ${pkg.identifier})` +
                //   `\n    Product ID: ${pkg.product.identifier}` +
                //   `\n    Product Type: ${pkg.product.productCategory}` +
                //   `\n    Description: ${pkg.product.description}` +
                //   `\n    Price: ${pkg.product.priceString}`
                // );
              });
            } else {
              // console.log("    No available packages in this offering.");
            }
          }
        }
        // console.log("----------------------------------------------------");
      } else {
        // console.log("No RevenueCat offerings found or offerings.all is empty.");
      }
    } catch (error) {
      console.error("Error fetching or logging RevenueCat offerings:", error);
    }
  };

  const getPurchasesInstance = () => {
    if (!Purchases.isConfigured) {
      throw new Error('RevenueCat not initialized - call initializeRevenueCat first');
    }
    return Purchases;
  };

  return (
    <RevenueCatContext.Provider
      value={{
        customerInfo,
        offerings,
        isLoading,
        refreshData,
        purchasePackage,
        restorePurchases,
        subscribeToLotus,
        debugLogAllRevenueCatProductIdentifiers,
        getPurchasesInstance,
        validateAndSyncSubscription
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = () => useContext(RevenueCatContext);
