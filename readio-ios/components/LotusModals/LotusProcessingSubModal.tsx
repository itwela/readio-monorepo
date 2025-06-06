import React, { useEffect, useState } from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { colors, readioBoldFont } from '@/constants/tokens'; // Assuming these are correctly defined
import { FontAwesome } from '@expo/vector-icons'; // For the checkmark icon
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext'; // Assuming resetAudio might come from here or be defined locally
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';
import { useRevenueCat } from '@/helpers/providers/RevenueCatProvider';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';


interface SubscriptionProcessingModalProps {
  visible: boolean;
}

const LotusSubscriptionProcessingModal: React.FC<SubscriptionProcessingModalProps> = ({ visible }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [subscriptionPlanWhenModalOpened, setSubscriptionPlanWhenModalOpened] = useState<string>('');
  const { user, isSubscriptionProcessing, setIsSubscriptionProcessing, userIsSubscribed, needsToRefresh, refreshUserData, setNeedsToRefresh, checkSignInStatus, newlyGeneratedArticle, setNewlyGeneratedArticle } = useLotusUser();
const {lightFeedback} = useLotusHaptic();
const { validateAndSyncSubscription, refreshData } = useRevenueCat();

  // 🎯 REAL-TIME subscription plan from Convex database
  const realtimeUserData = useQuery(
    api.users.getUserByDbId,
    user?.user_db_id ? { user_db_id: user.user_db_id } : "skip"
  );
  
  const currentPlan = realtimeUserData?.subscription_plan || 'blank';

  // Track the subscription plan when modal opens to detect changes
  useEffect(() => {
    if (visible && !subscriptionPlanWhenModalOpened) {
      const currentPlan = user?.subscription_plan || 'blank';
      setSubscriptionPlanWhenModalOpened(currentPlan);
      console.log('🔄 Modal opened - tracking subscription plan:', currentPlan);
      setShowSuccess(false);
    } else if (!visible) {
      setSubscriptionPlanWhenModalOpened('');
      setShowSuccess(false);
    }
  }, [visible, user?.subscription_plan]);

  // Monitor for subscription plan changes in real-time
  useEffect(() => {
    if (visible && subscriptionPlanWhenModalOpened) {
      const currentPlan = user?.subscription_plan || 'blank';
      
      // Check if the subscription plan has actually changed from when we started
      const hasSubscriptionUpdated = currentPlan !== subscriptionPlanWhenModalOpened && 
                                   currentPlan !== 'blank' && 
                                   subscriptionPlanWhenModalOpened === 'blank';
      
      console.log('🔍 Checking subscription update:', {
        currentPlan,
        originalPlan: subscriptionPlanWhenModalOpened,
        hasUpdated: hasSubscriptionUpdated
      });

      if (hasSubscriptionUpdated) {
        console.log('✅ Subscription plan updated! Showing success state...');
        setShowSuccess(true);
      }
    }
  }, [user?.subscription_plan, visible, subscriptionPlanWhenModalOpened]);

  // Fallback timer in case something goes wrong
  useEffect(() => {
    let fallbackTimer: NodeJS.Timeout;
    if (visible) {
      // Fallback after 15 seconds if no update detected
      fallbackTimer = setTimeout(() => {
        console.log('⚠️ Fallback timer triggered - showing success anyway');
        setShowSuccess(true);
      }, 15000);
    }

    return () => clearTimeout(fallbackTimer);
  }, [visible]);

  const handleSubscriptionModalClose = async () => {
    lightFeedback(); // Optional haptic feedback
    
    // 🔄 Sync subscription data from RevenueCat when closing
    try {
      console.log('🔄 Syncing subscription status from RevenueCat...');
      await refreshData(); // Refresh RevenueCat data first
      const customerInfo = await require('react-native-purchases').default.getCustomerInfo();
      await validateAndSyncSubscription(customerInfo);
      console.log('✅ Subscription status synced successfully');
    } catch (error) {
      console.error('⚠️ Failed to sync subscription status (non-critical):', error);
      // Don't block modal close if subscription sync fails
    }
    
    // checkSignInStatus() // This was commented out in your function

    setIsSubscriptionProcessing?.(false); // Hide the modal immediately

    
    // Reset the tracking state
    setSubscriptionPlanWhenModalOpened('');
    setShowSuccess(false);
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {
        // This is required for Android, but we don't want to allow manual closing.
        // unless it's through our explicit close button.
        // If showSuccess is true, allow closing via the button.
        if (showSuccess) {
          handleSubscriptionModalClose();
        }
      }}
    >
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          {!showSuccess ? (
            <>
              <ActivityIndicator size="large" color={colors.readioOrange} />
              <Text  allowFontScaling={false} style={styles.modalText}>Processing your subscription...</Text>
              <Text  allowFontScaling={false} style={[styles.modalText, { fontSize: 12, marginTop: 5, opacity: 0.7 }]}>
                Waiting for plan to update...
              </Text>
            </>
          ) : (
            <>
              <FontAwesome name="check-circle" size={60} color={colors.readioOrange} />
              <Text  allowFontScaling={false} style={[styles.modalText, { marginTop: 15 }]}>Subscription Updated!</Text>
              <Text  allowFontScaling={false} style={[styles.modalText, { fontSize: 12, marginTop: 5, opacity: 0.7 }]}>
                Welcome to {currentPlan === 'premium' ? 'Premium' : 'Starter'}!
              </Text>
              <Text  allowFontScaling={false} style={[styles.modalText, { fontSize: 10, marginTop: 10, opacity: 0.5 }]}>
                Still don't see a plan update after payment? Try closing the app and reopening.
              </Text>
              <Text  allowFontScaling={false} style={[styles.modalText, { fontSize: 8, marginTop: 10, opacity: 0.7, fontFamily: 'monospace' }]}>
                DEBUG: Optimistic: {user?.subscription_plan || 'blank'} | DB: {currentPlan}
              </Text>
              <Pressable style={styles.closeButton} onPress={handleSubscriptionModalClose}>
                <Text  allowFontScaling={false} style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.6)', // Semi-transparent background
  },
  activityIndicatorWrapper: {
    backgroundColor: colors.readioWhite, // Make sure lotusWhite is defined in your tokens
    height: 150,
    width: 250,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
  },
  modalText: {
    marginTop: 10,
    fontFamily: readioBoldFont, // Make sure readioBoldFont is defined
    fontSize: 16,
    color: colors.readioBlack, // Make sure lotusBlack is defined
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: colors.readioOrange,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  closeButtonText: {
    color: colors.readioWhite, // Assuming you have readioWhite
    fontFamily: readioBoldFont,
    fontSize: 16,
  },
});

export default LotusSubscriptionProcessingModal;
