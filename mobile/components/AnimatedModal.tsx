import React, { useState, useRef, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';

const AnimatedModal = ({ visible, onClose, text }: { visible: boolean; onClose: () => void; text: string }) => {
  const [showModal, setShowModal] = useState(visible);
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.spring(scaleValue, {
        toValue: 1,
        // duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowModal(false));
    }
  }, [visible]);

  if (!showModal) return null;

  return (
    <Modal
      transparent
      visible={showModal}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ scale: scaleValue }] },
          ]}
        >
          <Text style={styles.modalText}>{text}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalBackground: {
      flex: 1,
      justifyContent: "flex-end",
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
      padding: 30,
    //   width: 350,
    //   height: 200,
    //   alignSelf: 'center',
    },
    modalContainer: {
      width: 350,
      padding: 30,
      height: 200,
      backgroundColor: 'white',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: "space-between",
      borderColor: '#ccc',
      borderWidth: 1,
    },
    modalText: {
      fontSize: 18,
      marginBottom: 20,
    },
    closeButton: {
      marginTop: 10,
      padding: 10,
      backgroundColor: '#fc3c44',
      borderRadius: 5,
    },
    closeButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
  });

export default AnimatedModal;