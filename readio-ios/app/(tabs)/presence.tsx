import LotusHeader from "@/components/LotusHeader";
import { colors, readioBoldFont, utilStyle } from "@/constants/tokens";
import React from "react";
import { View, StyleSheet, FlatList, Pressable, Text, Modal } from "react-native";
import Animated, { FadeInDown, FadeInUp, FadeOutDown } from "react-native-reanimated";
import { ResizeMode, Video } from 'expo-av';
import { getLocalImageUri, ImageAssets } from "@/constants/imageAssets";
import { LinearGradient } from 'expo-linear-gradient';
import { useLotusPresence } from "@/helpers/providers/lotusPresenceContext";
import { utilsStyles } from "@/styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { LotusArticleModal } from "@/components/LotusArticleModal";

export default function LotusPresencePage() {

  const {} = useLotusPresence()

  const [selectedModal, setSelectedModal] = React.useState<'music' | 'duration' | 'lessons' | null>(null);
  // Add these dummy data structures
  const sampleTracks = [
    { id: '1', title: 'Forest Stream', duration: '15:00' },
    { id: '2', title: 'Zen Garden', duration: '30:00' },
    { id: '3', title: 'Mountain Winds', duration: '45:00' },
  ];

  const sampleLessons = [
    { id: 'l1', title: 'Basic Breathing', level: 'Beginner' },
    { id: 'l2', title: 'Mindfulness 101', level: 'Intermediate' },
    { id: 'l3', title: 'Advanced Focus', level: 'Advanced' },
  ];

  // Add modal container component
  const PresenceModal = () => {

    const presenceModalStyles = {
      modalBackdrop: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
      },
      modalContent: {
        backgroundColor: 'rgba(45, 28, 22, 0.9)',
        borderRadius: 20,
        padding: 20,
      },
      modalTitle: {
        fontSize: 24,
        fontFamily: readioBoldFont,
        color: colors.readioWhite,
        marginBottom: 20,
      },
      modalItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
      },
      modalItemText: {
        color: colors.readioWhite,
        fontSize: 16,
      },
      modalItemSubtext: {
        color: colors.readioOrange,
        fontSize: 12,
      },
      durationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
      },
      durationPill: {
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
      },
      durationText: {
        color: colors.readioWhite,
      },
      closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        padding: 5,
      },
      
    }

    return (
      <>
      <Modal
        visible={!!selectedModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedModal(null)}
      >
        <BlurView intensity={20} style={presenceModalStyles.modalBackdrop as any}>
          <Animated.View entering={FadeInUp.duration(300)} style={presenceModalStyles.modalContent}>
            
            {/* Music Modal */}
            {selectedModal === 'music' && (
              <>
                <Text style={presenceModalStyles.modalTitle}>Select Music</Text>
                {sampleTracks.map((track) => (
                  <Pressable key={track.id} style={presenceModalStyles.modalItem}>
                    <Text style={presenceModalStyles.modalItemText}>{track.title}</Text>
                    <Text style={presenceModalStyles.modalItemSubtext}>{track.duration}</Text>
                  </Pressable>
                ))}
              </>
            )}

            {/* Duration Modal */}
            {selectedModal === 'duration' && (
              <>
                <Text style={presenceModalStyles.modalTitle}>Set Duration</Text>
                <View style={presenceModalStyles.durationContainer as any}>
                  {[5, 10, 15, 30].map((mins) => (
                    <Pressable
                      key={mins}
                      style={({ pressed }) => [
                        presenceModalStyles.durationPill,
                        { backgroundColor: pressed ? colors.readioBrown : colors.readioBlack }
                      ]}
                    >
                      <Text style={presenceModalStyles.durationText}>{mins} mins</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {/* Lessons Modal */}
            {selectedModal === 'lessons' && (
              <>
                <Text style={presenceModalStyles.modalTitle}>Choose Lesson</Text>
                {sampleLessons.map((lesson) => (
                  <Pressable key={lesson.id} style={presenceModalStyles.modalItem}>
                    <Text style={presenceModalStyles.modalItemText}>{lesson.title}</Text>
                    <Text style={presenceModalStyles.modalItemSubtext}>{lesson.level}</Text>
                  </Pressable>
                ))}
              </>
            )}

            <Pressable
              style={presenceModalStyles.closeButton as any}
              onPress={() => setSelectedModal(null)}
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.readioWhite} />
            </Pressable>

          </Animated.View>
        </BlurView>
      </Modal>
      </>
    )
  }


  const PresenceOptions = () => {

      // Add to StyleSheet
  const optionStyles = StyleSheet.create({
    optionButton: {
      ...utilsStyles.buttonContainer,
      display: 'flex',
      flexDirection: 'row',
      overflow: 'hidden',
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 16,
      justifyContent: 'space-between'    
    },
    gradientBackground: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.7,
    },
    icon: {
      marginLeft: 8
    },
    optionText: {
      ...utilsStyles.buttonText,
      color: colors.readioWhite,
      textShadowColor: 'rgba(0,0,0,0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    pressed: {
      opacity: 0.9,
    },
  });

    return (
      <View style={{ gap: 24, paddingHorizontal: 20, marginTop: 40, bottom: 150, alignSelf: 'center', position: 'absolute'}}>
       
        {/* Music Selection */}
        <Animated.View style={{borderRadius: 100,}} entering={FadeInDown.duration(300)}>
          <Pressable
            onPress={() => setSelectedModal('music')}
            style={[
              optionStyles.optionButton, 
              { backgroundColor: colors.readioBlack }
            ]}
            android_ripple={{ color: colors.readioBrown }}
          >
            <Text style={optionStyles.optionText}>Music</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3}}>
              <Text style={optionStyles.optionText}>---</Text>
              <MaterialCommunityIcons 
                name="music-circle" 
                size={28} 
                color={colors.readioWhite} 
                style={optionStyles.icon}
              />
            </View>
          </Pressable>
        </Animated.View>
  
        {/* Time Selection */}
        <Animated.View entering={FadeInDown.duration(300).delay(50)}>
          <Pressable
            onPress={() => setSelectedModal('duration')}
            style={[
              optionStyles.optionButton, 
              { backgroundColor: colors.readioBlack }
            ]}
            android_ripple={{ color: colors.readioBrown }}
          >
            <Text style={optionStyles.optionText}>Duration</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3}}>
              <Text style={optionStyles.optionText}>5 mins</Text>
              <MaterialCommunityIcons 
                name="timer-outline" 
                size={28} 
                color={colors.readioWhite} 
                style={optionStyles.icon}
              />
            </View>
          </Pressable>
        </Animated.View>
  
        {/* Lesson Selection */}
        <Animated.View entering={FadeInDown.duration(300).delay(100)}>
          <Pressable
            onPress={() => setSelectedModal('lessons')}
            style={[
              optionStyles.optionButton, 
              { backgroundColor: colors.readioBlack }
            ]}
            android_ripple={{ color: colors.readioBrown }}
          >
            <Text style={optionStyles.optionText}>Guided Lessons</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3}}>
              <Text style={optionStyles.optionText}>---</Text>
              <MaterialCommunityIcons 
                name="book-open-outline" 
                size={28} 
                color={colors.readioWhite} 
                style={optionStyles.icon}
              />
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(100)}>
          <Pressable
            style={({ pressed }) => [
              optionStyles.optionButton, 
              { backgroundColor: colors.readioOrange, justifyContent: 'center' }
            ]}
            android_ripple={{ color: colors.readioOrange }}
          >
            <Text style={optionStyles.optionText}>Start</Text>
          </Pressable>
        </Animated.View>

      </View>
    );
  };


  return (
    <>
      <LotusHeader backgroundColor={'transparent'} />
        {/* Add video here */}
        <Animated.View 
          // key={stepKey}
          entering={FadeInUp.duration(300)}
          exiting={FadeOutDown.duration(300)}
          style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -1 }}
        >

        {/* TODO Video --- soon to be depreciated migrate to expo-video */}
          <Video
          source={ImageAssets.lotusFlowerPondVidDark}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
          rate={0.618}
          style={{ 
            width: '100%', height: '100%',
            opacity: 1
           }}
        />

         {/* Top Gradient */}
         <LinearGradient
            colors={[
              colors.readioBrown, 
              colors.readioBrown,
              'rgba(45, 28, 22, 0.7)',
              'rgba(45, 28, 22, 0)'
            ]}
            locations={[0, 0.5, 0.6, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.5 }}
            style={{
              position: 'absolute',
              top: 0,
              width: '100%',
              height: '100%',
              zIndex: 1
            }}
          />
          
          {/* Bottom Gradient */}
          <LinearGradient
            colors={[
              'rgba(45, 28, 22, 0)',
              'rgba(45, 28, 22, 0.7)',
              'rgba(45, 28, 22, 0.7)',
              colors.readioBrown
            ]}
            locations={[0, 0.4, 0.5, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.8 }}
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              height: '100%',
              zIndex: 1
            }}
          />


        </Animated.View>

        <View style={styles.container}>

          <Animated.Text 
            entering={FadeInUp.duration(300)} 
            exiting={FadeOutDown.duration(100)} 
            allowFontScaling={false} 
            style={[styles.bettertittle, {paddingTop: 30}]}
          >
            Presence
          </Animated.Text>

          <PresenceOptions/>

        {/* <FlatList
          data={sections}
          contentContainerStyle={{
            // backgroundColor: 'red'
          }}
          renderItem={({ item }: { item: Section }) => {
            switch (item.type) {
              case 'display-name':
                return (
                );
              case 'options':
                return (
                  // <>
                  // </>
                );
              default:
                return null;
            }
          }}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        /> */}
        </View>

        <PresenceModal/>
        <LotusArticleModal />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'center',
    backgroundColor: 'transparent',
    width: "100%",
    justifyContent: "space-between",
    flex: 1,
  },
  bettertittle: {
    fontSize: 45,
    fontWeight: 'bold',
    fontFamily: readioBoldFont,
    color: colors.readioWhite,
    paddingHorizontal: 20,
  },
});