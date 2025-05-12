import React, { useEffect, useState } from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { colors, readioBoldFont } from '@/constants/tokens'; // Assuming these are correctly defined
import { FontAwesome } from '@expo/vector-icons'; // For the checkmark icon
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext'; // Assuming resetAudio might come from here or be defined locally
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';


interface SubscriptionProcessingModalProps {
  visible: boolean;
}

const LotusSubscriptionProcessingModal: React.FC<SubscriptionProcessingModalProps> = ({ visible }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const { user, isSubscriptionProcessing, setIsSubscriptionProcessing, setUser, userIsSubscribed, userIsNotSubscribed, needsToRefresh, refreshUserData, setNeedsToRefresh, checkSignInStatus, newlyGeneratedArticle, setNewlyGeneratedArticle } = useLotusUser();
const {lightFeedback} = useLotusHaptic();
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible) {
      setShowSuccess(false); // Reset on visible
      timer = setTimeout(() => {
        setShowSuccess(true);
      }, 3000); // 3 seconds
    } else {
      setShowSuccess(false); // Ensure it's reset if modal is hidden externally
    }

    return () => clearTimeout(timer); // Cleanup timer
  }, [visible]);

  const handleSubscriptionModalClose = () => {
    lightFeedback(); // Optional haptic feedback
    
    setNeedsToRefresh?.(true);

    // checkSignInStatus() // This was commented out in your function

    setIsSubscriptionProcessing?.(false); // Hide the modal immediately

    // Timeout logic from your onRefresh function
    setTimeout(() => {
      setNeedsToRefresh?.(false);
    }, 1000); // Simulate an async operation

    setIsSubscriptionProcessing?.(false);
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
        handleSubscriptionModalClose();
      }}
    >
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          {!showSuccess ? (
            <>
              <ActivityIndicator size="large" color={colors.readioOrange} />
              <Text  allowFontScaling={false} style={styles.modalText}>Processing your subscription...</Text>
            </>
          ) : (
            <>
              <FontAwesome name="check-circle" size={60} color={colors.readioOrange} />
              <Text  allowFontScaling={false} style={[styles.modalText, { marginTop: 15 }]}>Subscription Updated!</Text>
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
