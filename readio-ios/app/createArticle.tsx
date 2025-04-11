import { DismissModalSymbol } from "@/components/LotusModals/DismissModalSymbol";
import { LinearGradient } from "expo-linear-gradient";
import { colors, giantFont, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { useProgressQueue } from "@/handleArticleGenerations/processingQueue";
import { useLotusModal } from "@/helpers/providers/lotusModalContext";
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import React from "react";
import { SafeAreaView, Text, Modal, Dimensions, Pressable, Keyboard, StyleSheet, KeyboardAvoidingView, View, Image } from "react-native";
import { BlurView } from "expo-blur";
import LotusGap from "@/components/LotusGap";
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeOutDown } from "react-native-reanimated";
import { utilsStyles } from "@/styles";
import { useEffect } from "react";
import { TextInput } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp, Station } from "@/types/type";
import { setStateAsync } from "@/constants/utilityFunctions";
import { set } from "ts-pattern/dist/patterns";
import { ResizeMode, Video } from 'expo-av';
import { ImageAssets } from "@/constants/imageAssets";
import { PremiumBadge } from "@/components/LotusPremiumBadge";

export default function CreateArticle() {

    // CONTROLS IF THE MODEL WILL SHOW OR NOT
    const { ProgressQueue, setGenerationStarted, setProgressMessage } = useProgressQueue()
    const { setNeedsToRefresh } = useLotusUser()
    const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
    const [hasTheArticleStartedGenerating, setHasTheArticleStartedGenerating] = React.useState(false)
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [selectingVoice, setSelectingVoice] = React.useState(false) 

    const setSelectedVoice = (voice: any) => {
        console.log('voice', voice)
        // setSelectedVoiceName(voice.label)
        // setSelectedVoiceId(voice.value)
        // setSelectedVoiceProvider(voice.provider)
    }

    const { 
        form, setForm, 
        voiceOptions, diyVoiceOptions, setWantsToMakeA_D_I_Y_Article, 
        setIsArticleModalVisible, setArticleGenerationStatus, 
        setWantsToMakeAnArticle, articleGenerationStatus ,
        rFA, setRFA,
        setSelectedVoiceId, setSelectedVoiceName, setSelectedVoiceProvider,
        isDIYMode, setIsDIYMode, selectedVoiceId, selectedVoiceName, selectedVoiceProvider,
        iconColor, placeholderMessege, setPlaceholderMessage, modalMessege, setModalMessage
    } = useLotusModal();
    const optionsForModal = isDIYMode ? diyVoiceOptions : voiceOptions


    const handleReset = () => {
        try {

            setArticleGenerationStatus('')
            ProgressQueue.resetQueue()
            setProgressMessage('')
            setForm({ ...form, query: '' })
            setForm({ ...form, query: '' })
            setWantsToMakeAnArticle(false)
            setGenerationStarted(false)


        } catch (error) {

            console.error('Error in handleArticleCloseModal:', error);

        } finally {

            setTimeout(() => {
                setNeedsToRefresh?.(false);
            }, 200);

        }

    }

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
                justifyContent: 'center',
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

        return (
            <>
                {/* <LotusUnderConctruction/> */}
                <View style={styles.headerWrapper}>
                    <View style={styles.headerContainer}>
                        {/* <View></View> */}
                        {/* <Pressable style={[styles.submitButton, { backgroundColor: 'transparent' }]} onPress={() => handleArticleCloseModal()}>
                            <FontAwesome name='arrow-left' size={20} style={styles.submitIcon} />
                        </Pressable> */}
                        <View style={{ display: 'flex', flexDirection: 'column' }}>
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
                        {/* <Placeholder /> */}
                    </View>
                </View>
            </>
        )
    }

    function VoiceOptions() {


        const VoiceSelector = () => {
            return (
                <>
                    <View>
                        <Pressable
                            style={[
                                optionStyles.optionButton,
                                { backgroundColor: 'rgba(0,0,0,0.3)', }
                            ]}
                            android_ripple={{ color: colors.readioBrown }}
                            onPress={() => setSelectingVoice(true)}
                        >
                            <Text allowFontScaling={false} style={optionStyles.optionText}>Narrator</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                                <Text allowFontScaling={false} style={[optionStyles.optionText, { color: iconColor }]}>{selectedVoiceName}</Text>
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
                <View style={{ marginHorizontal: 15 }}>
                    <VoiceSelector />
                </View>
            </>
        )

    };

    const ModalForVoices = () => {
        const { height: modalHeight } = Dimensions.get('window');
    
        const [localVoiceName, setLocalVoiceName] = React.useState('');
        const [localVoiceId, setLocalVoiceId] = React.useState('');
        const [localImg, setLocalImg] = React.useState<any>();
        const [localVoiceProvider, setLocalVoiceProvider] = React.useState('');
    
        const setSelectedVoice = (voice: any) => {
            setLocalVoiceName(voice.label);
            setLocalVoiceId(voice.value);
            setLocalVoiceProvider(voice.provider);
            setLocalImg(voice.image);
        };
    
        const doneChoosingVoice = () => {
            setSelectedVoiceId(localVoiceId);
            setSelectedVoiceName(localVoiceName);
            setSelectedVoiceProvider(localVoiceProvider);
            setSelectingVoice(false);
        };
    
        const ModalStyles = {
            modalBackdrop: {
                flex: 1,
                justifyContent: 'center',
            },
            modalContent: {
                backgroundColor: 'rgba(45, 28, 22, 1)',
                borderRadius: 20,
                padding: 20,
                position: 'absolute',
                alignSelf: 'center',
                height: '73%',
                width: '100%',
                bottom: 0,
            },
            modalTitle: {
                fontSize: 24,
                fontFamily: readioBoldFont,
                color: colors.readioWhite,
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
            radioButton: {
                width: 20,
                height: 20,
                borderRadius: 10,
                alignItems: 'center' as any,
                justifyContent: 'center' as any,
                marginRight: 10,
            },
            labelCircle: {
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                alignItems: 'center' as any,
                justifyContent: 'center' as any,
            },
        };
    
        useEffect(() => {
            if (voiceOptions.length > 0) {
                setSelectedVoice(voiceOptions[0]);
            }
        }, [voiceOptions]);
    
        return (
            <Modal visible={selectingVoice} transparent animationType="none">
                    <Animated.View entering={FadeInUp.duration(300)} style={ModalStyles.modalContent as any}>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text allowFontScaling={false} style={ModalStyles.modalTitle}>Choose Narrator</Text>
                            <Text style={[ModalStyles.modalItemSubtext, { fontSize: 16, fontWeight: 'bold', fontFamily: readioBoldFont }]} onPress={() => doneChoosingVoice()}>
                                Done
                            </Text>
                        </View>

                        <LotusGap gapNumber={10} backgroundColor="transparent"/>
    
                        <View style={{ width: '100%', height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                            <View style={{borderRadius: 200, overflow: 'hidden', width: 150, height: 150}}>
                            <Image
                                source={localImg}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    resizeMode: 'contain',
                                    zIndex: 100,
                                    marginBottom: 10
                                }}
                            />
                            </View>
                            <Text allowFontScaling={false} style={{
                                color: colors.readioWhite,
                                fontFamily: readioBoldFont,
                                fontSize: 18,
                                marginTop: 10
                            }}>{localVoiceName}</Text>
                        </View>
    
                        <View style={{ paddingHorizontal: 20, flexDirection: 'column', gap: 10 }}>
                            {optionsForModal.map((voice: any) => (
                                <Pressable
                                    onPress={() => setSelectedVoice(voice)}
                                    key={voice.value}
                                    style={[
                                        ModalStyles.modalItem,
                                        {
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            backgroundColor: localVoiceId === voice.value ? 'rgba(255, 126, 54, 0.2)' : 'transparent',
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: localVoiceId === voice.value ? colors.readioOrange : 'rgba(255, 255, 255, 0.1)',
                                        }
                                    ]}
                                >
                                <View style={{flexDirection: 'row',}}>
                                    <View style={[ModalStyles.radioButton, { backgroundColor: localVoiceId === voice.value ? colors.readioOrange : 'rgba(255, 255, 255, 0.1)' }]}>
                                        {localVoiceId === voice.value && <FontAwesome name="check" size={12} color={colors.readioWhite} />}
                                    </View>
                                    <Text allowFontScaling={false} style={[ModalStyles.modalItemText, {fontWeight: 'bold', fontFamily: localVoiceId === voice.value ? readioBoldFont : readioRegularFont}]}>{voice.label}</Text>
                                </View>

                                {voice.label === 'Stic' && (
                                    <>
                                    <PremiumBadge/>
                                    </>
                                )}
                                </Pressable>
                            ))}
                        </View>
                    </Animated.View>
            </Modal>
        );
    };

    const ModalInputSection = () => {
        const [isKeyboardActive, setIsKeyboardActive] = React.useState(false);

        const [submittingArticle, setSubmittingArticle] = React.useState(false)
        const [modalForm, setModalForm] = React.useState({
            query: '',
            provider: '',
            id: '',
        })

        const ready = Boolean(modalForm?.query.length > 0 && selectedVoiceId);


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
                backgroundColor: ready ? colors.readioOrange : 'rgba(255, 255, 255, 0.1)',
                borderColor: ready ? 'transparent' : 'rgba(255, 255, 255, 0.3)',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
            },
            submitIcon: {
                color: ready ? `${colors.readioWhite}` : 'rgba(255, 255, 255, 0.3)',
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

        const D_I_Y_ModeSelection = () => {
            
            const handleModeChange = () => {
                // Keyboard.dismiss();
                    setIsDIYMode(!isDIYMode);
                    setSelectedVoiceId(null);
                    setSelectedVoiceName('---');
                    setSelectedVoiceProvider('');
            };
        
            return (
                <Pressable
                    style={[
                        styles.modeButton,
                        isDIYMode ? styles.modeButtonActive : styles.modeButtonInactive
                    ]}
                    onPress={handleModeChange}
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

        // Only update form when wantsToMakeAnArticle becomes true
        const handleArticleSubmission = async () => {
            await setStateAsync(setSubmittingArticle, false, 'backendData');
            console.log('Submitting article --- setting submittingArticle to true');

            await setStateAsync(
                setForm,
                (prevForm: any) => ({
                    ...prevForm,
                    query: modalForm.query,
                    provider: selectedVoiceProvider as string,
                    id: selectedVoiceId as string,
                }),
                'backendData'
            );
            console.log('Submitting article --- setting form to the form', );

            await setStateAsync(
                setModalForm,
                {
                    query: '',
                    provider: '',
                    id: '',
                },
                'backendData'
            );
            console.log('Submitting article --- setting modalForm to empty object');

            await setStateAsync(setArticleGenerationStatus, 'generating', 'backendData');
            console.log('Submitting article --- setting articleGenerationStatus to generating');

            if (isDIYMode === true) {
                await setStateAsync(setWantsToMakeA_D_I_Y_Article, true, 'backendData');
                return;
            }
            
            if (isDIYMode === false) {
                await setStateAsync(setWantsToMakeAnArticle, true, 'backendData');
                return;
            }

            console.log('Submitting article --- setting wantsToMakeAnArticle to true');

        };

        const handleSubmit = async () => {

            await handleArticleSubmission();
            await setStateAsync(setHasTheArticleStartedGenerating, true, 'backendData');
            console.log('article submitted')


        }

        useEffect(() => {
            if (hasTheArticleStartedGenerating ) {
                navigation.navigate('(tabs)', {
                    screen: '(library)',
                    params: {
                        screen: 'lib'
                    }
                });
                setHasTheArticleStartedGenerating(false);
            }
        }, [hasTheArticleStartedGenerating])

        // Keyboard stuff
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

        return (
            <>
                <View style={[styles.inputContainer]}>
                    <TextInput
                        onChangeText={(text) => setModalForm({ ...modalForm, query: text })}
                        value={modalForm.query}
                        multiline
                        // autoFocus
                        numberOfLines={5}
                        placeholder={placeholderMessege}
                        style={[styles.inputField, {
                        }]}
                        placeholderTextColor="rgba(255,255,255,0.5)"
                    />

                    <View style={styles.actionsWrapper}>

                        <View style={styles.leftActionsWrapper}>
                            <D_I_Y_ModeSelection />
                        </View>

                        <Pressable
                            disabled={ready === false}
                            // disabled
                            onPress={() => (articleGenerationStatus === 'done' ? handleReset() : handleSubmit())}
                            style={styles.submitButton}
                        >
                            <Text style={[styles.modeButtonText, styles.modeButtonTextActive]}>
                                {articleGenerationStatus === 'done' ? 'Reset' : ''}
                            </Text>
                            <FontAwesome
                                name={articleGenerationStatus === 'done' ? 'refresh' : 'chevron-right'}
                                style={[styles.submitIcon, { marginLeft: 5 }]}
                            />
                        </Pressable>

                    </View>

                </View>
            </>
        )

    }

    useEffect(() => {

        if(isDIYMode){
            setModalMessage('Write your own article,\n Customize with your choice of narrator.')
            setPlaceholderMessage('What you put here will be narrated in the voice of your chose narrator...')
        }

        if(!isDIYMode){
            setModalMessage('Transform your ideas into narrated articles, \n Customized with your choice of narrator and topic.')
            setPlaceholderMessage('Type your query here...')
        }

    }, [modalMessege, isDIYMode])



    return (
        <>

            <View style={{width: '100%', height: '100%', position: 'absolute', backgroundColor: colors.readioBrown, zIndex: -2}}></View>
            <Animated.View 
                entering={FadeInUp.duration(300)}
                exiting={FadeOutDown.duration(300)}
                style={{ position: 'absolute', width: '100%', height: '100%', display:'flex', zIndex: -1, opacity: 0.618 }}
            >
                <View style={{position: 'relative', overflow: 'hidden', width: '100%', height: '100%', display: 'flex', flexDirection: 'column'}}>   
                {/* TODO Video --- soon to be depreciated migrate to expo-video */}
                    <Video
                        source={ImageAssets.brownGradientVid}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay
                        isLooping
                        isMuted
                        style={{ 
                            width: '100%', height: '100%',
                            position: 'absolute',
                            top: 0,
                            opacity: 1,
                            // zIndex: -2,
                        }}
                    />
                    <LinearGradient
                        colors={[
                        // colors.readioBrown,
                        'rgba(45, 28, 22, 0)',
                        'rgba(45, 28, 22, 0)',
                        'rgba(45, 28, 22, 0)',
                        colors.readioBrown,
                        ]}
                        locations={[0, 0.25, 0.2, 1]}
                        start={{ x: 0.5, y: 0.1 }}
                        end={{ x: 0.5, y: 1 }}
                        style={{
                        width: '100%',
                        height: '80%',
                        position: 'absolute',
                        bottom: 0,
                        opacity: 1,
                        zIndex: 1,
                        }}
                    />
                </View>
            </Animated.View>

            <View style={styles.overlayContainer}>

                <KeyboardAvoidingView
                    behavior="padding"
                    style={{ height: '100%' }}
                >
                        <View
                            style={[styles.modalContent, {
                                // backgroundColor: 'rgba(45, 28, 22, 1)',
                                minHeight: 300,
                                width: '100%',
                                position: 'relative',
                                backgroundColor: 'transparent',
                                zIndex: 2,
                            }]}
                        >

                            <DismissModalSymbol color={colors.readioWhite} />

                            <View style={{ gap: 20 }}>
                                <LotusGap backgroundColor="transparent" gapNumber={50} />

                                <ModalHeader />
                                <Text style={{ color: colors.readioWhite, textAlign: 'center', marginHorizontal: 15, fontFamily: readioRegularFont }}>
                                    {modalMessege}
                                </Text>
                            </View>

                            <View style={{ gap: 50 }}>
                                <VoiceOptions />
                                <ModalInputSection />
                                <ModalForVoices />
                            </View>

                        </View>
                </KeyboardAvoidingView>

            </View>

        </>
    )

}

const styles = StyleSheet.create({
    overlayContainer: {
        // paddingHorizontal: 16,
        // backgroundColor: colors.readioWhite,
        backgroundColor: 'transparent',
        height: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    modalBackdrop: {
        height: '100%',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'flex-end',
        zIndex: 1000,
        backgroundColor: 'transparent',
    },
    modalContent: {
        // backgroundColor: 'rgba(45, 28, 22, 0.9)',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        borderRadius: 20,
        paddingTop: 20,
        height: '100%',
        width: '100%',
        position: 'relative',
        zIndex: 1001
    },
})