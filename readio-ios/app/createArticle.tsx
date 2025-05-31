import LotusGap from "@/components/LotusGap";
import LotusImageWithLoader from "@/components/LotusImageWithLoader";
import { DismissModalSymbol } from "@/components/LotusModals/DismissModalSymbol";
import { PremiumBadge } from "@/components/LotusPremiumBadge";
import { ImageAssets } from "@/constants/imageAssets";
import { colors, giantFont, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { setStateAsync } from "@/constants/utilityFunctions";
import { useProgressQueue } from "@/handleArticleGenerations/processingQueue";
import { useLotusHaptic } from "@/helpers/providers/lotusHapticProvider";
import { useLotusModal } from "@/helpers/providers/lotusModalContext";
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import { useLotusCreateArticle } from "@/helpers/providers/lotusCreateArticleProvider";
import { utilsStyles } from "@/styles";
import { RootNavigationProp } from "@/types/type";
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Dimensions, KeyboardAvoidingView, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";

import InspiringPrompts from "@/components/InspiringPrompts";

// Define admin limit locally for display purposes, or import if available from context/constants
// This should match the value in lotusUserContext.tsx for consistency
const ARTICLE_LIMIT_ADMIN_DISPLAY = 1000000;

// NOTE Style for the main modal component
const mainCreateModalStyles = StyleSheet.create({
    overlayContainer: {
        backgroundColor: 'transparent',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
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
        justifyContent: 'space-between',
        // backgroundColor: 'transparent',
        paddingTop: 20,
        // height: 2000,
        // width: '100%',
        // position: 'relative',
        // zIndex: 1001,
        height: '100%',
        width: '100%',
        position: 'relative',
        backgroundColor: 'transparent',
        zIndex: 2,
    },
});

// Main CreateArticle component
export default function CreateArticle() {

    // SECTION - MAIN MODAL STUFF xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

    // NOTE - MAIN MODAL CONSTS ==================================================
    const { ProgressQueue, setGenerationStarted, setProgressMessage } = useProgressQueue();
    const { setNeedsToRefresh } = useLotusUser();
    const { user, userIsAdmin } = useLotusUser();
    const navigation = useNavigation<RootNavigationProp>();
    const [hasTheArticleStartedGenerating, setHasTheArticleStartedGenerating] = React.useState(false);
    const [isKeyboardActive, setIsKeyboardActive] = React.useState(false);
    const { successFeedback, mediumFeedback, stepMilestone, lightFeedback } = useLotusHaptic();
    const {  
        iconColor
    } = useLotusModal();

    // Use the new CreateArticle provider
    const {
        articleQuery,
        setArticleQuery,
        isDIYMode,
        toggleDIYMode,
        articleGenerationStatus: providerArticleGenerationStatus,
        placeholderMessage: providerPlaceholderMessage,
        modalMessage: providerModalMessage,
        isVoiceSelectionModalOpen,
        setIsVoiceSelectionModalOpen,
        selectedVoiceId,
        selectedVoiceName,
        setSelectedVoiceName,
        selectedVoiceProvider: providerSelectedVoiceProvider,
        selectedVoiceImage,
        tempSelectedVoiceInModal,
        currentAvailableVoiceOptions,
        isSubmissionReady,
        articleGenerationRuns,
        articleGenerationRunsLimit,
        startArticleSubmission,
        resetArticleCreationProcess,
        openVoiceSelectionModal,
        setSelectedVoiceId,
        setSelectedVoiceProvider,
    } = useLotusCreateArticle();

    const optionsForModal = currentAvailableVoiceOptions;

    // NOTE - MAIN MODAL FUNCTIONS ================================================
    const handleReset = () => {
        try {
            resetArticleCreationProcess();
        } catch (error) {
            console.error('Error in handleArticleCloseModal:', error);
        } finally {
            setTimeout(() => {
                setNeedsToRefresh?.(false);
            }, 200);
        }
    };

    // REVIEW - STEP 1 OF ARTICLE SUBMIT PROCESS
    const handleSubmit = async (query: string) => {
        await startArticleSubmission();
        await setStateAsync(setHasTheArticleStartedGenerating, true, 'backendData');
    };

    // SECTION - INPUT STUFF xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

    // NOTE - MODAL INPUT CONSTS ======================================================
    const [modalForm, setModalForm] = React.useState({
        query: '',
        provider: '',
        id: '',
    });
    const ready = Boolean(modalForm?.query.length > 0 && selectedVoiceId);
    const handleModeChange = () => {
        toggleDIYMode();
    };


    // SECTION - STYLES xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

    // NOTE - MODAL HEADER STYLES ===============================================
    const modalHeaderStyles = StyleSheet.create({
        headerWrapper: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            alignContent: 'center',
            width: '100%',
            gap: 15,
            backgroundColor: 'transparent',
        },
        headerContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
            position: 'relative',
            height: 30,
            backgroundColor: 'transparent',
        },
        headerHeading: {
            color: colors.readioWhite,
            fontFamily: giantFont,
            fontSize: 16,
            backgroundColor: 'transparent',
            textAlign: 'center',
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

    // NOTE - VOICE OPTIONS STYLES ===============================================
    const optionStyles = StyleSheet.create({
        optionButton: {
            height: 48,
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
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

    const inputStyles = StyleSheet.create({
        inputContainer: {
            backgroundColor: 'rgba(0,0,0,0.3)',
            flexDirection: 'column',
            gap: 15,
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginHorizontal: 15,
            paddingHorizontal: 15,
            paddingVertical: 15,
            bottom: 25,
            borderRadius: 15,
        },
        inputField: {
            color: colors.readioWhite,
            width: '100%',
            fontSize: 16,
            paddingHorizontal: 10,
            marginRight: 10,
            minHeight: 60,
            maxHeight: isKeyboardActive ? 80 : 160,
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
            color: ready ? `${colors.readioDustyWhite}` : 'rgba(255, 255, 255, 0.3)',
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


    // TODO Modal for Voices Component
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
            console.log('voice', voice)
        };
        
        const doneChoosingVoice = () => {
            setSelectedVoice(localVoiceId);
            setSelectedVoiceName(localVoiceName);
            setSelectedVoiceId(localVoiceId);
            setSelectedVoiceProvider(localVoiceProvider);
            setIsVoiceSelectionModalOpen?.(false);
            lightFeedback();
            
            console.log('provider', localVoiceProvider)
            console.log('voice', localVoiceId)
           return
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

        // useEffect(() => {
        //     if (tempSelectedVoiceInModal) {
        //         setSelectedVoice(tempSelectedVoiceInModal);
        //     } else if (currentAvailableVoiceOptions.length > 0) {
        //         setSelectedVoice(currentAvailableVoiceOptions[0]);
        //     }
        // }, [tempSelectedVoiceInModal, currentAvailableVoiceOptions]);

        return (
            <Modal visible={isVoiceSelectionModalOpen} transparent animationType="none">
                <Animated.View entering={FadeInUp.duration(300)} style={ModalStyles.modalContent as any}>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text allowFontScaling={false} style={ModalStyles.modalTitle}>Choose Narrator</Text>
                        <Text allowFontScaling={false} style={[ModalStyles.modalItemSubtext, { fontSize: 16, fontWeight: 'bold', fontFamily: readioBoldFont }]} onPress={() => doneChoosingVoice()}>
                            Done
                        </Text>
                    </View>

                    <LotusGap gapNumber={10} backgroundColor="transparent" />

                    <View style={{ width: '100%', height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                        <View style={{ borderRadius: 200, overflow: 'hidden', width: 150, height: 150 }}>
                            <LotusImageWithLoader
                                source={localImg || currentAvailableVoiceOptions[0].image}
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
                        }}>{localVoiceName || currentAvailableVoiceOptions[0].label}</Text>
                    </View>

                    <View style={{ paddingHorizontal: 20, flexDirection: 'column', gap: 10 }}>
                        {user?.user_role === 'admin' && ( 
                            <>
                                {optionsForModal.map((voice: any) => (
                                    <Pressable
                                        onPress={() => { setSelectedVoice(voice); }}
                                        // onPress={() => { setSelectedVoice(voice); lightFeedback(); }}
                                        key={voice.value}
                                        style={[
                                            ModalStyles.modalItem,
                                            {
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                backgroundColor: localVoiceId === voice.value ? 'rgba(255, 126, 54, 0.2)' :
                                                    'transparent',
                                                borderRadius: 12,
                                                borderWidth: 1,
                                                borderColor: localVoiceId === voice.value ? colors.readioOrange : 'rgba(255, 255, 255, 0.1)',
                                            }
                                        ]}
                                    >
                                        <View style={{ flexDirection: 'row', }}>
                                            <View style={[ModalStyles.radioButton, { backgroundColor: localVoiceId === voice.value ? colors.readioOrange : 'rgba(255, 255, 255, 0.1)' }]}>
                                                {localVoiceId === voice.value && <FontAwesome name="check" size={12} color={colors.readioWhite} />}
                                            </View>
                                            <Text allowFontScaling={false} style={[ModalStyles.modalItemText, { fontWeight: 'bold', fontFamily: readioBoldFont }]}>{voice.label}</Text>
                                        </View>

                                        {voice.label === 'Stic' && user?.user_role === 'admin' && (
                                            <>
                                                <PremiumBadge subTier="admin" />
                                            </>
                                        )}
                                    </Pressable>
                                ))}
                            </>
                        )}

                        {user?.subscription_plan === 'starter' && user?.user_role !== 'admin' && (
                            <>
                                {optionsForModal
                                    .filter((voice: any) => voice.label !== 'Stic') // Filter out 'stic' first
                                    .map((voice: any) => (
                                        <Pressable
                                            onPress={() => { setSelectedVoice(voice); lightFeedback(); }}
                                            key={voice.value} // Key goes on the outermost element returned by map
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
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={[ModalStyles.radioButton, { backgroundColor: localVoiceId === voice.value ? colors.readioOrange : 'rgba(255, 255, 255, 0.1)' }]}>
                                                    {localVoiceId === voice.value && <FontAwesome name="check" size={12} color={colors.readioWhite} />}
                                                </View>
                                                <Text allowFontScaling={false} style={[ModalStyles.modalItemText, { fontWeight: 'bold', fontFamily: readioBoldFont }]}>{voice.label}</Text>
                                            </View>
                                        </Pressable>
                                    ))}
                            </>
                        )}

                        {user?.subscription_plan === 'premium' && isDIYMode === false && user?.user_role !== 'admin' && (
                            <>
                                {optionsForModal.map((voice: any) => {
                                    const isSticVoice = voice.label === 'Stic';
                                    const usageLimit = 3600; // 1 hour in seconds
                                    const sticUsageSeconds = user?.stic_voice_usage_seconds || 0;
                                    const isOverSticLimit = isSticVoice && sticUsageSeconds >= usageLimit;

                                    return (
                                        <Pressable
                                            onPress={() => {
                                                if (!isOverSticLimit) {
                                                    setSelectedVoice(voice);
                                                    lightFeedback();
                                                } else {
                                                    // Optionally, provide feedback that the limit is reached
                                                    return;
                                                    // console.log("Stic voice limit reached.");
                                                }
                                            }}
                                            key={voice.value}
                                            disabled={isOverSticLimit} // Disable pressable if over limit
                                            style={[
                                                ModalStyles.modalItem,
                                                {
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    backgroundColor: localVoiceId === voice.value && !isOverSticLimit ? 'rgba(255, 126, 54, 0.2)' : 'transparent',
                                                    borderRadius: 12,
                                                    borderWidth: 1,
                                                    borderColor: localVoiceId === voice.value && !isOverSticLimit ? colors.readioOrange : 'rgba(255, 255, 255, 0.1)',
                                                    opacity: isOverSticLimit ? 0.5 : 1, // Visually indicate disabled state
                                                }
                                            ]}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={[ModalStyles.radioButton, { backgroundColor: localVoiceId === voice.value && !isOverSticLimit ? colors.readioOrange : 'rgba(255, 255, 255, 0.1)' }]}>
                                                    {localVoiceId === voice.value && !isOverSticLimit && <FontAwesome name="check" size={12} color={colors.readioWhite} />}
                                                </View>
                                                <Text allowFontScaling={false} style={[ModalStyles.modalItemText, { fontWeight: 'bold', fontFamily: readioBoldFont, color: isOverSticLimit ? 'grey' : colors.readioWhite }]}>{voice.label}</Text>
                                            </View>
                                            {isOverSticLimit && <Text allowFontScaling={false} style={{ color: 'grey', fontSize: 10 }}>Limit Reached</Text>}
                                        </Pressable>
                                    );
                                })}
                            </>
                        )}

                        {user?.subscription_plan === 'premium' && isDIYMode === true && user?.user_role !== 'admin' && (
                            <>
                                {optionsForModal.map((voice: any) => {
                                    if (voice.label === 'Stic') return null; // Explicitly skip Stic if it somehow appears

                                    return (
                                        <Pressable
                                            onPress={() => { setSelectedVoice(voice); lightFeedback(); }}
                                            key={voice.value} // Key goes on the outermost element returned by map
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
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={[ModalStyles.radioButton, { backgroundColor: localVoiceId === voice.value ? colors.readioOrange : 'rgba(255, 255, 255, 0.1)' }]}>
                                                    {localVoiceId === voice.value && <FontAwesome name="check" size={12} color={colors.readioWhite} />}
                                                </View>
                                                <Text allowFontScaling={false} style={[ModalStyles.modalItemText, { fontWeight: 'bold', fontFamily: readioBoldFont }]}>{voice.label}</Text>
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </>
                        )}
                    </View>
                </Animated.View>
            </Modal>
        );
    };


    return (
        <>
            <View style={{ width: '100%', height: '100%', position: 'absolute', backgroundColor: colors.readioBrown, zIndex: -2, }}></View>

            {/* SECTION - BROWN GRADIENT AND VIDEO */}
            <Animated.View
                entering={FadeInUp.duration(300)}
                exiting={FadeOutDown.duration(300)}
                style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', zIndex: -1, opacity: 0.618, }}
            >
                <View style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                        }}
                    />
                    <LinearGradient
                        colors={[
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

            {/* SECTION - MAIN CREATE MODAL */}
            <View style={mainCreateModalStyles.overlayContainer}>
                <KeyboardAvoidingView
                    behavior='position'
                    style={{ height: '100%', backgroundColor: 'transparent' }}
                >
                    <View
                        style={mainCreateModalStyles.modalContent}
                    >
                        {/* SECTION - MAIN MODAL HEADER UI */}
                        <View style={{ width: '100%', flexDirection: 'column', paddingHorizontal: 15, backgroundColor: 'transparent' }}>

                            {/* NOTE -DISMISS TAB AND ARTICLE COUNT */}
                            <View style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 15, paddingTop: 10, alignContent: 'center', }}>
                                <DismissModalSymbol color={colors.readioWhite} />
                                <LotusGap backgroundColor="transparent" gapNumber={50} />
                                <View>
                                    {!userIsAdmin && (
                                        <View style={{ backgroundColor: colors.readioBlack, padding: 5, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont, fontSize: 12 }}>
                                                {articleGenerationRuns || 0} /
                                                {articleGenerationRunsLimit === ARTICLE_LIMIT_ADMIN_DISPLAY
                                                    ? 'Unlimited'
                                                    : articleGenerationRunsLimit === 0 && user.user_role !== 'admin' // Handle case where limit might be 0 for non-admin blank plan
                                                        ? '0'
                                                        : articleGenerationRunsLimit || 0
                                                }
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* NOTE - DIY MODE HEADER */}
                            <View style={{ backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', alignContent: 'center', }}>

                                {/* CREATE */}
                                <View style={modalHeaderStyles.headerWrapper}>
                                    <View style={modalHeaderStyles.headerContainer}>
                                        <View style={{ display: 'flex', flexDirection: 'column', paddingTop: 15 }}>
                                            <Text allowFontScaling={false}
                                                style={modalHeaderStyles.headerSmallText}
                                            >
                                                D.I.Y
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <LotusGap backgroundColor="transparent" gapNumber={10} />

                                {/* NOTE - SPEAK LIFE & TRANSFORM YOUR IDEAS INTO NARRATED ARTICLES... */}
                                <Text allowFontScaling={false} style={{
                                    color: colors.readioWhite,
                                    textAlign: 'center',
                                    marginHorizontal: 15,
                                    fontFamily: readioBoldFont,
                                    fontSize: 60,
                                    lineHeight: 58
                                }}>
                                    Speak Life Into Your Ideas
                                </Text>
                                <LotusGap backgroundColor="transparent" gapNumber={10} />
                                <Text allowFontScaling={false} style={{
                                    color: colors.readioGold,
                                    textAlign: 'center',
                                    marginHorizontal: 15,
                                    fontFamily: readioRegularFont,
                                    fontSize: 18
                                }}>
                                    Turn your thoughts into narrated articles
                                </Text>
                            </View>

                        </View>

                        {/* SECTION - BOTTOM FOOTER CONTAINER */}
                        <View style={{ gap: 40 }}>

                            {/* NOTE - VOICE OPTIONS -------- */}
                            <View style={{}}>
                                <InspiringPrompts />
                                <View style={{ marginHorizontal: 15 }}>
                                    <View>
                                        <Pressable
                                            style={[
                                                optionStyles.optionButton,
                                                { backgroundColor: 'rgba(0,0,0,0.3)', }
                                            ]}
                                            android_ripple={{ color: colors.readioBrown }}
                                            onPress={() => { openVoiceSelectionModal(); }}
                                        >
                                            <Text allowFontScaling={false} style={optionStyles.optionText}>Narrated by</Text>
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
                                </View>
                            </View>

                            {/* NOTE - MODAL INPUT SECTION */}
                            <View style={[inputStyles.inputContainer]}>
                                <TextInput
                                    onChangeText={(text) => {
                                        setModalForm({ ...modalForm, query: text });
                                        setArticleQuery(text);
                                    }}
                                    // REVIEW
                                    // value={modalForm.query}
                                    value={`He found a sticky note on his desk: “Don’t forget why you started. ”He didn’t write it… But it was in her handwriting. She’d been gone for two years.`}
                                    multiline
                                    numberOfLines={5}
                                    placeholder={providerPlaceholderMessage}
                                    style={inputStyles.inputField}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />

                                <View style={inputStyles.actionsWrapper}>

                                    {/* NOTE - D.I.Y MODE BUTTON */}
                                    <View style={inputStyles.leftActionsWrapper}>
                                        <Pressable
                                            style={[
                                                inputStyles.modeButton,
                                                isDIYMode ? inputStyles.modeButtonActive : inputStyles.modeButtonInactive
                                            ]}
                                            onPress={handleModeChange}
                                        >
                                            <Text allowFontScaling={false} style={[
                                                inputStyles.modeButtonText,
                                                isDIYMode ? inputStyles.modeButtonTextActive : null
                                            ]}>
                                                D.I.Y Mode
                                            </Text>
                                        </Pressable>
                                    </View>

                                    <Pressable
                                        disabled={ready === false}
                                        onPress={() => {
                                            if (providerArticleGenerationStatus === 'done') {
                                                handleReset();
                                                mediumFeedback();
                                            } else {
                                                handleSubmit(modalForm.query);
                                                successFeedback();
                                            }
                                        }}
                                        style={inputStyles.submitButton}
                                    >
                                        <Text allowFontScaling={false} style={[inputStyles.modeButtonText, inputStyles.modeButtonTextActive]}>
                                            {providerArticleGenerationStatus === 'done' ? 'Reset' : ''}
                                        </Text>
                                        <FontAwesome
                                            name={providerArticleGenerationStatus === 'done' ? 'refresh' : 'chevron-right'}
                                            style={[inputStyles.submitIcon, { marginLeft: 5 }]}
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            <ModalForVoices />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </>
    );
}
