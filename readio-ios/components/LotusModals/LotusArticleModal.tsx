import { useLotusModal } from "@/helpers/providers/lotusModalContext";
import React from "react";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
import Animated from "react-native-reanimated";
import { FadeOut, FadeOutDown, FadeOutUp, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { FadeInDown, FadeInUp } from "react-native-reanimated";
import { StyleSheet, KeyboardAvoidingView, Modal, Button, TouchableOpacity, ScrollView, Animated as ReactNativeAnimated, RefreshControl, Pressable, ActivityIndicator, LayoutChangeEvent, Keyboard, Image } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { colors, systemPromptReadio } from "@/constants/tokens";
import { Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useProgressQueue } from "@/handleArticleGenerations/processingQueue";
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import { getLocalImageUri, ImageAssets } from "@/constants/imageAssets";
import InputField from '@/components/inputField';
import { handleGenerateArticleCompletelyFree, handleGenerateArticleCompletelyFreeProps } from "@/handleArticleGenerations/handleGenerateArticle";
import { geminiTest } from "@/helpers/geminiClient";
import { pexelsClient } from "@/helpers/pexelsClient";
import { TextInput } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";


export function LotusArticleModal() {

  // CONTROLS IF THE MODEL WILL SHOW OR NOT
  const {form, setForm, isArticleModalVisible, setIsArticleModalVisible, setArticleGenerationStatus, setWantsToMakeAnArticle, wantsToMakeAnArticle, articleGenerationStatus } = useLotusModal()

  const { ProgressQueue, animatedStyles, setGenerationStarted, setProgressMessage, generationStarted, progressMessage, handleProgressContainerLayout } = useProgressQueue()
  const { user, isSignedIn, needsToRefresh, setNeedsToRefresh } = useLotusUser()
  
  const handleArticleCloseModal = () => {
    // console.log('Closing modal - start'); 
    setArticleGenerationStatus('');
    setForm({ query: '' });
    setIsArticleModalVisible(false);
    setGenerationStarted(false)
    setWantsToMakeAnArticle(false)
    setNeedsToRefresh?.(true);
  }
  
  const handleReset = () => {
    try {

      setArticleGenerationStatus('')
      ProgressQueue.resetQueue()
      setProgressMessage('')
      setForm({ ...form, query: '' })
      setForm({ ...form, query: '' })
      setWantsToMakeAnArticle(false)
      setGenerationStarted(false)
      setNeedsToRefresh?.(true);
      setTimeout(() => {
        setNeedsToRefresh?.(false);
      }, 200);

    } catch (error) {

      console.error('Error in handleArticleCloseModal:', error);

    } finally {

      setTimeout(() => {
        setNeedsToRefresh?.(false);
      }, 200);

    }

  }

  const styles = StyleSheet.create({

    modalBackdrop: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: 'rgba(45, 28, 22, 0.9)',
      borderRadius: 20,
      padding: 20,
      paddingTop: 40,
      // height: '80%',
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 30
    },
    logoContainer: {
      backgroundColor: colors.readioOrange,
      borderRadius: 100,
      padding: 10,
      marginBottom: 20
    },
    logoImage: {
      width: 80, 
      height: 80
    },
    inputContainer: {
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 5,
      height: 60,
      bottom: 10,
    },
    inputField: {
      color: colors.readioWhite,
      flex: 1,
      height: 50,
      fontSize: 16,
      paddingHorizontal: 10,
      marginRight: 10,
    },
    closeButton: {
      position: 'absolute',
      top: 15,
      right: 15,
      padding: 5,
      zIndex: 3
    },
    submitButton: {
      backgroundColor: colors.readioOrange,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },
    submitIcon: {
      color: colors.readioWhite, 
      fontSize: 20
    },

    // ---------------------

    pagerView: {
      flex: 1,
    },
    page: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontSize: 60,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
      color: colors.readioWhite
    },
    subtext: {
      fontSize: 15,
      opacity: 0.5,
      textAlign: 'center',
      fontFamily: readioRegularFont,
      color: colors.readioWhite
    },
    animatedBorder: {
      borderWidth: 2,
      borderRadius: 10,
      borderStyle: 'solid',
      zIndex: 5,
      borderColor: colors.readioOrange
    },
    toast: {
      position: 'absolute',
      top: 20,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 16,
      zIndex: 10,
      backgroundColor: '#fff',
      maxWidth: '100%',
      height: 50,
      display: 'flex'
    },
    scrollView: {
      width: '90%',
      minHeight: '100%',
    },
    heading: {
      fontSize: 40,
      fontWeight: 'bold',
      textAlign: 'center',
      color: colors.readioWhite,
      zIndex: 1,
      fontFamily: readioBoldFont
    },
    option: {
      fontSize: 12,
      paddingBottom: 10,
      color: colors.readioWhite,
      width: "80%",
      alignSelf: 'center',
      textAlign: 'center',
      fontFamily: readioRegularFont
    },
    title: {
      fontSize: 20,
      textAlign: 'center',
      marginBottom: 10,
      color: colors.readioWhite,
      fontFamily: readioRegularFont
    },
    announcmentBigText: {
      fontSize: 18,
      color: colors.readioWhite,
      fontFamily: readioBoldFont
    },
    announcmentSmallText: {
      color: colors.readioWhite,
      fontFamily: readioRegularFont
    },
    gap: {
      marginVertical: 20,
    },
    readioRadioContainer: {
      width: 160,
    },
    stationContainer: {
      width: '100%',
    },
    station: {
      width: 140,
      height: 140,
      marginVertical: 15,
    },
    stationImage: {
      width: 170,
      height: 160,
      overflow: 'hidden',
      borderRadius: 10,
      position: 'relative',
    },
    stationName: {
      fontWeight: 'bold',
      textAlign: 'left',
      color: colors.readioWhite,
      paddingHorizontal: 10,
      fontFamily: readioRegularFont,
      fontSize: 20
    },
    nowPlaying: {
      borderRadius: 10,
      width: '95%',
      height: 300,
      marginVertical: 10,
      alignSelf: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    nowPlayingOverlay: {
      position: 'absolute',
      zIndex: 1,
      top: 0,
      left: 0,
      width: '100%',
      height: 300,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent'
    },
    nowPlayingText: {
      color: colors.readioWhite,
      zIndex: 1,
      fontWeight: 'bold',
      fontSize: 20,
      padding: 10,
      fontFamily: readioRegularFont
    },
    nowPlayingImage: {
      width: '100%',
      height: 300,
      overflow: 'hidden',
      position: 'absolute',
      right: 0,
      top: 0,
      borderRadius: 10
    },
  });

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isArticleModalVisible}
      >

          <KeyboardAvoidingView 
            behavior="padding" 
            style={{  zIndex: 2, position: 'relative', flexGrow: 1 }}
          >
        <BlurView intensity={40} style={styles.modalBackdrop}>
          
          <Animated.View 
            entering={FadeInUp.duration(300)}
            style={styles.modalContent}
          >
            {/* Close button */}
            <Pressable
              style={styles.closeButton}
              onPress={handleArticleCloseModal}
            >
              <FontAwesome name="close" size={24} color={colors.readioWhite} />
            </Pressable>
              {/* Logo and heading section */}
              <View style={styles.headerContainer}>
                <Animated.View
                  entering={FadeInUp.duration(300)}
                  exiting={FadeOutDown.duration(300)}
                  style={styles.logoContainer}
                >
                  <Image
                    source={ImageAssets.whiteLogo}
                    style={styles.logoImage}
                    resizeMode='contain'
                  />
                </Animated.View>
                
                <Text allowFontScaling={false} style={styles.heading}>Create</Text>
                <Text allowFontScaling={false} style={styles.subtext}>
                  From simple ideas to detailed instructions, craft the perfect article in moments.
                </Text>
              </View>
  
              {/* Input section */}
              <View style={styles.inputContainer}>
                <TextInput
                  onChangeText={(text) => setForm({ ...form, query: text })}
                  value={form.query}
                  autoFocus
                  placeholder="Type your query here..."
                  style={styles.inputField}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
  
                <Pressable
                  disabled={form?.query?.length === 0}
                  onPress={() => (articleGenerationStatus === 'done' ? handleReset() : setWantsToMakeAnArticle(true))}
                  style={styles.submitButton}
                >
                  <FontAwesome
                    name={articleGenerationStatus === 'done' ? 'refresh' : 'chevron-right'}
                    style={styles.submitIcon}
                  />
                </Pressable>
              </View>

            

          </Animated.View>

        </BlurView>
            </KeyboardAvoidingView>
      </Modal>
    </>
  );

}