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
import { getLocalImageUri } from "@/constants/imageAssets";
import InputField from '@/components/inputField';
import { handleGenerateArticleCompletelyFree, handleGenerateArticleCompletelyFreeProps } from "@/handleArticleGenerations/handleGenerateArticle";
import { geminiTest } from "@/helpers/geminiClient";
import { pexelsClient } from "@/helpers/pexelsClient";
import { TextInput } from "react-native-gesture-handler";


export function LotusArticleModal() {

  // CONTROLS IF THE MODEL WILL SHOW OR NOT
  const {form, setForm, isArticleModalVisible, setIsArticleModalVisible, setArticleGenerationStatus, setWantsToMakeAnArticle, wantsToMakeAnArticle, articleGenerationStatus } = useLotusModal()

  const { ProgressQueue, animatedStyles, setGenerationStarted, setProgressMessage, generationStarted, progressMessage, handleProgressContainerLayout } = useProgressQueue()
  const { user, isSignedIn, needsToRefresh, setNeedsToRefresh } = useLotusUser()
  

  const styles = StyleSheet.create({
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
      // position: 'absolute',
      // top: 0,
      // left: 0,
      // right: 0,
      // bottom: 0,
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
      // fontWeight: 'bold',
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
      // display: 'flex',
      // flexDirection: 'row',
      // flexWrap: 'wrap',
      // gap: 50,
      // alignItems: 'center',
      // justifyContent: 'space-between',
      width: 160,
      // backgroundColor: colors.readioOrange
    },
    stationContainer: {
      width: '100%',
      // height: 410,
      // flexWrap: 'wrap',
      // gap: 10,
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
      // borderWidth: 5,
      // borderStyle: 'solid',
      // borderColor: colors.readioOrange,
    },
    stationName: {
      fontWeight: 'bold',
      textAlign: 'left',
      // marginVertical: 5,
      // width: '80%',
      color: colors.readioWhite,
      paddingHorizontal: 10,
      // position: 'absolute',
      // zIndex: 1,
      // bottom: 0,
      // left: 0,
      // transform: [{ translateX: 10 }, { translateY: 10 }],
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

  const handleArticleCloseModal = () => {
    // console.log('Closing modal - start'); 
    try {
      setArticleGenerationStatus('');
      setForm({ query: '' });
      setIsArticleModalVisible(false);
      setGenerationStarted(false)
      setWantsToMakeAnArticle(false)
      ProgressQueue.resetQueue();
      ProgressQueue.resetQueue();
      console.log('ran function -------------------------------- ');
      setNeedsToRefresh?.(true);
    } catch (error) {
      console.error('Error in handleArticleCloseModal:', error);
    } finally {
      setTimeout(() => {
        setNeedsToRefresh?.(false);
      }, 200);
    }
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

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isArticleModalVisible}
        style={{ width: '100%', height: '100%' }}
      >
        <View style={{
          flex: 1,
          backgroundColor: colors.readioBrown,
          paddingHorizontal: 20,
          paddingTop: 40
        }}>
          <KeyboardAvoidingView behavior="padding" style={{ flex: 1, zIndex: 2, position: 'relative' }}>
           
            {/* Close button */}
            <View style={{
              width: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              marginBottom: 20
            }}>
              <Pressable
                style={{ padding: 10 }}
                onPress={handleArticleCloseModal}
              >
                <FontAwesome name="close" size={30} color={colors.readioWhite} />
              </Pressable>
            </View>

            {/* Content container */}
            <View style={{
              flex: 1,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 40
            }}>
              <View style={{
                width: '100%',
                alignItems: 'center',
                marginBottom: 30
              }}>

                    <Animated.View
                      entering={FadeInUp.duration(300)}
                      exiting={FadeOutDown.duration(300)}
                      style={{
                        backgroundColor: colors.readioOrange,
                        borderRadius: 100,
                        padding: 10,
                        marginBottom: 20
                      }}
                    >
                      <Image
                        source={{ uri: getLocalImageUri('whiteLogo') }}
                        style={{ width: 80, height: 80 }}
                        resizeMode='contain'
                      />
                    </Animated.View>



                    <Text allowFontScaling={false} style={styles.heading}>Create</Text>
                    <Text allowFontScaling={false} style={[styles.subtext, {paddingHorizontal: 5}]}>
                      From simple ideas to detailed instructions, craft the perfect article in moments.
                    </Text>

                    <Text allowFontScaling={false} style={{
                      color: colors.readioWhite,
                      opacity: 0.6,
                      textAlign: 'center',
                      marginTop: 20
                    }}>
                      What do you want to hear?
                    </Text>
                  </View>

                  {/* Input section */}
                  <View style={{
                    width: '100%',
                    backgroundColor: colors.readioBlack,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 15,
                    paddingVertical: 5,
                    height: 60
                  }}>
                    <TextInput  // Replace InputField with TextInput temporarily
                      onChangeText={(text) => setForm({ ...form, query: text })}
                      value={form.query}
                      autoFocus
                      placeholder="Type your query here..."
                      style={{
                        color: colors.readioWhite,
                        flex: 1,
                        height: 50,
                        fontSize: 16,
                        paddingHorizontal: 10,
                        marginRight: 10,
                      }}
                      placeholderTextColor="rgba(255,255,255,0.5)"
                    />

                    <Pressable
                      disabled={form?.query?.length === 0}
                      onPress={() => (articleGenerationStatus === 'done' ? handleReset() : setWantsToMakeAnArticle(true))}
                      style={{
                        backgroundColor: form?.query?.length > 0 ? colors.readioOrange : colors.readioBlack,
                        opacity: form?.query?.length > 0 ? 1 : 0.2,
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FontAwesome
                        name={articleGenerationStatus === 'done' ? 'refresh' : 'chevron-right'}
                        style={{ color: colors.readioWhite, fontSize: 20 }}
                      />
                    </Pressable>
                  </View>

            </View>

          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );

}