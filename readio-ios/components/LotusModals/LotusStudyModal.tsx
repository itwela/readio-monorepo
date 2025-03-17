import React from "react";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
import Animated from "react-native-reanimated";
import { FadeOut, FadeOutDown, FadeOutUp, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { FadeInDown, FadeInUp } from "react-native-reanimated";
import { StyleSheet, KeyboardAvoidingView, Modal, Button, TouchableOpacity, ScrollView, Animated as ReactNativeAnimated, RefreshControl, Pressable, ActivityIndicator, LayoutChangeEvent, Keyboard, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { colors, systemPromptReadio } from "@/constants/tokens";
import { Text, View, Image} from "react-native";
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
import { useLotusModal } from "@/helpers/providers/lotusModalContext";
import { setStateAsync } from "@/constants/utilityFunctions";
import { BlurView } from "expo-blur";

// Hey just testing article generation


export const LotusStudyModal = () => {

    const { form, setForm, isStudyModalVisible, setIsStudyModalVisible, setArticleGenerationStatus, setWantsToMakeAStudyArticle, articleGenerationStatus } = useLotusModal()

    const { ProgressQueue, animatedStyles, setGenerationStarted, setProgressMessage, generationStarted, progressMessage, handleProgressContainerLayout } = useProgressQueue()
    const { user, isSignedIn, needsToRefresh, setNeedsToRefresh } = useLotusUser()

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
            height: 60
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


        //   --------------------------------------


        subtext: {
            fontSize: 15,
            opacity: 0.5,
            textAlign: 'center',
            fontFamily: readioRegularFont,
            color: colors.readioWhite
        },
        heading: {
            fontSize: 40,
            fontWeight: 'bold',
            textAlign: 'center',
            color: colors.readioWhite,
            zIndex: 1,
            fontFamily: readioBoldFont
        },
    });

    const handleStudyCloseModal = async () => {
      await setStateAsync(setWantsToMakeAStudyArticle, false, 'affectsSomethingVisual')
      await setStateAsync(setIsStudyModalVisible, false, 'backendData')
      await setStateAsync(setForm, { query: '' }, 'backendData')
    }

    const handleStartStudyArticleGeneration = async () => {
        await setStateAsync(setArticleGenerationStatus, 'generating', 'affectsSomethingVisual')
        await setStateAsync(setWantsToMakeAStudyArticle, true, 'affectsSomethingVisual')
        await setStateAsync(setIsStudyModalVisible, false, 'backendData')
        await setStateAsync(setForm, { query: '' }, 'backendData')
    }

return (
    <Modal animationType="slide" transparent={true} visible={isStudyModalVisible}>
        <KeyboardAvoidingView behavior="padding" 
          style={{  
            zIndex: 2, position: 'relative', flexGrow: 1 
          }}
        >
      <BlurView intensity={40} style={styles.modalBackdrop}>
        <Animated.View entering={FadeInUp.duration(300)} style={styles.modalContent}>
          
          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={handleStudyCloseModal}>
            <FontAwesome name="close" size={24} color={colors.readioWhite} />
          </Pressable>

            <View style={styles.headerContainer}>
              
              <Animated.View entering={FadeInUp.duration(300)} style={styles.logoContainer}>
                <Image source={ImageAssets.whiteLogo} style={styles.logoImage} resizeMode='contain'/>
              </Animated.View>
              
              <Text allowFontScaling={false} style={styles.heading}>Study</Text>
              <Text allowFontScaling={false} style={styles.subtext}>
                Hear anything from your thoughts, to ideas, to even notes in seconds.
              </Text>

            </View>

            {/* Existing study content container */}
            <View style={{
              width: '100%', backgroundColor: colors.readioBlack, borderRadius: 10, padding: 15, minHeight: 100, gap: 10,
            }}>

              <TextInput value={form.query} placeholderTextColor="rgba(255,255,255,0.5)" editable={articleGenerationStatus !== 'done'} autoFocus multiline={true}
                onChangeText={(text) => {
                  if (articleGenerationStatus !== 'done') {
                    setForm({ ...form, query: text });
                  }
                }}
                placeholder="Write your own..."
                style={{
                  color: colors.readioWhite,
                  flex: 1,
                  minHeight: 80,
                  fontSize: 16,
                  textAlignVertical: 'top',
                  paddingBottom: 80,
                }}
              />

              <Pressable
                onPress={() => (handleStartStudyArticleGeneration())}
                disabled={form?.query?.length < 1}
                style={{
                  backgroundColor: form?.query?.length > 0 ? colors.readioOrange : colors.readioBlack,
                  opacity: form?.query?.length > 0 ? 1 : 0.2,
                  width: '100%',
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  color: colors.readioWhite,
                  fontSize: 16,
                  fontFamily: readioBoldFont
                }}>
                  {articleGenerationStatus === 'done' ? 'Again?' : 'Generate'}
                </Text>
              </Pressable>
            </View>

        </Animated.View>
      </BlurView>
          </KeyboardAvoidingView>
    </Modal>
);
}