import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { StyleSheet, Text, Image, View, ScrollView, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
// import { useNavigation } from "@react-navigation/native";
// import { RootNavigationProp } from "@/types/type";
import { router } from 'expo-router';
import { buttonStyle, utilStyle } from "@/constants/tokens";
import { colors } from "@/constants/tokens";
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import Animated, { useSharedValue, FadeIn, FadeInDown, FadeOut, FadeOutDown, useAnimatedReaction, useAnimatedStyle, withTiming, FadeOutUp } from "react-native-reanimated";
import { Asset } from 'expo-asset';
import React from 'react';
import { getLocalImageUri, ImageAssets } from '@/constants/imageAssets';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { useLotusSettings } from '@/helpers/providers/lotusSettingsProvider';
import { setStateAsync } from '@/constants/utilityFunctions';
import { utilsStyles } from '@/styles';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';
import { RootNavigationProp } from "@/types/type";
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from "expo-secure-store";
import LotusGap from '@/components/LotusGap';
import LotusImageWithLoader from '@/components/LotusImageWithLoader';
import { Audio, ResizeMode } from 'expo-av';
import { VideoView, useVideoPlayer } from 'expo-video';
import { SoundAssets } from '@/constants/soundAssets';
import { useLotusAuth } from '@/helpers/providers/LotusAuthContext';

export default function Welcome() {

    // const { user } = useLotusUser(); // We'll use isAuthenticated from LotusAuthContext for navigation
    const { logout, isAuthenticated, user } = useLotusAuth(); // Get isAuthenticated and user
    const { masterDebugMode, setMasterDebugMode, toggleDebugMode, underwaterFxSoundRef } = useLotusUtils();

    // const videoPlayer = useVideoPlayer(ImageAssets.aliVideo, player => {
    //     player.muted = true;
    //     player.loop = true;
    //     player.play();
    //     player.staysActiveInBackground = false;
    // });

    const handleGetStartedLoggedIn = async () => {


        // For some reason my functions are being weird unless i add console logs. 
        // Until I find a more reliable way this seems to work

        // console.log('handleGetStarted')
        // console.log('handleGetStarted')
        // HAPTIC
        lightFeedback()
        // console.log('feedback')

        // Stop and unload sound if it's playing
        if (underwaterFxSoundRef.current) {
            try {
                const status = await underwaterFxSoundRef.current.getStatusAsync();
                if (status.isLoaded && status.isPlaying) {
                    // console.log("Stopping underwater fx for logged in user...");
                    await underwaterFxSoundRef.current.stopAsync();
                }
                if (status.isLoaded) {
                    await underwaterFxSoundRef.current.unloadAsync();
                    // console.log("Underwater fx unloaded for logged in user.");
                }
                underwaterFxSoundRef.current = null; // Clear the ref
            } catch (error) {
                console.error("Error stopping/unloading underwater fx for logged in user:", error);
            }
        }

        // router.navigate('/(tabs)/(home)/home',)
        router.navigate('/sign-up',)


    }

    const handleGetStartedNotLoggedIn = async () => {

        // For some reason my functions are being weird unless i add console logs. 
        // Until I find a more reliable way this seems to work

        // console.log('handleGetStarted')
        // console.log('handleGetStarted')
        // HAPTIC
        lightFeedback()
        // console.log('feedback')

        // if (debug) {
        //     console.log('debug')
        //     router.navigate('/(auth)/quiz')
        // }

        // console.log('no user')
        router.navigate('/(auth)/sign-up')


    }

    const handleLoginLoggedIn = async () => {

        // HAPTIC
        lightFeedback()
        // console.log('feedback')

        // Stop and unload sound if it's playing
        if (underwaterFxSoundRef.current) {
            try {
                const status = await underwaterFxSoundRef.current.getStatusAsync();
                if (status.isLoaded && status.isPlaying) {
                    // console.log("Stopping underwater fx for logged in user...");
                    await underwaterFxSoundRef.current.stopAsync();
                }
                if (status.isLoaded) {
                    await underwaterFxSoundRef.current.unloadAsync();
                    // console.log("Underwater fx unloaded for logged in user.");
                }
                underwaterFxSoundRef.current = null; // Clear the ref
            } catch (error) {
                console.error("Error stopping/unloading underwater fx for logged in user:", error);
            }
        }

        router.navigate('/(tabs)/(home)/home',)
        // router.navigate('/sign-up',)


    }

    const handleLoginNotLoggedIn = async () => {

        // console.log('handleGetStarted')
        // console.log('handleGetStarted')
        // HAPTIC
        lightFeedback()
        // console.log('feedback')

        // Stop and unload sound if it's playing
        if (underwaterFxSoundRef.current) {
            try {
                const status = await underwaterFxSoundRef.current.getStatusAsync();
                if (status.isLoaded && status.isPlaying) {
                    // console.log("Stopping underwater fx for logged in user...");
                    await underwaterFxSoundRef.current.stopAsync();
                }
                if (status.isLoaded) {
                    await underwaterFxSoundRef.current.unloadAsync();
                    // console.log("Underwater fx unloaded for logged in user.");
                }
                underwaterFxSoundRef.current = null; // Clear the ref
            } catch (error) {
                console.error("Error stopping/unloading underwater fx for logged in user:", error);
            }
        }

        router.navigate('/(auth)/sign-in',)
        // router.navigate('/sign-up',)


    }

    const clearLocalSecureStorage = async () => {

        heavyFeedback();

        try {
            await SecureStore.deleteItemAsync('lotusJWTAlwaysGrowingToken');
            await SecureStore.deleteItemAsync('DebuglotusJWTAlwaysGrowingToken');
        } catch (error) {
            console.error('Error clearing local secure storage:', error);
        }
    };

    const toggleDebug = async () => {

        heavyFeedback();

        toggleDebugMode?.();

    };

    const playUnderWaterFx = async () => {
        // If a sound is already loaded in the ref, unload it first
        if (underwaterFxSoundRef.current) {
            try {
                await underwaterFxSoundRef.current.unloadAsync();
                // console.log("Previous underwater fx unloaded.");
            } catch (e) {
                console.error("Error unloading previous underwater fx:", e);
            }
            underwaterFxSoundRef.current = null;
        }

        const underwaterFx = new Audio.Sound();
        underwaterFxSoundRef.current = underwaterFx; // Store the new sound object in the ref
        // console.log("Attempting to play underwater fx...");
        try {
            await underwaterFx.loadAsync(SoundAssets.underWaterFx.id);
            await underwaterFx.setVolumeAsync(0.20);
            await underwaterFx.playAsync();
            underwaterFx.setOnPlaybackStatusUpdate(async (status) => {
                if (status.isLoaded && status.didJustFinish) {
                    // console.log("Underwater fx finished playing, unloading.");
                    try {
                        await underwaterFx.unloadAsync();
                        if (underwaterFxSoundRef.current === underwaterFx) {
                            underwaterFxSoundRef.current = null; // Clear ref if it's the same sound
                        }
                    } catch (e) {
                        console.error("Error unloading underwater fx after finishing:", e);
                    }
                } else if (!status.isLoaded && underwaterFxSoundRef.current === underwaterFx) {
                    // If it got unloaded by other means (e.g. error or manual stop)
                    underwaterFxSoundRef.current = null;
                }
            });
        } catch (error) {
            console.error("Error playing under water fx:", error);
            underwaterFxSoundRef.current = null; // Clear ref on error
        }
    };


    // SECTION Haptics

    const { lightFeedback, heavyFeedback, successFeedback } = useLotusHaptic()

    useEffect(() => {

        playUnderWaterFx();

    }, [])

    const handleGetStarted = async () => {
        lightFeedback();

        // Stop and unload sound if it's playing
        if (underwaterFxSoundRef.current) {
            try {
                const status = await underwaterFxSoundRef.current.getStatusAsync();
                if (status.isLoaded && status.isPlaying) {
                    await underwaterFxSoundRef.current.stopAsync();
                }
                if (status.isLoaded) {
                    await underwaterFxSoundRef.current.unloadAsync();
                }
                underwaterFxSoundRef.current = null;
            } catch (error) {
                console.error("Error stopping/unloading underwater fx:", error);
            }
        }

        // Check user state and redirect accordingly
        if (isAuthenticated && user) { // Check isAuthenticated first, then user if needed for other logic
            router.navigate('/(tabs)/(home)/home');
        } else {
            router.navigate('/(auth)/sign-up');
        }
    };

    const handleLogout = async () => {
        heavyFeedback();
        
        try {
            await logout?.();
        } catch (error) {
            console.error('❌ Logout failed:', error);
        }
    };

    return (
        <>


            <LinearGradient
                colors={[colors.readioBrown, 'transparent']}
                style={{
                    zIndex: -1,
                    position: 'absolute',
                    width: '100%',
                    height: '80%',
                    opacity: 0.618
                }}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />

            <Animated.View style={{ zIndex: -2, opacity: 1, position: 'absolute', width: '100%', height: '80%' }} entering={FadeIn.duration(600)} exiting={FadeOut.duration(600)}>

                {/* NOTE - HOME GIF ASSET */}
                <LotusImageWithLoader
                    source={{
                        // uri: getLocalImageUri("manDrinkWater"),
                        uri: getLocalImageUri("sticMeditating"),
                    }}
                    style={{ zIndex: -2, position: 'absolute', width: '100%', height: '100%', backgroundColor: colors.readioBrown }}
                    resizeMode="cover"
                />
                {/* NOTE - ARCHIVED HOME VIDEO ASSET */}
                {/* <VideoView
                    // source={require('@/assets/vids/lotusHPC.mp4')}
                    player={videoPlayer}
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        // zIndex: 10,
                        backgroundColor: 'transparent'
                    }}
                /> */}
                {/* NOTE Semi-transparent overlay for desaturation effect */}
                {/* <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'black', // Or 'grey'
                        opacity: 0.6,          // Adjust this value (0.0 to 1.0) for desired effect
                        // pointerEvents: 'none' // Make sure it doesn't block interactions if needed
                    }}
                 /> */}
            </Animated.View>


            <LinearGradient
                colors={['#272121', 'transparent', 'transparent']}
                style={{
                    zIndex: -1,
                    bottom: '20%',
                    position: 'absolute',
                    width: '150%',
                    height: 1000,
                    transform: [{ rotate: '-180deg' }]
                }}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
            />

            <View style={[{ zIndex: -3, opacity: 1, position: 'absolute', width: '100%', height: '100%', backgroundColor: colors.readioBrown }]} />

            <SafeAreaView style={utilStyle.safeAreaContainer}>
                <View style={styles.container}>

                    {/* <TouchableOpacity activeOpacity={0.90} onPress={() => {router.push('/(auth)/(demo)/demo') }} style={{ width: "100%", display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: 10 }}>
                        <Text allowFontScaling={false} style={{ fontSize: 16, letterSpacing: 0.3, fontWeight: 'bold', color: colors.readioWhite, fontFamily: readioBoldFont, alignSelf: "flex-end" }}>Demo</Text>
                    </TouchableOpacity> */}

                    <View style={{ height: '50%', paddingTop: 20, backgroundColor: 'transparent', justifyContent: 'space-between' }}>
                        {/* <Text allowFontScaling={false} style={{ fontSize: 50, letterSpacing: 0.3, fontWeight: 'bold', color: colors.readioWhite, fontFamily: readioBoldFont, alignSelf: "flex-end" }}>
                            WORD.
                        </Text>
                        <Text allowFontScaling={false} style={{ fontSize: 50, letterSpacing: 0.3, fontWeight: 'bold', color: colors.readioWhite, fontFamily: readioBoldFont, alignSelf: "flex-end" }}>
                            SOUND.
                        </Text>
                        <Text allowFontScaling={false} style={{ fontSize: 50, letterSpacing: 0.3, fontWeight: 'bold', color: colors.readioWhite, fontFamily: readioBoldFont, alignSelf: "flex-end" }}>
                            POWER.
                        </Text> */}
                    </View>

                    <View style={{  gap: 10, display: 'flex', width: '100%', alignItems: 'center' }}>


                        {/* Enter the lotus */}
                        <View
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: "transparent",
                                paddingTop: 60,
                                width: '100%',
                                paddingVertical: 10,
                                paddingHorizontal: 10,
                            }}
                        >

                            <LotusImageWithLoader useSpinnerLoader loaderSize='small' source={ImageAssets.goldLogo} style={{ width: 130, height: 130, zIndex: 2, transform: [{ translateY: 10 }] }} resizeMode='contain' />

                            <View style={{ width: "100%", display: 'flex', flexDirection: 'row', gap: 10 }}>
                                <Animated.Text entering={FadeInDown.duration(600)} allowFontScaling={false} style={styles.title}>
                                    Enter
                                </Animated.Text>
                                <Animated.Text entering={FadeInDown.duration(700)} allowFontScaling={false} style={styles.title}>
                                    the
                                </Animated.Text>
                                <Animated.Text entering={FadeInDown.duration(800)} allowFontScaling={false} style={styles.orangeTitle}>
                                    Lotus
                                </Animated.Text>
                            </View>
                            <View style={{ width: "100%", display: 'flex', flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center' }}>
                                <Animated.Text entering={FadeInDown.duration(900)} allowFontScaling={false} style={styles.subtext}>
                                    A Wellness App --
                                </Animated.Text>
                                <Animated.Text entering={FadeInDown.duration(1000)} allowFontScaling={false} style={styles.subtext}>
                                    Built
                                </Animated.Text>
                                <Animated.Text entering={FadeInDown.duration(1100)} allowFontScaling={false} style={styles.subtext}>
                                    Different.
                                </Animated.Text>
                            </View>




                        </View>


                        {/* Buttons */}
                        <View style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                            gap: 12,
                            paddingHorizontal: 10,
                            alignItems: 'center',
                        }}>
                            <Pressable
                                onPress={() => handleGetStarted()}
                                style={[utilsStyles.buttonContainer, buttonStyle.shadowOrange, {
                                    width: '70%',
                                    backgroundColor: colors.readioOrange,
                                }]}
                                >
                                <Text allowFontScaling={false}
                                    style={[utilsStyles.buttonText, {
                                        color: colors.readioWhite,
                                    }]}
                                    >
                                    Get Started
                                </Text>
                            </Pressable>

                            {/* Login Button */}
                            <Pressable
                                onPress={() => handleLoginNotLoggedIn()}
                                style={[utilsStyles.buttonContainer, buttonStyle.shadowOrange, {
                                    width: '30%',
                                    backgroundColor: colors.readioOrange,
                                }]}
                            >
                                <Text allowFontScaling={false}
                                    style={[utilsStyles.buttonText, {
                                        color: colors.readioDustyWhite,
                                    }]}
                                >
                                    Login
                                </Text>
                            </Pressable>
                       
                            {/* <Pressable 
                                onPress={() => handleLogout()} 
                                style={{ 
                                    width: '100%', 
                                    height: 40, 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    backgroundColor: `${colors.readioOrange}30`, 
                                    borderRadius: 10,
                                    marginTop: 20
                                }}
                            >
                                <Text allowFontScaling={false} style={styles.option}>🚪 Test Logout</Text>
                            </Pressable> */}
                        </View>

                        {/* Temporary Logout Button for Testing */}


                        {/*🟥 - Debug Gap */}
                        {/* <LotusGap backgroundColor='transparent' gapNumber={0} /> */}

                        {/* 🟥 - Clear Local Secure Storage */}
                        {/* <Pressable onPress={() => clearLocalSecureStorage()} style={{ width: '100%', height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: `${colors.readioOrange}30`, borderRadius: 10 }}>
                        <Text allowFontScaling={false} style={styles.option}>Clear Local Secure Storage</Text>
                        </Pressable> */}

                        {/* 🟥 - Toggle Debug Mode */}
                        {/* <Pressable onPress={() => toggleDebug()} style={{ width: '100%', height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: masterDebugMode ? `${colors.readioOrange}30` : 'transparent', borderRadius: 10 }}>
                        <Text allowFontScaling={false} style={styles.option}>Debug Mode: {masterDebugMode ? 'ON' : 'OFF'}</Text>
                        </Pressable> */}


                    </View>

                </View>
            </SafeAreaView>
        </>
    );






}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        gap: 60,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: "space-between",
        paddingHorizontal: 10
    },
    text: {
        fontSize: 60,
        fontWeight: 'bold',
        fontFamily: readioBoldFont,
        color: colors.readioWhite
    },
    option: {
        fontSize: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        fontFamily: readioBoldFont,
        color: colors.readioWhite
    },
    title: {
        fontSize: 45,
        textAlign: 'center',
        fontWeight: 'bold',
        fontFamily: readioBoldFont,
        color: colors.readioDustyWhite,
    },
    orangeTitle: {
        fontSize: 45,
        textAlign: 'center',
        fontWeight: 'bold',
        fontFamily: readioBoldFont,
        color: colors.readioOrange,
    },
    subtext: {
        fontSize: 20,
        opacity: 0.8,
        fontFamily: readioRegularFont,
        color: colors.readioDustyWhite,
        textAlign: 'center'
    },
});