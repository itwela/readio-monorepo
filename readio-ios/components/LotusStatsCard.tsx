import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { IconSymbol, IconSymbolName } from './ui/IconSymbol';
import { Image } from 'react-native';
import { ImageAssets } from '@/constants/imageAssets';

type StatItemProps = {
  value: number | string;
  label: string;
  iconName?: string;
  imgIconName?: any;
};

type LotusStatsCardProps = {
  stats: StatItemProps[];
  containerStyle?: object;
};

const screenWidth = Dimensions.get('window').width;
const itemWidth = (screenWidth - 40) / 2; // 40 accounts for padding and gap

export const LotusStatsCard = ({ stats, containerStyle }: LotusStatsCardProps) => {
  return (
    <Animated.View 
      entering={FadeInUp.duration(300)}   
      style={[styles.container, containerStyle]}
    >
      <View style={styles.gridContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            {stat.imgIconName &&
              <Image 
                style={styles.iconImage} 
                source={ImageAssets[stat.imgIconName as keyof typeof ImageAssets]} 
                resizeMode="contain"
              />
            }
            {stat.iconName && 
              <IconSymbol name={stat.iconName as IconSymbolName} size={24} color={colors.readioWhite} />
            }
            <Text style={styles.statValue}>{stat.value}</Text>
            <View style={styles.iconLabelContainer}>
              <Text style={styles.statLabel}>
                {stat.value === 1 ? stat.label.replace(/s$/i, '') : stat.label}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 15,
    padding: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    width: '100%',
  },
  statItem: {
    width: itemWidth,
    height: 170,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconImage: {
    width: 34,
    height: 34,
  },
  statValue: {
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
    fontSize: 35,
    textAlign: 'center',
  },
  statLabel: {
    color: colors.readioWhite,
    fontFamily: readioRegularFont,
    fontSize: 20,
    textAlign: 'center',
  },
});