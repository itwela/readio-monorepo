import React from 'react';
import { BlurView } from 'expo-blur';
import { StyleSheet, Text, View, ViewProps } from 'react-native';
import { colors } from '@/constants/tokens';
import { readioBoldFont } from '@/constants/tokens';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { Pressable } from 'react-native-gesture-handler';
import { useRevenueCat } from '@/helpers/providers/RevenueCatProvider';

type Props = {
  children: React.ReactNode;
  show: boolean;
  intensity?: number;
  tagPosition?: 'top-right' | 'top-left';
} & ViewProps;

export const LotusUpgradeBlur = ({
  children,
  show,
  intensity = 10,
  tagPosition = 'top-right',
  ...viewProps
}: Props) => {
  if (!show) return <>{children}</>;

  const { subscribeToLotus } = useRevenueCat();
  return (
    <Pressable onPress={subscribeToLotus} style={styles.container} {...viewProps}>
      {children}
      <BlurView intensity={intensity} style={StyleSheet.absoluteFill} tint="dark">
        <View style={[
          styles.upgradeTag,
          tagPosition === 'top-right' ? styles.topRight : styles.topLeft
        ]}>
          <Text   allowFontScaling={false} style={styles.upgradeText}>UPGRADE</Text>
        </View>
      </BlurView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  upgradeTag: {
    position: 'absolute',
    backgroundColor: colors.readioOrange,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  topRight: {
    top: 8,
    right: 8,
  },
  topLeft: {
    top: 8,
    left: 8,
  },
  upgradeText: {
    color: colors.readioWhite,
    fontSize: 12,
    fontFamily: readioBoldFont,
    letterSpacing: 1,
  },
});
