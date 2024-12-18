import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

interface CustomSplashScreenProps {
  onFinish: () => void;
}

const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000); // Adjust the duration to match the GIF length
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <FastImage
        source={require('../assets/images/splash.gif')} // Path to your GIF file
        style={styles.gif}
        resizeMode={FastImage.resizeMode.contain}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  gif: {
    width: '80%',
    height: '80%',
  },
});

export default CustomSplashScreen;