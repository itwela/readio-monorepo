import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text, ScrollView } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { colors, fontSize, readioBoldFont, readioRegularFont } from '@/constants/tokens';

interface TabItem {
  icon: React.ReactNode;
  content: React.ReactNode;
  key: string;
}

interface LotusTabComponentProps {
  tabs: TabItem[];
  initialTabIndex?: number;
}

export const LotusTabComponent: React.FC<LotusTabComponentProps> = ({
  tabs,
  initialTabIndex = 0
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(initialTabIndex);
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTabIndex === index && styles.activeTabButton]}
            onPress={() => setActiveTabIndex(index)}
            activeOpacity={0.7}
          >
            {tab.icon}
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View
        entering={FadeInUp.duration(300)}
        exiting={FadeOutDown.duration(300)}
        style={styles.contentContainer}
      >
        <ScrollView>

          <Text style={styles.text}>
            {tabs[activeTabIndex].key}
          </Text>

          {tabs[activeTabIndex].content}

          <View style={{ height: 170, padding: 20, gap: 15, paddingBottom: 80, alignItems: 'center', justifyContent: 'center', }}>
            <Text style={{
              color: colors.readioWhite,
              fontFamily: readioRegularFont,
              fontSize: 16,
              textAlign: 'center',
              opacity: 0.5
            }}>
              Keep going! Every step, article, and moment of mindfulness brings you closer to your goals.
            </Text>
            <Text style={{
              color: colors.readioWhite,
              fontFamily: readioRegularFont,
              fontSize: 12,
              textAlign: 'center',
              opacity: 0.5
            }}>
              Swipe DOWN from the top to close.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    minHeight: 50,
    // backgroundColor: colors.readioBrown,
  },
  text: {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: readioBoldFont,
    color: colors.readioWhite,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.readioWhite}20`,
  },
  tabButton: {
    padding: 10,
    opacity: 0.5,
  },
  activeTabButton: {
    opacity: 1,
    borderBottomWidth: 2,
    borderBottomColor: colors.readioWhite,
  },
  contentContainer: {
    // flexGrow: 1,
    // height: '100%',
  },
});