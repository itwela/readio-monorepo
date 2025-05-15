import { IconSymbol } from "@/components/ui/IconSymbol";
import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { useLotusHaptic } from "@/helpers/providers/lotusHapticProvider";
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View, ScrollView, Image } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import LotusGap from "./LotusGap";
import { ImageAssets } from "@/constants/imageAssets";

const appMapItems = [
  {
    section: 'Tab Bar Features',
    items: [
      { 
        icon: <IconSymbol name="book.fill" size={24} color={colors.readioWhite} />,
        label: 'Library',
        description: 'Access audio literature/books and custom articles'
      },
      {
        icon: <Image style={{ width: 24, height: 24 }} source={ImageAssets.meditationIcon} resizeMode="contain" />  ,
        label: 'Meditation',
        description: 'Guided intros and ambient soundscapes'
      },
      {
        icon: <FontAwesome name="plus" size={24} color={colors.readioWhite} />,
        label: 'Create',
        description: 'Generate your own articles with a prompt'
      },
      {
        icon: <MaterialCommunityIcons name="music" size={24} color={colors.readioWhite} />,
        label: 'Music',
        description: 'Fit Hop, Nature sounds and Exclusive Music Drops'
      },
      {
        icon: <IconSymbol name="shoeprints.fill" size={24} color={colors.readioWhite} />,
        label: 'Giant Steps',
        description: 'Track your walking/running progress'
      }
    ]
  },
  {
    section: 'Header Navigation',
    items: [
      {
        icon: <IconSymbol name="house.fill" size={24} color={colors.readioWhite} />,
        label: 'Home',
        description: 'Return to the main dashboard'
      },
      {
        icon: <IconSymbol name="person.fill" size={24} color={colors.readioWhite} />,
        label: 'Profile',
        description: 'Account settings, stats and preferences',
        descriptionTick: 
        <>
        <IconSymbol name="drop.fill" size={14} color={colors.readioWhite}/>
        </>
      }
    ]
  }
];

export default function LotusAppMapModal({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  const { mediumFeedback } = useLotusHaptic();

  const handleClose = () => {
    mediumFeedback();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
        <LinearGradient
          colors={[colors.readioBrown, colors.readioBlack]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <Pressable
            onPress={handleClose}
            style={styles.closeButtonTop}
          >
            <FontAwesome name="times" size={24} color={colors.readioWhite} />
          </Pressable>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.title} allowFontScaling={false}>App Map</Text>
                        
            {appMapItems.map((section, index) => (
              <View key={section.section} style={styles.section}>
                <Text style={styles.sectionTitle} allowFontScaling={false}>{section.section}</Text>
                {section.items.map((item, itemIndex) => (
                  <View key={item.label} style={styles.itemContainer}>
                    <View style={styles.iconContainer}>
                      {item.icon}
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.itemLabel} allowFontScaling={false}>{item.label}</Text>
                      <View style={{flexDirection: 'column', gap: 5}}>
                        <Text style={styles.itemDescription} allowFontScaling={false}>{item.description}</Text>
                        {item.descriptionTick && (
                          <>
                            <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
                              {item.descriptionTick}
                              <Text allowFontScaling={false} style={styles.itemDescription}>Drink Water Reminders</Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
                {index < appMapItems.length - 1 && <LotusGap backgroundColor="transparent" gapNumber={20} />}
              </View>
            ))}
            

            <LotusGap backgroundColor="transparent" gapNumber={20} />
          </ScrollView>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  gradient: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20
  },
  content: {
    padding: 15,
  },
  title: {
    color: colors.readioWhite,
    fontSize: 24,
    fontFamily: readioBoldFont,
    textAlign: 'center',
    marginBottom: 25
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    color: colors.readioOrange,
    fontSize: 18,
    fontFamily: readioBoldFont,
    marginBottom: 15
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 15
  },
  textContainer: {
    flex: 1
  },
  itemLabel: {
    color: colors.readioWhite,
    fontSize: 16,
    fontFamily: readioRegularFont,
    marginBottom: 3
  },
  itemDescription: {
    color: colors.readioWhite,
    fontSize: 14,
    fontFamily: readioRegularFont,
    opacity: 0.8
  },
  closeButton: {
    backgroundColor: colors.readioOrange,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 25,
    alignItems: 'center'
  },
  closeButtonText: {
    color: colors.readioWhite,
    fontSize: 16,
    fontFamily: 'InterSemiBold'
  },
  closeButtonTop: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    padding: 10
  }
});
