import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

export const LotusStatsCard = ({ stats, containerStyle }: LotusStatsCardProps) => {
  return (
    <Animated.View 
      entering={FadeInUp.duration(300)} 
      style={[styles.container, containerStyle]}
    >
      <View style={styles.statsContainerColumnLayout}>
        {/* First cards */}
        <View style={styles.statsContainerRowLayout}>
            {stats.slice(1, 3).map((stat, index) => (
            <View key={index + 1} style={[styles.statItem, {width: '50%'}]}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <View style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                    {stat.iconName && 
                        <IconSymbol name={stat.iconName as IconSymbolName} size={24} color={colors.readioWhite} />
                    }
                    {stat.imgIconName &&
                        <Image style={{ width: 34, height: 34 }} source={ImageAssets[stat.imgIconName as keyof typeof ImageAssets]} resizeMode="contain"/>
                    }
                    <Text style={styles.statLabel}>
                      {stat.value === 1 ? stat.label.replace(/s$/i, '') : stat.label}
                    </Text>
                </View>
            </View>
            ))}
        </View>

        {stats.length > 0 && (
          <View key={0} style={styles.statItem}>
            <Text style={styles.statValue}>{stats[0].value}</Text>
            <View style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                    {stats[0].iconName && 
                        <IconSymbol name={stats[0].iconName as IconSymbolName} size={24} color={colors.readioWhite} />
                    }
                    {stats[0].imgIconName &&
                        <Image style={{ width: 34, height: 34 }} source={ImageAssets[stats[0].imgIconName as keyof typeof ImageAssets]} resizeMode="contain"/>
                    }
                    <Text style={styles.statLabel}>
                      {stats[0].value === 1 ? stats[0].label.replace(/s$/i, '') : stats[0].label}
                    </Text>
                </View>
          </View>
        )}
        
        {stats.length > 0 && (
          <View key={3} style={styles.statItem}>
            <Text style={styles.statValue}>{stats[3].value}</Text>
            <View style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                    {stats[3].iconName && 
                        <IconSymbol name={stats[0].iconName as IconSymbolName} size={24} color={colors.readioWhite} />
                    }
                    {stats[3].imgIconName &&
                        <Image style={{ width: 34, height: 34 }} source={ImageAssets[stats[3].imgIconName as keyof typeof ImageAssets]} resizeMode="contain"/>
                    }
                    <Text style={styles.statLabel}>
                      {stats[3].value === 1 ? stats[3].label.replace(/s$/i, '') : stats[3].label}
                    </Text>
                </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    // backgroundColor: 'red',
    borderRadius: 15,
  },
  statsContainerColumnLayout: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  statsContainerRowLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    position: 'relative',
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: colors.readioBlack,
    flex: 1,
    width: '100%',
    height: 150,
    padding: 20
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