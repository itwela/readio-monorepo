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

export default function CreateArticle() {

    // Define admin limit locally for display purposes, or import if available from context/constants
    // This should match the value in lotusUserContext.tsx for consistency
    const ARTICLE_LIMIT_ADMIN_DISPLAY = 1000000;

    // CONTROLS IF THE MODEL WILL SHOW OR NOT
    const { ProgressQueue, setGenerationStarted, setProgressMessage } = useProgressQueue()
    const { setNeedsToRefresh } = useLotusUser()
    const { user } = useLotusUser()
    const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
    const [hasTheArticleStartedGenerating, setHasTheArticleStartedGenerating] = React.useState(false)
    const [selectingVoice, setSelectingVoice] = React.useState(false)
    const [isKeyboardActive, setIsKeyboardActive] = React.useState(false);
    const { successFeedback, mediumFeedback, stepMilestone, lightFeedback } = useLotusHaptic();
    const { userIsNotSubscribed, userIsOnStarterPlan, userIsAdmin, userIsOnPremiumPlan } = useLotusUser();

    const setSelectedVoice = (voice: any) => {
        console.log('voice', voice)
        // setSelectedVoiceName(voice.label)
        // setSelectedVoiceId(voice.value)
        // setSelectedVoiceProvider(voice.provider)
    }



    const {
        form, setForm,
        voiceOptions, diyVoiceOptions, diyVoiceOptionsAdmin, setWantsToMakeA_D_I_Y_Article,
        setIsArticleModalVisible, setArticleGenerationStatus,
        setWantsToMakeAnArticle, articleGenerationStatus,
        rFA, setRFA,
        setSelectedVoiceId, setSelectedVoiceName, setSelectedVoiceProvider,
        isDIYMode, setIsDIYMode, selectedVoiceId, selectedVoiceName, selectedVoiceProvider,
        iconColor, placeholderMessege, setPlaceholderMessage, modalMessege, setModalMessage
    } = useLotusModal();
    const optionsForModal = isDIYMode && !userIsAdmin ? diyVoiceOptions : isDIYMode && userIsAdmin ? diyVoiceOptionsAdmin : voiceOptions
    // const optionsForModal = voiceOptions


    const handleReset = () => {
        try {

            // Reset progress queue and related messages
            ProgressQueue.resetQueue();
            setProgressMessage('');
            setGenerationStarted(false); // From useProgressQueue

            // Reset modal specific states from useLotusModal
            setArticleGenerationStatus(''); // Explicitly reset if not covered by ProgressQueue
            setForm({ query: '', provider: '', id: '' }); // Reset entire form to initial state
            setWantsToMakeAnArticle(false);
            setWantsToMakeA_D_I_Y_Article(false); // Reset DIY article intention
            // Reset voice selection to default (assuming you have a default or initial state)
            // If voiceOptions[0] is your default:
            if (voiceOptions.length > 0) {
                setSelectedVoiceId(voiceOptions[0].value);
                setSelectedVoiceName(voiceOptions[0].label);
                setSelectedVoiceProvider(voiceOptions[0].provider);
            } else { // Or to a completely null/empty state
                setSelectedVoiceId(null);
                setSelectedVoiceName('---'); // Or your default placeholder
                setSelectedVoiceProvider('');
            }
            setIsDIYMode(false); // Reset DIY mode to default (e.g., false)
            // Reset placeholder and modal messages if they change based on mode
            setPlaceholderMessage('Type your query here...'); // Default placeholder
            setModalMessage('Transform your ideas into narrated articles'); // Default modal message
            
            // Reset local component state if necessary (though modalForm is reset in ModalInputSection)
            // setHasTheArticleStartedGenerating(false); // This seems to be handled by navigation
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
                            onPress={() => { setSelectingVoice(true); lightFeedback(); }}
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
                <View style={{}}>
                    <InspiringPrompts />
                    <View style={{ marginHorizontal: 15 }}>
                        <VoiceSelector />
                    </View>
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
                        <Text  allowFontScaling={false} style={[ModalStyles.modalItemSubtext, { fontSize: 16, fontWeight: 'bold', fontFamily: readioBoldFont }]} onPress={() => doneChoosingVoice()}>
                            Done
                        </Text>
                    </View>

                    <LotusGap gapNumber={10} backgroundColor="transparent" />

                    <View style={{ width: '100%', height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                        <View style={{ borderRadius: 200, overflow: 'hidden', width: 150, height: 150 }}>
                            <LotusImageWithLoader
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
                        {userIsAdmin && (
                            <>
                                {optionsForModal.map((voice: any) => (
                                    <Pressable
                                        onPress={() => { setSelectedVoice(voice); lightFeedback(); }}
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

                                        {voice.label === 'Stic' && userIsAdmin && (
                                            <>
                                                <PremiumBadge subTier="admin" />
                                            </>
                                        )}
                                    </Pressable>
                                ))}
                            </>
                        )}

                        {user?.subscription_plan === 'starter' && !userIsAdmin && (
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

                        {user?.subscription_plan === 'premium' && isDIYMode === false && !userIsAdmin && (
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
                                                    // e.g., a toast message or haptic warning
                                                    console.log("Stic voice limit reached.");
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
                                            {isOverSticLimit && <Text  allowFontScaling={false} style={{ color: 'grey', fontSize: 10 }}>Limit Reached</Text>}
                                        </Pressable>
                                    );
                                })}
                            </>
                        )}

                        {user?.subscription_plan === 'premium' && isDIYMode === true && !userIsAdmin && (
                            <>
                                {optionsForModal.map((voice: any) => {
                                     // In DIY mode for premium non-admins, Stic voice is not available anyway based on previous logic.
                                     // If you wanted to show it as "limit reached" even if it's filtered out by optionsForModal,
                                     // you'd need to adjust how optionsForModal is populated or handle Stic separately here.
                                     // For now, assuming optionsForModal already filters Stic out for this case.
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

    const ModalInputSection = () => {

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
                flexDirection: 'column',
                gap: 15,
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginHorizontal: 15,
                paddingHorizontal: 15,
                paddingVertical: 15,
                // bottom: 25,
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

        const D_I_Y_ModeSelection = () => {

            const handleModeChange = () => {
                // Keyboard.dismiss();
                setIsDIYMode(!isDIYMode);
                setSelectedVoiceId(null);
                setSelectedVoiceName('---');
                setSelectedVoiceProvider('');

                mediumFeedback();
            };

            return (
                <Pressable
                    style={[
                        styles.modeButton,
                        isDIYMode ? styles.modeButtonActive : styles.modeButtonInactive
                    ]}
                    onPress={handleModeChange}
                >
                    <Text  allowFontScaling={false} style={[
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
            console.log('Submitting article --- setting form to the form',);

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
            if (hasTheArticleStartedGenerating) {
                navigation.navigate('(tabs)', {
                    screen: '(library)',
                    params: {
                        screen: 'lib'
                    }
                });
                setHasTheArticleStartedGenerating(false);
            }
        }, [hasTheArticleStartedGenerating])


        return (
            <>
                <View style={[styles.inputContainer]}>
                    <TextInput
                        onChangeText={(text) => setModalForm({ ...modalForm, query: text })}
                        value={modalForm.query}
                        multiline
                        numberOfLines={5}
                        placeholder={placeholderMessege}
                        style={styles.inputField}
                        placeholderTextColor="rgba(255,255,255,0.5)"
                    />

                    <View style={styles.actionsWrapper}>

                        <View style={styles.leftActionsWrapper}>
                            <D_I_Y_ModeSelection />
                        </View>

                        <Pressable
                            disabled={ready === false}
                            // disabled
                            onPress={() => {
                                if (articleGenerationStatus === 'done') {
                                    handleReset(); mediumFeedback();
                                } else {
                                    handleSubmit(); successFeedback();
                                }
                            }}
                            style={styles.submitButton}
                        >
                            <Text  allowFontScaling={false} style={[styles.modeButtonText, styles.modeButtonTextActive]}>
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

        if (isDIYMode) {
            setModalMessage('Write your own article,\n Customize with your choice of narrator.')
            setPlaceholderMessage('What you put here will be narrated in the voice of your chose narrator...')
        }

        if (!isDIYMode) {
            setModalMessage('Transform your ideas into narrated articles')
            setPlaceholderMessage('Type your query here...')
        }

    }, [modalMessege, isDIYMode])


    return (
        <>

            <View style={{ width: '100%', height: '100%', position: 'absolute', backgroundColor: colors.readioBrown, zIndex: -2, }}></View>
            <Animated.View
                entering={FadeInUp.duration(300)}
                exiting={FadeOutDown.duration(300)}
                style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', zIndex: -1, opacity: 0.618, }}
            >
                <View style={{  position: 'relative', overflow: 'hidden', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
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

            <View style={mainCreateModalStyles.overlayContainer}>

                <KeyboardAvoidingView
                    behavior='position'
                    style={{ height: '100%', backgroundColor: 'transparent' }}
                >
                    <View
                        style={[mainCreateModalStyles.modalContent, {
                            // backgroundColor: 'rgba(45, 28, 22, 1)',
                            height: '100%',
                            width: '100%',
                            position: 'relative',
                            backgroundColor: 'transparent',
                            zIndex: 2,
                        }]}
                    >

                            {/* NOTE TOP HEADER CONTAINER*/}
                            <View style={{ width: '100%', flexDirection: 'column', paddingHorizontal: 15, backgroundColor: 'transparent' }}>
                                
                                <View style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 15, paddingTop: 10, alignContent: 'center', }}>
                                {/* <View /> */}
                                <DismissModalSymbol color={colors.readioWhite} />
                                <LotusGap backgroundColor="transparent" gapNumber={80} />
                                <View>
                                    {!userIsAdmin && (
                                    <View style={{ backgroundColor: colors.readioBlack, padding: 5, borderRadius: 5, alignItems: 'center', justifyContent: 'center'}}>
                                        <Text  allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont, fontSize: 12 }}>
                                            {user.article_generation_runs || 0} /
                                            {user.article_generation_runs_limit === ARTICLE_LIMIT_ADMIN_DISPLAY
                                                ? 'Unlimited'
                                                : user.article_generation_runs_limit === 0 && user.user_role !== 'admin' // Handle case where limit might be 0 for non-admin blank plan
                                                    ? '0'
                                                    : user.article_generation_runs_limit || 0
                                            }
                                        </Text>

                                    </View>
                                    )}
                                </View>
                                </View>

                                {/* NOTE CREATE AND TEXT UNDER IT */}
                                <View style={{ gap: 20, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', alignContent: 'center', }}>
                                    
                                    {/* NOTE -- CREATE */}
                                    <ModalHeader />

                                    {/* NOTE -- TRANSFORM YOUR IDEAS INTO NARRATED ARTICLES... */}
                                    <Text  allowFontScaling={false} style={{
                                        color: colors.readioWhite,
                                        textAlign: 'center',
                                        marginHorizontal: 15,
                                        fontFamily: readioRegularFont,
                                        display: isKeyboardActive ? 'none' : 'flex'
                                    }}>
                                        {modalMessege}
                                    </Text>
                                </View>

                            </View>

                            

                            {/* NOTE BOTTOM FOOTER CONTAINER*/}
                        <View style={{ gap: 40 }}>
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

const mainCreateModalStyles = StyleSheet.create({
    overlayContainer: {
        // paddingHorizontal: 16,
        // backgroundColor: colors.readioWhite,
        backgroundColor: 'transparent',
        // height: '100%',
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
        // backgroundColor: 'rgba(45, 28, 22, 0.9)',
        // justifyContent: 'space-between',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        paddingTop: 20,
        // height: '100%',
        height: 2000,
        width: '100%',
        position: 'relative',
        zIndex: 1001,
    },
})
