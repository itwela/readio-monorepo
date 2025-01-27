import { useReadio } from '@/constants/readioContext';
import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import React, { useState, useRef, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';

const AnimatedModal = ({ visible, onClose, text, currently }: { visible: boolean; onClose: () => void; text: string, currently?: string }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const [v, setV] = useState(false)
  useEffect(() => {
    if (visible) {
      setV(true)
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      setV(false)
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={v}
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
          <View></View>
          <Text allowFontScaling={false} style={styles.modalText}>{text}</Text>


          {currently === 'done' && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text allowFontScaling={false} style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          )}
        
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalBackground: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
      padding: 30,
      paddingTop: '15%',
      // alignSelf: 'flex-start',
      // width: 350,
      // height: 200,
    //   alignSelf: 'center',
    },
    modalContainer: {
      width: 350,
      height: 100,
      backgroundColor: colors.readioWhite,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: "center",
      borderColor: '#ccc',
      borderWidth: 1,
    },
    modalText: {
      fontSize: 18,
      color: colors.readioBrown,
      fontFamily: readioBoldFont,
      fontWeight: 'bold',
      alignSelf: 'center'
    },
    closeButton: {
      marginTop: 10,
      padding: 10,
      backgroundColor: colors.readioOrange,
      borderRadius: 5,
      width: "20%",
      position: 'absolute',
      bottom: -20
    },
    closeButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
      fontSize: 16,
      textAlign: 'center',
    },
  });

export default AnimatedModal;