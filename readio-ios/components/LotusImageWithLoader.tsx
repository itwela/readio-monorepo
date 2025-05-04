import { colors } from '@/constants/tokens';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  ImageProps,
  Animated as RNAnimated,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';

type Props = ImageProps & {
  loaderSize?: 'small' | 'large';
  loaderColor?: string;
  style?: any;
  useAnimated?: boolean;
  useSpinnerLoader?: boolean;
};

const LotusImageWithLoader: React.FC<Props> = ({
  loaderSize = 'large',
  loaderColor = colors.readioWhite,
  style,
  useAnimated = false,
  useSpinnerLoader = false,
  ...props
}) => {
  const [loading, setLoading] = useState(true);

  const renderLoader = () => {
    if (!loading) return null;

    if (useSpinnerLoader) {
      return (
        <ActivityIndicator
          size={loaderSize}
          color={loaderColor}
          style={styles.spinner}
        />
      );
    }

    return <ShimmerPlaceholder style={style} />;
  };

  const renderImage = () => {
    const imageProps = {
      ...props,
      style: [StyleSheet.absoluteFill, style],
      onLoadEnd: () => setLoading(false),
    };

    return useAnimated
      ? <Animated.Image entering={FadeInUp.duration(500)} {...imageProps} />
      : <Image {...imageProps} />;
  };

  return (
    <View style={[styles.container, style]}>
      {renderLoader()}
      {renderImage()}
    </View>
  );
};

// ✨ Shimmer Placeholder Loader
const ShimmerPlaceholder = ({ style }: { style?: ViewStyle }) => {
  const shimmerAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const borderRadius = style?.borderRadius || 12;

  return (
    <View style={[styles.shimmerContainer, style, { borderRadius }]}>
      <RNAnimated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </RNAnimated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  shimmerContainer: {
    backgroundColor: '#222',
    overflow: 'hidden',
  },
  spinner: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
});

export default LotusImageWithLoader;