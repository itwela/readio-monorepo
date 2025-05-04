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
import { ResizeMode, Video } from 'expo-av';
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

export default function Welcome() {

    const { user } = useLotusUser();
    const { masterDebugMode, setMasterDebugMode, toggleDebugMode } = useLotusUtils();


    const handleGetStartedLoggedIn = async () => {


        // For some reason my functions are being weird unless i add console logs. 
        // Until I find a more reliable way this seems to work

        console.log('handleGetStarted')
        console.log('handleGetStarted')
        // HAPTIC
        lightFeedback()
        console.log('feedback')

        console.log('signUpBannerIsVisible')
        router.navigate('/(tabs)/(home)/home',)


    }


    const handleGetStartedNotLoggedIn = async () => {

        // For some reason my functions are being weird unless i add console logs. 
        // Until I find a more reliable way this seems to work

        console.log('handleGetStarted')
        console.log('handleGetStarted')
        // HAPTIC
        lightFeedback()
        console.log('feedback')

        // if (debug) {
        //     console.log('debug')
        //     router.navigate('/(auth)/quiz')
        // }

        console.log('no user')
        router.navigate('/(auth)/sign-up')


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


    // SECTION Haptics

    const { lightFeedback, heavyFeedback, successFeedback } = useLotusHaptic()

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
                <Video
                    // source={require('@/assets/vids/lotusHPC.mp4')}
                    source={ImageAssets.lotusHomeVidLake}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={true}
                    isLooping
                    isMuted
                    onError={(error) => console.log('Video Error:', error)}
                    onLoad={(status) => console.log('Video Loaded:', status)}
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        // zIndex: 10,
                        backgroundColor: 'transparent'
                    }}
                />
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

                    <View />

                    <View style={{ paddingVertical: 20, gap: 10, display: 'flex', width: '100%', alignItems: 'center' }}>


                        {/* Enter the lotus */}
                        <View
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                backgroundColor: "transparent",
                                paddingTop: 60,
                                width: '100%',
                                paddingVertical: 10,
                                paddingHorizontal: 10,
                            }}
                        >

                            <LotusImageWithLoader useSpinnerLoader loaderSize='small' source={ImageAssets.whiteLogo} style={{ width: 70, height: 70, zIndex: 2, }} resizeMode='contain' />

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
                            <View style={{ width: "100%", display: 'flex', flexDirection: 'row', gap: 5 }}>
                                <Animated.Text entering={FadeInDown.duration(900)} allowFontScaling={false} style={styles.subtext}>
                                    Interesting
                                </Animated.Text>
                                <Animated.Text entering={FadeInDown.duration(1000)} allowFontScaling={false} style={styles.subtext}>
                                    Insights,
                                </Animated.Text>
                                <Animated.Text entering={FadeInDown.duration(1100)} allowFontScaling={false} style={styles.subtext}>
                                    Instantly.
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
                            alignItems: 'center'
                        }}>
                            {user && (
                            <Pressable
                                onPress={() => handleGetStartedLoggedIn()}
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
                                        Get Started!
                                    </Text>
                            </Pressable>
                            )} 

                            {/* TODO DEBUGGING */}
                            {!user && (
                            <Pressable
                                onPress={() => handleGetStartedNotLoggedIn()}
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
                            )} 



                        {/*🟥 - Debug Button Login */}
                        <Pressable
                            onPress={() => router.push('/(auth)/sign-in')}
                            style={[utilsStyles.buttonContainer, buttonStyle.shadowOrange, {
                                width: '30%',
                                backgroundColor: colors.readioOrange,

                            }]}
                        >
                            <Text allowFontScaling={false}
                                style={[utilsStyles.buttonText, {
                                    color: colors.readioWhite,
                                }]}
                            >
                                Debug Login
                            </Text>
                        </Pressable>    

                        </View>

                        <LotusGap backgroundColor='transparent' gapNumber={0} />
                        
                        {/* 🟥 - Clear Local Secure Storage */}
                        <Pressable onPress={() => clearLocalSecureStorage()} style={{ width: '100%', height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: `${colors.readioOrange}30`, borderRadius: 10 }}>
                        <Text allowFontScaling={false} style={styles.option}>Clear Local Secure Storage</Text>
                        </Pressable>

                        {/* 🟥 - Toggle Debug Mode */}
                        <Pressable onPress={() => toggleDebug()} style={{ width: '100%', height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: masterDebugMode ? `${colors.readioOrange}30` : 'transparent', borderRadius: 10 }}>
                        <Text allowFontScaling={false} style={styles.option}>Debug Mode: {masterDebugMode ? 'ON' : 'OFF'}</Text>
                        </Pressable>


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
        color: colors.readioWhite,
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
        color: colors.readioWhite
    },
});