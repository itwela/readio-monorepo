import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ConnectionErrorBanner = () => (
  <View style={styles.errorBanner}>
    <Text style={styles.errorText}>We're having connection issues.</Text>
  </View>
);

const styles = StyleSheet.create({
  errorBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'red',
    padding: 10,
    zIndex: 1000,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ConnectionErrorBanner;
