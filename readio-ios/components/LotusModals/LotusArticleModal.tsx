import { ImageAssets } from "@/constants/imageAssets";
import { colors, giantFont, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { setStateAsync } from "@/constants/utilityFunctions";
import { useProgressQueue } from "@/handleArticleGenerations/processingQueue";
import { useLotusModal } from "@/helpers/providers/lotusModalContext";
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from "expo-blur";
import React, { useEffect, useRef } from "react";
import { Dimensions, Keyboard, KeyboardAvoidingView, Modal, Pressable, Animated as ReactNativeAnimated, ScrollView, StyleSheet, Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import LotusGap from "../LotusGap";
import { utilsStyles } from "@/styles";
import Animated, { FadeInDown, FadeInUp, FadeOutDown } from "react-native-reanimated";
import { LotusPicker } from "../LotusPicker";

export function LotusArticleModal() {

  // CONTROLS IF THE MODEL WILL SHOW OR NOT
  const { form, setForm, voiceOptions, currentVoiceOption, setCurrentVoiceOption, setIsArticleGenerating, isArticleModalVisible, setIsArticleModalVisible, setArticleGenerationStatus, wantsToMakeAnArticle, setWantsToMakeAnArticle, articleGenerationStatus } = useLotusModal()
  const { ProgressQueue, setGenerationStarted, setProgressMessage } = useProgressQueue()
  const { setNeedsToRefresh } = useLotusUser()
  const [selectedVoiceName, setSelectedVoiceName] = React.useState<string>('---')
  const [selectedVoiceId, setSelectedVoiceId] = React.useState<string | null>(null)
  const iconColor = selectedVoiceId? colors.readioOrange : 'rgba(255, 255, 255, 0.3)'
  const [isDIYMode, setIsDIYMode] = React.useState(false);
  const getModalMessege = () => {
    if (isDIYMode) {
      return 'Write your own article,\n Customize with your choice of voice.'
    }

    if (!isDIYMode) {
      return 'Transform your ideas into narrated articles, \n Customized with your choice of voice and topic.'
    }
  }

  const handleArticleCloseModal = async () => {
    // console.log('Closing modal - start'); 
    setArticleGenerationStatus('');
    setForm({ query: '' });
    setIsArticleModalVisible(false);
    setGenerationStarted(false)
    setWantsToMakeAnArticle(false)
    // FIXME DONT FORGE TTHIS 
    // setNeedsToRefresh?.(true);
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
      height: '100%',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'flex-end',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: 'rgba(45, 28, 22, 0.9)',
      justifyContent: 'space-between',
      borderRadius: 20,
      paddingTop: 20,
      height: '90%',
      width: '100%',
      position: 'relative',
      zIndex: 1001
    },
    // ---------------------
  });

  function ModalHeader() {

    const styles = StyleSheet.create({

      headerWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        gap: 15,
        paddingTop: 10,
        paddingHorizontal: 10,
        backgroundColor: 'transparent',
      },
      headerContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        height: 50,
      },
      headerHeading: {
        color: colors.readioWhite,
        fontFamily: giantFont,
        fontSize: 16,
        backgroundColor: 'transparent',
      },
      headerSmallText: {
        color: colors.readioOrange,
        fontFamily: readioBoldFont,
        fontSize: 14,
        backgroundColor: 'transparent',
        textAlign: 'center',
        opacity: isDIYMode ? 1 : 0,
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
    });

    const Placeholder = () => {
      return (
        <Text style={{ color: 'transparent' }}>-----</Text>
      )
    }

    return (
      <>
        {/* <LotusUnderConctruction/> */}
        <View style={styles.headerWrapper}>
          <View style={styles.headerContainer}>
            <Pressable style={[styles.submitButton, { backgroundColor: 'transparent' }]} onPress={() => handleArticleCloseModal()}>
              <FontAwesome name='arrow-left' size={20} style={styles.submitIcon} />
            </Pressable>
            <View style={{display: 'flex', flexDirection: 'column'}}>
              <Text allowFontScaling={false}
              style={styles.headerSmallText}
              >
                D.I.Y
              </Text>
              <Text allowFontScaling={false}
                style={styles.headerHeading}>
                Create
              </Text>
            </View>
            <Placeholder />
          </View>
        </View>
      </>
    )
  }

  
  function VoiceOptions () {

    const [isModalVisible, setIsModalVisible] = React.useState(false);

    const VoiceSelector = () => {
      return (
        <>
      <View>
        <Pressable
          style={[
            optionStyles.optionButton, 
            { backgroundColor: 'rgba(0,0,0,0.3)',}
          ]}
          android_ripple={{ color: colors.readioBrown }}
          onPress={() => setIsModalVisible(true)}
        >
          <Text allowFontScaling={false} style={optionStyles.optionText}>Narrator</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3}}>
            <Text allowFontScaling={false} style={[optionStyles.optionText, {color: iconColor}]}>{selectedVoiceName}</Text>
            <MaterialCommunityIcons 
              name='account-voice' 
              size={28} 
              color={iconColor} 
              style={optionStyles.icon}
            />
          </View>
        </Pressable>
      </View>

        </>
      )
    } 

    const ModalForVoices = () => {
  
      const ModalStyles = {
        modalBackdrop: {
          flex: 1,
          justifyContent: 'center',
        },
        modalContent: {
          backgroundColor: 'rgba(45, 28, 22, 0.9)',
          borderRadius: 20,
          padding: 20,
          position: 'absolute',
          alignSelf: 'center',
          height: '60%',
          width: '100%',
          bottom: 0,
  
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
  
      const durations = [5, 10, 15, 30, 45, 60];
      const scrollViewRef = React.useRef(null);
      const { height: modalHeight } = Dimensions.get('window');
      const contentHeight = modalHeight * 0.6 - 0;
  
      const handleSelectVoices = (intro: string) => {
        // setSelectedIntro(intro);
        // setSelectedModal(null);
      }


      const setSelectedVoice = (voice: any) => {
        setSelectedVoiceName(voice.label)
        setSelectedVoiceId(voice.value)
        setIsModalVisible(false)
      }
  
      return (
        <>
        <Modal visible={isModalVisible} transparent animationType="slide"
        >
          <BlurView intensity={5} style={ModalStyles.modalBackdrop as any}>
            <Animated.View entering={FadeInUp.duration(300)} style={ModalStyles.modalContent as any}>
                
            <View style={{display: 'flex', flexDirection:'row', justifyContent: 'space-between'}}>

              <Text allowFontScaling={false} style={ModalStyles.modalTitle}>Choose Narrator</Text>
              <MaterialCommunityIcons
                name='close'
                size={28}
                color={colors.readioWhite}
                // style={ModalStyles.closeButton}
                onPress={() => setIsModalVisible(false)}
                />

            </View>

                {voiceOptions.map((voice: any, index: number) => (
                  <Pressable onPress={() => setSelectedVoice(voice)} key={voice.value} style={ModalStyles.modalItem}>
                    <Text allowFontScaling={false} style={ModalStyles.modalItemSubtext}>{index + 1}.</Text>
                    <Text allowFontScaling={false} style={[ModalStyles.modalItemText, {fontFamily: readioBoldFont}]}>{voice.label}</Text>
                  </Pressable>
                ))}

  
            </Animated.View>
          </BlurView>
        </Modal>
        </>
      )

    }

    const optionStyles = StyleSheet.create({
      optionButton: {
        height: 48,
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        // alignSelf: 'center',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        width: '100%',
        paddingHorizontal: 16,
        borderRadius: 100,
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
      <>
      <View style={{marginHorizontal: 15}}>
          <VoiceSelector />
          <ModalForVoices/>
      </View>
      </>
    )

  };


  const ModalInputSection = () => {

    const [heightOfInputContainer, setHeightOfInputContainer] = React.useState(160)
    const [isKeyboardActive, setIsKeyboardActive] = React.useState(false);

    const getPlaceholderMessege = () => {
      if (isDIYMode) {
        return 'What you put here will be narrated in the voice of your chose narrator...'
      }
      if (!isDIYMode) {
        return 'Type your query here...'
      }
    }

    useEffect(() => {
      const keyboardWillShow = Keyboard.addListener('keyboardWillShow', () => {
        setIsKeyboardActive(true);
      });

      const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => {
        setIsKeyboardActive(false);
      });

      // Cleanup subscription on unmount
      return () => {
        keyboardWillShow.remove();
        keyboardWillHide.remove();
      };
    }, []);

    const styles = StyleSheet.create({
      inputContainer: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 30,
        flexDirection: 'column',
        gap: 15,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        paddingHorizontal: 15,
        paddingVertical: 15,
        bottom: 35,
      },
      inputField: {
        color: colors.readioWhite,
        width: '100%',
        fontSize: 16,
        paddingHorizontal: 10,
        marginRight: 10,
        minHeight: 60,
        maxHeight: isKeyboardActive ? 80 : 200,
        textAlignVertical: 'top',
      },
      actionsWrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
      },
      leftActionsWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      },
      closeButton: {
        position: 'relative',
        padding: 5,
        zIndex: 30,
        display: 'flex',
        alignSelf: 'flex-end',
      },
      // TODO
      submitButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
        borderWidth: 1,
        backgroundColor: selectedVoiceId ? colors.readioOrange : 'rgba(255, 255, 255, 0.1)',
        borderColor: selectedVoiceId ? 'transparent' : 'rgba(255, 255, 255, 0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
      },
      submitIcon: {
        color: selectedVoiceId ? `${colors.readioWhite}` : 'rgba(255, 255, 255, 0.3)',
        fontSize: 16
      },
      modeButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: colors.readioOrange,
      },
      modeButtonActive: {
        backgroundColor: 'rgba(255, 126, 54, 0.2)',
      },
      modeButtonInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
      modeButtonText: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontFamily: readioBoldFont,
      },
      modeButtonTextActive: {
        color: colors.readioOrange,
      }
    });

    const [modalForm, setModalForm] = React.useState({
      query: ''
    })


    useEffect(() => {
      // Only update form when wantsToMakeAnArticle becomes true
      if (wantsToMakeAnArticle === true) {
        setForm(prevForm => ({
          ...prevForm,
          query: modalForm.query
        }));
      }
    }, [wantsToMakeAnArticle, modalForm.query])

    const D_I_Y_ModeSelection = () => {
      return (
        <Pressable 
          style={[
            styles.modeButton,
            isDIYMode ? styles.modeButtonActive : styles.modeButtonInactive
          ]}
          onPress={() => setIsDIYMode(!isDIYMode)}
        >
          <Text style={[
            styles.modeButtonText,
            isDIYMode ? styles.modeButtonTextActive : null
          ]}>
            D.I.Y Mode
          </Text>
        </Pressable>
      )
    }

    return (
      <>
        <View style={[styles.inputContainer]}>
          <TextInput
            onChangeText={(text) => setModalForm({ ...modalForm, query: text })}
            value={modalForm.query}
            multiline
            autoFocus
            numberOfLines={5}
            placeholder={getPlaceholderMessege()}
            style={[styles.inputField, {
            }]}
            placeholderTextColor="rgba(255,255,255,0.5)"
          />

          <View style={styles.actionsWrapper}>
            
            <View style={styles.leftActionsWrapper}>
              <D_I_Y_ModeSelection/>
            </View>

            <Pressable
              disabled={form?.query?.length === 0}
              onPress={() => (articleGenerationStatus === 'done' ? handleReset() : setWantsToMakeAnArticle(true))}
              style={styles.submitButton}
            >
              <Text style={[styles.modeButtonText, styles.modeButtonTextActive]}>
                {articleGenerationStatus === 'done' ? 'Reset' : ''}
              </Text>
              <FontAwesome
                name={articleGenerationStatus === 'done' ? 'refresh' : 'chevron-right'}
                style={[styles.submitIcon, {marginLeft: 5}]}
              />
            </Pressable>

          </View>

        </View>
      </>
    )
  }


  return (
    <>
      <Modal
        animationType="none"
        transparent={true}
        visible={isArticleModalVisible === true}
        onRequestClose={handleArticleCloseModal}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={{ height: '100%' }}
        >
          <BlurView intensity={26.18} tint="dark" style={[styles.modalBackdrop, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}>
            <View
              style={[styles.modalContent, {
                backgroundColor: 'rgba(45, 28, 22, 1)',
                minHeight: 300,
                width: '100%',
                position: 'relative',
                zIndex: 2,
              }]}
            >
              <View style={{gap: 20}}>
                
                <ModalHeader />
                <Text style={{color: colors.readioWhite, textAlign: 'center', marginHorizontal: 15, fontFamily: readioRegularFont}}>
                  {getModalMessege()}
                </Text>
                

              </View>
              
              <View style={{gap: 50}}>
                <VoiceOptions/>
                <ModalInputSection />
              </View>

            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );

}
