import { useLotusTabBar } from "@/helpers/providers/lotusTabBarProvider";
import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "@/constants/tokens";

interface LotusIntroToPresenceProps {
  position?: 'top' | 'bottom';
  onIntersect?: (isIntersecting: boolean, direction: 'up' | 'down') => void;
  markerColor?: string;
  children?: React.ReactNode;
}

export default function LotusIntroToPresence({ 
  position = 'bottom',
  onIntersect,
  markerColor = colors.readioOrange,
  children 
}: LotusIntroToPresenceProps) {
  const { handleIntersection, scrollDirection } = useLotusTabBar();
  const viewRef = useRef<View>(null);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.measureInWindow((x, y, width, height) => {
        const isIntersecting = handleIntersection(y, position);
        onIntersect?.(isIntersecting, scrollDirection);
      });
    }
  }, [scrollDirection]);

  return (
    <>
      <View 
        ref={viewRef}
        style={[styles.viewmarker, { backgroundColor: markerColor }]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  viewmarker: {
    width: '100%',
    height: 1,
  },
});