import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Updates from 'expo-updates'; import Constants from 'expo-constants';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import Purchases, { CustomerInfo, PurchasesError, PurchasesOfferings, PurchasesPackage, LOG_LEVEL, CustomerInfoUpdateListener } from "react-native-purchases";
import { useLotusUser } from './lotusUserContext';

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

  // const isPro = !!customerInfo?.entitlements.active.pro;

  useEffect(() => {
    const initialize = async () => {
      try {
        // Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        
        // if (Platform.OS === 'ios') {
        //   await Purchases.configure({ apiKey: process.env.REVENUECAT_API_KEY_IOS! });
        // } else {
        //   await Purchases.configure({ apiKey: process.env.REVENUECAT_API_KEY_ANDROID! });
        // }

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
    
    const listener = Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(info);
    }) as unknown as { remove: () => void };

    return () => {
      listener.remove();
    };
  }, []);

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
        } else {
          console.warn('[subscribeToLotus] No productIdentifier found in paywall result for optimistic update.');
        }
        // --- End Optimistic Update Step ---

        // This will trigger the full background sync (refreshUserData in LotusUserProvider)
        // console.log('[subscribeToLotus] Triggering full data refresh via setNeedsToRefresh(true).');
        setNeedsToRefresh?.(true);


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
        getPurchasesInstance
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = () => useContext(RevenueCatContext);
