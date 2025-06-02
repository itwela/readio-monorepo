import { DismissModalSymbol } from "@/components/LotusModals/DismissModalSymbol";
import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import { RootNavigationProp } from "@/types/type";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import LotusGap from "@/components/LotusGap";
import { LotusStatsCard } from "@/components/LotusStatsCard";
import { LotusTabComponent } from "@/components/LotusTabComponent";
import { LotusWaterReminderCard } from "@/components/LotusWaterReminderCard";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { setStateAsync } from "@/constants/utilityFunctions";
import sql from "@/helpers/neonClient";
import { useLotusModal } from "@/helpers/providers/lotusModalContext";
import { useLotusSettings } from "@/helpers/providers/lotusSettingsProvider";
import { router } from 'expo-router';
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { useLotusHaptic } from "@/helpers/providers/lotusHapticProvider";
import { PremiumBadge } from "@/components/LotusPremiumBadge";
import { useRevenueCat } from "@/helpers/providers/RevenueCatProvider";
import ReactNativeModal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { useLotusAuth } from "@/helpers/providers/LotusAuthContext";
import { AdminSyncDashboard } from "@/components/AdminSyncDashboard";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";


export default function ProfileAndSettings() {

    // CONTROLS IF THE MODEL WILL SHOW OR NOT
    const navigation = useNavigation<RootNavigationProp>(); // use typed navigation

    const { user, refreshUserData, userUpvoteCount, userMinutesMeditated, userArticleCount, userStepCount, setNeedsToRefresh, userArticles } = useLotusUser()
    const { logout } = useLotusAuth();
    const { articleGenerationStatus } = useLotusModal()
    const [modalMessage, setModalMessage] = useState("")
    const [isEditModalVisible, setIsEditModalVisible] = useState(false)
    const { userIsNotSubscribed, userIsOnStarterPlan, userIsAdmin, userIsOnPremiumPlan } = useLotusUser();
    const {subscribeToLotus} = useRevenueCat();
    const [isAboutModalVisible, setIsAboutModalVisible] = useState(false)

    // END  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    const [showPass, setShowPass] = useState(false)
    const [doPasswordsMatch, setDoPasswordsMatch] = useState(false)
    const [localGoalNumber, setLocalGoalNumber] = useState(-1)
    const [localFrequencyNumber, setLocalFrequencyNumber] = useState(1)
    const { mediumFeedback, lightFeedback } = useLotusHaptic();

    // 🎯 REACTIVE USER STATS - Live updating from Convex
    const reactiveUserData = useQuery(
        api.users.getUserByDbId,
        user?.user_db_id ? { user_db_id: user.user_db_id } : "skip"
    );
    
    const reactiveUserArticles = useQuery(
        api.articles.getArticlesByUser,
        user?.user_db_id ? { user_db_id: user.user_db_id } : "skip"
    );

    // Use reactive data when available, fallback to context data
    const currentUserUpvotes = reactiveUserData?.upvotes ?? user?.upvotes ?? 0;
    const currentUserSteps = reactiveUserData?.usersteps ?? user?.usersteps ?? 0;
    const currentUserMeditationMinutes = reactiveUserData?.user_meditation_minutes ?? user?.user_meditation_minutes ?? 0;
    const currentUserArticleCount = reactiveUserArticles?.length ?? userArticles?.length ?? 0;

    useEffect(() => {
        if (editForm.password?.length > 5 && editForm?.confirmPassword?.length > 5 && editForm?.password === editForm?.confirmPassword) {
            setDoPasswordsMatch(true)
            // console.log('match')
        } else {
            setDoPasswordsMatch(false)
            // console.log('NO match')
        }
    }, [editForm.confirmPassword, editForm.password])

    useEffect(() => {
        refreshUserData()
    }, [articleGenerationStatus])

    const handleSaveChanges = async () => {
        // console.log(editForm);

        if (editForm?.name !== '' && editForm?.name?.length > 0) {
            // console.log('valid name');
            try {
                const saveNewName = await sql`UPDATE users SET name = ${editForm.name} WHERE name = ${user?.name} AND jwt = ${user?.jwt}`;
                // console.log('successfully updated name');
            } catch (error) {
                // console.log('error', error)
            }
        }

        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm?.email)) {
            // console.log('valid email');
            try {
                const saveNewName = await sql`UPDATE users SET email = ${editForm.email} WHERE name = ${user?.name} AND jwt = ${user?.jwt}`;
                // console.log('successfully updated email');
            } catch (error) {
                // console.log('error', error)
            }
        }

        if (editForm?.password?.length > 5 && editForm?.password?.length > 5 && doPasswordsMatch === true) {
            // console.log('valid password');
            try {
                const saveNewName = await sql`UPDATE users SET pass = ${editForm.password} WHERE name = ${user?.name} AND jwt = ${user?.jwt}`;
                // console.log('success1');
            } catch (error) {
                // console.log('error', error)
            }
        }

        const updateUser = await sql`SELECT * FROM users WHERE jwt = ${user?.jwt}`
        setIsEditModalVisible(false)

    }

    const handleEditCloseModal = () => {
        setModalMessage("");
        setEditForm({ name: '', email: '', password: '', confirmPassword: '' });
        setIsEditModalVisible(false);
        setNeedsToRefresh?.(true)
        setTimeout(() => {
            setNeedsToRefresh?.(false)
        }, 200)
    }

    const [refreshing, setRefreshing] = useState(false); // For refresh control

    const onRefresh = () => {
        setRefreshing(true);
        setNeedsToRefresh?.(true)

        // Add any refresh logic here, such as resetting state or re-fetching data
        setTimeout(() => {
            setRefreshing(false);
            setNeedsToRefresh?.(false)
        }, 1000); // Simulate an async operation
    };


    const handleWaterGoalUpdateLocal = async (newGoal: number) => {

        // console.log('[lotusProfile] old goal number: ', localGoalNumber)

        await setStateAsync(setLocalGoalNumber, newGoal, 'affectsSomethingVisual')

        // console.log('[lotusProfile] new goal number: ', newGoal)

    };

    const handleFrequencyUpdateLocal = (newFrequency: number) => {

        // console.log('[lotusProfile] old frequency number: ', localFrequencyNumber)

        setStateAsync(setLocalFrequencyNumber, newFrequency, 'affectsSomethingVisual')

        // console.log('[lotusProfile] new frequency number: ', newFrequency)

    };

    const ComingSoon = () => {
        return (
            <>
                <View style={{ width: '100%', minHeight: 350, backgroundColor: 'transparent', alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
                    <Text  allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont, fontSize: 40, textAlign: 'center', opacity: 0.5 }}>Soon!</Text>
                </View>
            </>
        )
    }

    const SettingsScreen = () => {

        const handleGoToWelcomeScreen = async () => {
            await logout?.();
            router.navigate('/(auth)/welcome')
        }

        const getLinkOptions = () => {
            const options = [];

            // Conditionally add the "Upgrade" option
            if (user?.subscription_plan === 'blank' || user?.subscription_plan === 'starter') { // Show if user is not on premium
                options.push({
                    title: 'Upgrade',
                    onPress: () => {
                        lightFeedback();
                        subscribeToLotus();
                    },
                });
            }

            options.push(
                {
                   title: 'About',
                   onPress: () => {
                    lightFeedback();
                    setIsAboutModalVisible(true)
                   }
                },
                {
                    title: 'Logout',
                    onPress: () => {
                        lightFeedback();
                        handleGoToWelcomeScreen();
                    },
                }
            );

            return options;
        }

        const currentLinkOptions = getLinkOptions();

        return (
            <>
                <LotusGap backgroundColor="transparent" gapNumber={10} />
                <View style={{ width: '100%', minHeight: 350, paddingHorizontal: 20, backgroundColor: 'transparent', alignSelf: 'center', justifyContent: 'flex-start', }}>

                    {currentLinkOptions.map((option, index) => (
                        <View key={index}>

                            <LotusGap backgroundColor="transparent" gapNumber={10} />
                            <Pressable onPress={() => { option.onPress(); lightFeedback(); }} style={{ borderBottomColor: `${colors.readioWhite}70`, borderBottomWidth: 1, paddingBottom: 10, }}>
                                <Text  allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont, fontSize: 20, opacity: 0.5, }}>{option.title}</Text>
                            </Pressable>

                        </View>
                    ))}

                    {/* 🎯 ADMIN SYNC DASHBOARD - Only visible to admins */}
                    {/* <AdminSyncDashboard style={{ marginTop: 20 }} /> */}

                </View>
            </>
        )
    }

    const allTabs = [
        {
            iconName: "bar-chart" as const,
            content: (
                <LotusStatsCard
                    stats={[
                        { value: currentUserUpvotes, label: 'article\nupvotes', iconName: 'hand.thumbsup.fill' },
                        { value: currentUserSteps, label: 'steps\ntaken', iconName: 'shoeprints.fill' },
                        { value: currentUserMeditationMinutes, label: 'minutes\nmeditating', imgIconName: 'meditationIcon' },
                        { value: currentUserArticleCount, label: 'articles\ngenerated', iconName: 'book.fill' },
                    ]}
                />
            ),
            comingSoon: false,
            key: 'Stats',
            explainerMessage: 'Keep going! Every step, article, and moment of mindfulness brings you closer to your goals.'
        },
        {
            iconName: "drop.fill" as const,
            content: (
                <>
                    <LotusWaterReminderCard
                        localDailyGoalNumber={localGoalNumber}
                        localReminderFrequency={localFrequencyNumber}
                        onUpdateGoal={handleWaterGoalUpdateLocal}
                        onUpdateFrequency={handleFrequencyUpdateLocal}
                    />
                </>
            ),
            comingSoon: true, // This seems to be a feature flag, not related to subscription status for display
            key: 'Goals',
        },
        {
            iconName: "trophy" as const,
            content: <ComingSoon />,
            comingSoon: true,
            key: 'Achievements',
        },
        {
            iconName: "settings" as const,
            content: <SettingsScreen />,
            comingSoon: false, // Assuming settings should always be available
            key: 'Settings',
        },
    ];

    // NOTE PAYWALLED TABS- Conditionally select tabs based on subscription status
    const displayedTabs = userIsNotSubscribed 
        ? allTabs.filter(tab => tab.key === 'Settings') 
        : allTabs;


    return (
        <>
            {/* <DismissModalSymbol color={colors.readioWhite} /> */}

            <LinearGradient style={{ height: '100%' }} colors={[colors.readioBrown, colors.readioBrown,]}>
                <LotusGap backgroundColor="transparent" gapNumber={110} />

                <KeyboardAvoidingView
                    behavior="padding"
                // style={{ height: '100%' }}
                >

                    <View style={[styles.container, { backgroundColor: colors.readioBrown, paddingBottom: 30 }]}>
                        <View style={styles.profileHeader}>
                            <View style={styles.userInfoContainer}>
                                <View style={styles.nameAndBioContainer}>
                                    <View style={{flexDirection: 'column', gap: 15,}}>
                                        <View style={{flexDirection: 'row', gap: 15, alignItems: 'center'}}>
                                        {user?.subscription_plan === 'starter' && (
                                            <PremiumBadge subTier="starter" />
                                        )}

                                        {user?.subscription_plan === 'premium' && (
                                            <PremiumBadge subTier="premium" />
                                        )}
                    
                                        {user?.subscription_plan === 'blank' &&  !userIsAdmin && (
                                            <PremiumBadge subTier="blank" />
                                        )}
                                      
                                        {userIsAdmin && (
                                            <PremiumBadge subTier="admin" />
                                        )}
                                        </View>
                                        <Text  allowFontScaling={false} numberOfLines={1} style={styles.userName}>
                                            {user?.name}
                                        </Text>
                                    </View>
                                    <Text   allowFontScaling={false}  style={styles.userBio} numberOfLines={2}>
                                        Wellness enthusiast & mindfulness practitioner.
                                    </Text>
                                </View>

                                <Animated.View
                                    entering={FadeInUp.duration(300)}
                                    exiting={FadeOutDown.duration(300)}
                                    style={styles.avatarContainer}
                                >
                                    <IconSymbol
                                        name="person.fill"
                                        color={colors.readioOrange}
                                        size={48}
                                        style={styles.avatarIcon}
                                    />
                                </Animated.View>
                            </View>
                        </View>
                    </View>

                    <View
                        style={[styles.modalContent, {
                            // backgroundColor: 'rgba(45, 28, 22, 1)',
                            // height: '100%',
                            flexGrow: 1,
                            width: '100%',
                            position: 'relative',
                            backgroundColor: 'transparent',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 2,
                            justifyContent: 'flex-start',

                        }]}
                    >

                        <LotusTabComponent
                            tabs={displayedTabs}
                        />

                    </View>

                </KeyboardAvoidingView>

                <ReactNativeModal
                    isVisible={isAboutModalVisible}
                    onModalHide={() => setIsAboutModalVisible(false)}
                    style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.readioBrown, padding: 0, margin: 0, }}
                >
                    <SafeAreaView style={{ padding: 20, width: '100%', height: '100%', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                        <Pressable 
                            style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }}
                            onPress={() => setIsAboutModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color={colors.readioWhite} />
                        </Pressable>
                        
                        <Text style={{ color: colors.readioWhite, fontFamily: readioBoldFont, fontSize: 40, }}>About</Text>
                        
                            <ScrollView style={{paddingHorizontal: 20, maxHeight: '70%', marginBottom: 20 }}>
                                <Text style={styles.aboutText}>
                                    The Lotus App is powered by the Law of Rhythmic Intelligence™—the principle that consistent rhythm creates inevitable growth.
                                </Text>
                                
                                <Text style={styles.aboutText}>
                                    We believe wellness isn't just about information—it's about integration.
                                </Text>
                                
                                <Text style={styles.aboutText}>
                                    Not just what you do, but how often. Not just how hard you work, but how well you flow.
                                </Text>
                                
                                <Text style={styles.aboutText}>
                                    We are a digital habitat designed to nourish your mind, body, and spirit through daily rituals, intentional movement, guided reflection, and rhythmic reinforcement.
                                </Text>
                                
                                <Text style={styles.aboutText}>
                                    Because the truth is:
                                </Text>

                                <LotusGap backgroundColor="transparent" gapNumber={10} />
                                
                                <Text style={[styles.aboutText, { color: colors.readioGold, fontFamily: readioBoldFont, marginVertical: 5 }]}>
                                    Your breath has rhythm.
                                </Text>
                                
                                <Text style={[styles.aboutText, { color: colors.readioGold, fontFamily: readioBoldFont, marginVertical: 5 }]}>
                                    Your healing has rhythm.
                                </Text>
                                
                                <Text style={[styles.aboutText, { color: colors.readioGold, fontFamily: readioBoldFont, marginVertical: 5 }]}>
                                    Your transformation has rhythm.
                                </Text>
                                
                                <Text style={[styles.aboutText, { color: colors.readioGold, fontFamily: readioBoldFont, marginVertical: 5 }]}>
                                    Life is rhythm.
                                </Text>

                                <LotusGap backgroundColor="transparent" gapNumber={10} />
                                <LotusGap backgroundColor="transparent" gapNumber={10} />
                                
                                <Text style={styles.aboutText}>
                                    We help you tap into it.
                                </Text>
                                
                                <Text style={styles.aboutText}>
                                    Through steps, sounds, stories, and systems that honor the beat of who you're becoming—
                                </Text>
                                
                                <Text style={styles.aboutText}>
                                    Lotus turns growth into an everyday practice.
                                </Text>

                                <LotusGap backgroundColor="transparent" gapNumber={10} />
                                
                                <Text style={[styles.aboutText, { color: colors.readioGold, fontFamily: readioBoldFont, marginVertical: 5 }]}>
                                    Daily rituals.
                                </Text>
                                
                                <Text style={[styles.aboutText, { color: colors.readioGold, fontFamily: readioBoldFont, marginVertical: 5 }]}>
                                    Harmonious Habits.
                                </Text>
                                
                                <Text style={[styles.aboutText, { color: colors.readioGold, fontFamily: readioBoldFont, marginVertical: 5 }]}>
                                    Growth is a Groove.
                                </Text>
                                
                                <Text style={[styles.aboutText, { color: colors.readioGold, fontFamily: readioBoldFont, marginVertical: 5 }]}>
                                    Keep growing.
                                </Text>
                                
                                <Text style={[styles.aboutText, { color: colors.readioGold, fontFamily: readioBoldFont, marginVertical: 5 }]}>
                                    Keep going.
                                </Text>
                            </ScrollView>
                        <View style={{ alignItems: 'center', }}>
                            
                            <Text style={styles.aboutHeader}>Contact Us</Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.aboutText}>Email: </Text>
                                <Text style={[styles.aboutText, { color: colors.readioGold }]}>support@thelotusapp.com</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.aboutText}>Website: </Text>
                                <Text style={[styles.aboutText, { color: colors.readioGold }]}>www.thelotusapp.com</Text>
                            </View>

                            <LotusGap backgroundColor="transparent" gapNumber={15} />
                        </View>
                        
                    </SafeAreaView>
                </ReactNativeModal>
            </LinearGradient>

            {/* SECTION  OLD edit profile modal */}
            {/* <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isEditModalVisible}
                        onRequestClose={handleEditCloseModal}
                        style={{ width: '100%', height: '95%', }}
                    >
                        <SafeAreaView style={{ width: '100%', height: '95%', bottom: 0, borderRadius: 40, position: 'absolute', backgroundColor: colors.readioBrown, }}>

                        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={10} style={{ padding: 20, borderRadius: 40, backgroundColor: colors.readioBrown, width: '100%', height: '100%', display: 'flex', justifyContent: "space-between", paddingVertical: "10%" }}>

                            <View style={{ width: '100%', marginBottom: 20, alignItems: 'center', flexDirection: 'row', display: 'flex', justifyContent: 'space-between', backgroundColor: "transparent" }}>

                            <View>
                            </View>

                            <TouchableOpacity onPress={handleEditCloseModal}>
                                <FontAwesome name="close" size={30} color={colors.readioWhite} />
                            </TouchableOpacity>

                            </View>

                            <ScrollView>

                            <View>
                                <InputField
                                allowFontScaling={false}
                                label=""
                                placeholder={user?.name}
                                placeholderTextColor={'#7a7a7a'}
                                icon={''}
                                value={editForm.name}
                                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                                />
                            </View>


                            <View>
                                <InputField
                                allowFontScaling={false}
                                label=""
                                placeholder={user?.email}
                                placeholderTextColor={'#7a7a7a'}
                                icon={''}
                                value={editForm.email}
                                onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                                />
                            </View>



                            <View>
                                <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', width: '100%', alignItems: 'center' }}>
                                <Pressable onPress={() => { setShowPass(!showPass) }} style={{ padding: 10, opacity: showPass ? 1 : 0.7, display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                                    <FontAwesome size={15} name={showPass ? 'eye' : 'eye-slash'} color={colors.readioWhite} />
                                </Pressable>
                                </View>
                                <InputField
                                allowFontScaling={false}
                                label=""
                                placeholder={showPass ? user?.pass : '*******'}
                                placeholderTextColor={'#7a7a7a'}
                                icon={''}
                                value={editForm.password}
                                onChangeText={(text) => setEditForm({ ...editForm, password: text })}
                                />
                            </View>

                            <View>
                                <InputField
                                allowFontScaling={false}
                                label=""
                                placeholder=""
                                icon={''}
                                value={editForm.confirmPassword}
                                onChangeText={(text) => setEditForm({ ...editForm, confirmPassword: text })}
                                />

                                {doPasswordsMatch === true && (
                                )}

                                {doPasswordsMatch === false && editForm?.confirmPassword?.length > 0 && (
                                )}
                            </View>


                            </ScrollView>

                            <Pressable onPress={() => { handleSaveChanges() }} style={{ width: '100%', height: 40, alignSelf: 'center', justifyContent: 'center', position: 'absolute', bottom: 60, alignItems: 'center', borderRadius: 15, backgroundColor: colors.readioOrange }}>
                            <View>
                            </View>
                            </Pressable>
                        </KeyboardAvoidingView>

                        </SafeAreaView>
                    </Modal> */}
        </>
    )

}

const styles = StyleSheet.create({
    overlayContainer: {
        // paddingHorizontal: 16,
        // backgroundColor: colors.readioWhite,
        // backgroundColor: 'red',
        // height: '100%',
        // borderTopLeftRadius: 20,
        // borderTopRightRadius: 20,
        // shadowColor: '#000',
        // shadowOffset: {
        //     width: 0,
        //     height: -2
        // },
        // shadowOpacity: 0.1,
        // shadowRadius: 8,
        // elevation: 5,
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
        backgroundColor: 'transparent',
        borderRadius: 20,
        width: '100%',
        position: 'relative',
        zIndex: 1001
    },
    modalContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        alignContent: 'flex-start',
        width: '100%',
        height: '70%',
        paddingTop: 30,
    },
    container: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        alignContent: 'flex-start',
        width: '100%',
        paddingTop: 30,
    },
    profileHeader: {
        width: '100%',
        paddingHorizontal: 20,
    },
    userInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    nameAndBioContainer: {
        flex: 1,
        marginRight: 20,
    },
    userName: {
        fontSize: 24,
        fontFamily: readioBoldFont,
        color: colors.readioWhite,
        marginBottom: 4,
    },
    userBio: {
        fontSize: 14,
        fontFamily: readioRegularFont,
        color: colors.readioWhite,
        opacity: 0.7,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${colors.readioWhite}20`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarIcon: {
        opacity: 0.9,
    },
    quickStatsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
    },
    quickStatItem: {
        alignItems: 'center',
    },
    quickStatNumber: {
        fontSize: 20,
        fontFamily: readioBoldFont,
        color: colors.readioWhite,
        marginBottom: 4,
    },
    quickStatLabel: {
        fontSize: 12,
        fontFamily: readioRegularFont,
        color: colors.readioWhite,
        opacity: 0.7,
    },
    modalBackground: {
        justifyContent: "flex-end",
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: '100%',
        height: '100%',
        zIndex: 100,
        position: 'absolute',
    },
    gap: {
        marginVertical: 20,
    },
    text: {
        fontSize: 30,
        fontWeight: 'bold',
        fontFamily: readioBoldFont,
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
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.readioWhite,
        fontFamily: readioBoldFont
    },
    subtext: {
        fontSize: 15,
        opacity: 0.5,
        textAlign: 'center',
        fontFamily: readioRegularFont,
        color: colors.readioWhite
    },
    option: {
        fontSize: 20,
        paddingVertical: 10,
        color: colors.readioWhite,
        fontFamily: readioRegularFont,
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
    playPauseButton: {
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.readioWhite,
        transform: [{ scale: 1 }],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4
    },

    aboutHeader: {
        color: colors.readioWhite,
        fontFamily: readioBoldFont,
        fontSize: 20,
        marginBottom: 10,
    },
    aboutText: {
        color: colors.readioWhite,
        fontFamily: readioRegularFont,
        fontSize: 16,
        marginBottom: 5,
    },
})
