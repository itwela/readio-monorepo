import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface LotusPaywallBlurProps {
  children?: React.ReactNode;
  intensity?: number;
  tint?: "light" | "dark" | "default";
  style?: ViewStyle;
}

export const LotusPaywallBlur: React.FC<LotusPaywallBlurProps> = ({
  children,
  intensity = 26.18,
  tint = "dark",
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {children}
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[styles.blurOverlay]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});