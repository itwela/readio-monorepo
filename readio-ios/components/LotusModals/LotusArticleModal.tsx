import { ImageAssets } from "@/constants/imageAssets";
import { colors, giantFont, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { useProgressQueue } from "@/handleArticleGenerations/processingQueue";
import { useLotusModal } from "@/helpers/providers/lotusModalContext";
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from "expo-blur";
import React, { useEffect, useRef } from "react";
import { Dimensions, Keyboard, KeyboardAvoidingView, Modal, Pressable, Animated as ReactNativeAnimated, ScrollView, StyleSheet, Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

export function LotusArticleModal() {

  // CONTROLS IF THE MODEL WILL SHOW OR NOT
  const { form, setForm, isArticleModalVisible, setIsArticleModalVisible, setArticleGenerationStatus, wantsToMakeAnArticle, setWantsToMakeAnArticle, articleGenerationStatus } = useLotusModal()
  const { ProgressQueue, setGenerationStarted, setProgressMessage } = useProgressQueue()
  const { setNeedsToRefresh } = useLotusUser()

  const voicesScrollRef = useRef<ScrollView>(null);
  const voicesScrollX = useRef(new ReactNativeAnimated.Value(0)).current;
  const [voicesIndex, setVoicesIndex] = React.useState(0);

  const voiceOptions = [
    { label: 'Kore', value: 'kore' },
    { label: 'Micheal', value: 'micheal' },
    { label: 'Beta', value: 'beta' },
    { label: 'Stic', value: 'stic' },
  ];


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
      top: 0,
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
      minHeight: 300,
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
            <Text allowFontScaling={false}
              style={styles.headerHeading}>
              Create
            </Text>
            <Placeholder />
          </View>
        </View>
      </>
    )
  }

  function ModalConsole() {

    const styles = StyleSheet.create({

      mainContainer: {
        alignItems: 'flex-start',
        marginBottom: 30,
        gap: 20,
        backgroundColor: 'transparent'
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

    });

    function Carousel({ images }: { images: any[] }) {

      const handleScroll = ReactNativeAnimated.event(
        [{ nativeEvent: { contentOffset: { x: voicesScrollX } } }],
        { useNativeDriver: false }
      );

// TODO
      const handleMomentumScrollEnd = async (e: any) => {
        const newPosition = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
        if (newPosition > voicesIndex) {
          // if im scrolling to the right what do i want to do
        } else if (newPosition < voicesIndex) {
          // if im scrolling to the left what do i want to do
        }
      }

      const { width: screenWidth } = Dimensions.get('window');

      return (
        <>
          <ScrollView
            style={{ backgroundColor: 'transparent', width: '100%', height: '50%', alignSelf: 'center', display: 'flex', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
            ref={voicesScrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onScroll={handleScroll} onMomentumScrollEnd={handleMomentumScrollEnd} scrollEventThrottle={16}
          >

            {voiceOptions.length > 0 && voiceOptions.map((voice, index: number) => (
              <View key={index} style={[, { width: screenWidth, height: '100%', display: 'flex', backgroundColor: 'transparent', alignSelf: 'center',}]}>

                <View style={{ display: 'flex', backgroundColor: 'transparent', height: '100%', overflow: 'hidden', width: 150, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 1000  }}>
                  

                  <Text style={[, { fontFamily: readioBoldFont, color: colors.readioWhite, fontSize: 24}]}>
                    {voice.label}
                  </Text>

                </View>

              </View>
            ))}
          </ScrollView>
        </>
      );
    }

    return (
      <>
        {/* Logo and heading section */}
        <View style={styles.mainContainer}
        >
          {/* <View style={{ paddingHorizontal: 30, backgroundColor: 'transparent' }}>
            <Text allowFontScaling={false} style={styles.subtext}>
              From simple ideas to detailed instructions, craft the perfect article in moments.
            </Text>
          </View> */}
          <Carousel images={[ImageAssets.whiteLogo, ImageAssets.whiteLogo, ImageAssets.whiteLogo]} />
        </View>
      </>
    )
  }

  const ModalInputSection = () => {


    const [heightOfInputContainer, setHeightOfInputContainer] = React.useState(160)

    const [isKeyboardActive, setIsKeyboardActive] = React.useState(false);

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
        marginHorizontal: 10,
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

    return (
      <>
        <View style={[styles.inputContainer]}>
          <TextInput
            onChangeText={(text) => setModalForm({ ...modalForm, query: text })}
            value={modalForm.query}
            multiline
            numberOfLines={5}
            placeholder="Type your query here..."
            style={[styles.inputField, {
            }]}
            placeholderTextColor="rgba(255,255,255,0.5)"
          />

          <View style={styles.actionsWrapper}>
            <View style={styles.leftActionsWrapper}>

            </View>
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
          <BlurView intensity={40} tint="dark" style={[styles.modalBackdrop, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}>
            <View
              style={[styles.modalContent, {
                backgroundColor: 'rgba(45, 28, 22, 0.9)',
                minHeight: 300,
                width: '100%',
                position: 'relative',
                zIndex: 2,
                height: '90%'
              }]}
            >
              <ModalHeader />
              <View style={{gap:5}}>
                <Text style={{color: colors.readioWhite, textAlign: 'center', fontFamily: readioBoldFont}}>Swipe to choose your narrator</Text>
                <Text style={{color: colors.readioWhite, textAlign: 'center', fontFamily: readioBoldFont}}>Type to generate your article</Text>
              </View>
              <ModalConsole />
              <ModalInputSection />
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );

}
