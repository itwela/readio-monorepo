import React, { useRef, useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import LotusGap from './LotusGap';
import { colors } from '@/constants/tokens';

interface LotusPickerProps {
  items: Array<{ label: string; value: any }>;
  selectedValue?: any;
  onValueChange?: (value: any) => void;
  itemHeight?: number;
  visibleItems?: number;
  textStyle?: any;
  style: React.CSSProperties;
}

export const LotusPicker: React.FC<LotusPickerProps> = ({
  items,
  selectedValue,
  onValueChange,
  itemHeight = 40,
  visibleItems = 5,
  textStyle,
  style,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
    // Initialize selectedIndex based on selectedValue
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const index = items.findIndex(item => item.value === selectedValue);
    return index !== -1 ? index : 0;
  });
  const windowHeight = Dimensions.get('window').height;

  // Calculate component dimensions
  const containerHeight = itemHeight * visibleItems;
  const totalHeight = itemHeight * items.length;
  const middleOffset = (containerHeight - itemHeight) / 2;

  useEffect(() => {
    const index = items.findIndex(item => item.value === selectedValue);
    if (index !== -1) {
      setSelectedIndex(index);
      // Add a small delay to ensure the scroll happens after modal animation
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: index * itemHeight,
          animated: false,
        });
      }, 100);
    }
  }, [selectedValue, items, itemHeight]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / itemHeight);
    
    if (index !== selectedIndex && index >= 0 && index < items.length) {
      setSelectedIndex(index);
      console.log('Selected index:', index);
    }
  };
  
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / itemHeight);
    
    // Snap to the nearest item
    if (index >= 0 && index < items.length) {
      scrollViewRef.current?.scrollTo({
        y: index * itemHeight,
        animated: true,
      });
      onValueChange?.(items[index].value);
    }
  };

  return (
    <View style={[styles.container, { height: containerHeight }, style as any]}>
        <View style={[styles.highlight, { height: itemHeight, top: middleOffset }]} />
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={itemHeight}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          contentContainerStyle={{
            paddingTop: middleOffset,
            paddingBottom: middleOffset,
            height: totalHeight + middleOffset * 2
          }}
        >
          {items.map((item, index) => (
            <View
              key={index}
              style={[styles.itemContainer, { height: itemHeight }]}
            >
              <Text
                style={[
                  styles.itemText,
                  textStyle,
                  index === selectedIndex && styles.selectedText,
                ]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  highlight: {
    position: 'absolute',
    width: '100%',
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: colors.readioOrange,
    borderRadius: 8,
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    opacity: 0.6,
  },
  selectedText: {
    opacity: 1,
    fontWeight: 'bold',
  },
});