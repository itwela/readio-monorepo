import { useReadio } from '@/constants/readioContext';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { useNavigation } from "@react-navigation/native";
// import { RootNavigationProp } from "@/types/type";
import { router } from 'expo-router';
import { buttonStyle, utilStyle } from "@/constants/tokens";
import { bookshelfImg, brownfade, croplogoblack, croplogowhite } from "@/constants/images";
import { colors } from "@/constants/tokens";
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from "react-native-fast-image";
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { HelloWave } from '@/components/HelloWave';
import  Animated, {useSharedValue,  FadeIn, FadeInDown, FadeOut, FadeOutDown, useAnimatedReaction, useAnimatedStyle, withTiming, FadeOutUp } from "react-native-reanimated";
import { Asset } from 'expo-asset';
import React from 'react';

export default function Welcome() {

    const { user, isSignedInLotus, setIsSignedInLotus } = useReadio();
    const colorscheme = useColorScheme();

    const headingText = [
        "Organize Your Playlists",
        "Follow Your Curiosity",
        "Discover Lotus Liner Notes",
    ]

    const subheadingText = [
        "Save Your Favs",
        "Prompt and Play",
        "Curated Features",
    ];

    const images = [
        require('@/assets/images/signUpImg1.png'),
        require('@/assets/images/signUpImg2.png'),
        require('@/assets/images/signUpImg3.png'),
    ];

    const { wantsToGetStarted, setWantsToGetStarted } = useReadio()
    const handleGetStarted = () => {
        setWantsToGetStarted?.(true);
    }

    const [page, setPage] = useState(0);

    useEffect(() => {

        if (wantsToGetStarted === true) {
            const intervalId = setInterval(() => {
                if (page === headingText.length - 1) {
                    setPage(0);
                } else {
                    setPage((prevPage) => prevPage + 1);
                }
            }, 1618);
            return () => clearInterval(intervalId);
        }

    }, [page, wantsToGetStarted]);

    const opacity = useSharedValue(1); // Shared value for opacity
    const scale = useSharedValue(1); // Shared value for opacity

  useEffect(() => {
    // Trigger animation whenever `page` changes
    opacity.value = 0.618;
    scale.value = 0.618;
    opacity.value = withTiming(1, { duration: 1000 }); // Smooth transition with longer duration
    scale.value = withTiming(1.618, { duration: 1000 }); // Smooth transition with longer duration
  }, [page]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const zoomAnimated = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}]
  }));


  const [imagesLoaded, setImagesLoaded] = useState(0)
  const [screenIsReady, setScreenIsReady] = useState(false)

  useEffect(() => {
    if (imagesLoaded > 1) {
        setTimeout(()=> {
            setScreenIsReady(true)
        }, 1000)
    }
  }, [imagesLoaded, screenIsReady, setScreenIsReady])
  

    return (
        <>

            {screenIsReady === false && (
                <>
                <Animated.View  exiting={FadeOut.duration(500)} style={{position: 'absolute', zIndex: 1000, width: '100%', height: '100%', justifyContent: 'center', backgroundColor: colors.readioWhite}}>
                    <Animated.Text entering={FadeInDown.duration(700)} exiting={FadeOutUp.duration(200)} style={{alignSelf: 'center', color: colors.readioBlack, fontFamily: readioBoldFont, fontSize: 38}}>Lotus</Animated.Text>
                    <Animated.Text entering={FadeInDown.duration(900)} exiting={FadeOutUp.duration(300)} style={{alignSelf: 'center', color: colors.readioBlack, fontFamily: readioRegularFont, fontSize: 25}}>Always Growing</Animated.Text>
                    {/* <Animated.Text  exiting={FadeOutUp.duration(100)} style={{alignSelf: 'center', color: colors.readioWhite, fontFamily: readioRegularFont, fontSize: 25}}>Were loading your experience...</Animated.Text> */}
                    <ActivityIndicator size="large" color={colors.readioBrown} style={{marginVertical: 10}} />
                </Animated.View>
                </>
            )}
            
            <View style={{ zIndex: -1, opacity: 0.618, position: 'absolute', width: '100%', height: '60%', backgroundColor: colors.readioBrown }}></View>
            
            {wantsToGetStarted === false && (
                <>
                <Animated.View  style={{ zIndex: -2, opacity: 1, position: 'absolute', width: '100%', height: '60%' }} entering={FadeIn.duration(600)} exiting={FadeOut.duration(600)}>
                    {/* Image */}
                    <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)}  source={Asset.fromModule(require('@/assets/images/bookshelfImg.png'))} style={[{ width: '100%', height: '100%' }]} resizeMode='cover' />
                </Animated.View>
                </>
            )}

            
            {wantsToGetStarted === true && (
                <>
                <Animated.View style={[animatedStyle, { zIndex: -2, overflow: 'hidden', opacity: 1, position: 'absolute', width: '100%', height: '60%' }]} entering={FadeIn.duration(1000)} exiting={FadeOut.duration(1000)}>
                    {/* Image */}
                    <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={Asset.fromModule(images[page])} style={[zoomAnimated, { width: '100%', height: '100%' }]} resizeMode='cover' />
                </Animated.View>
                </>
            )}


            <LinearGradient
                colors={['#272121', 'transparent', 'transparent']}
                style={{
                    zIndex: -1,
                    bottom: '40%',
                    position: 'absolute',
                    width: '150%',
                    height: 450,
                    transform: [{ rotate: '-180deg' }]
                }}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />

            <View style={[{ zIndex: -3, opacity: 1, position: 'absolute', width: '100%', height: '100%', backgroundColor: colors.readioBrown }]} />
            <SafeAreaView style={utilStyle.safeAreaContainer}>
                <View style={styles.container}>

                    <TouchableOpacity activeOpacity={0.90} onPress={() => { setWantsToGetStarted?.(false); router.push('/(auth)/(demo)/demo') }} style={{ width: "100%", display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20 }}>
                        <Text allowFontScaling={false} style={{ fontSize: 20, fontWeight: 'bold', color: colors.readioWhite, fontFamily: readioBoldFont, alignSelf: "flex-end" }}>Demo</Text>
                    </TouchableOpacity>


                    <View style={{ paddingVertical: 20, gap: 10, display: 'flex', width: '100%', alignItems: 'center' }}>
                        <View
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                backgroundColor: "transparent",
                                paddingTop: 60,
                                width: '100%',
                                paddingVertical: 10
                            }}
                        >

                            <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={{ uri: croplogowhite }} style={{ width: 100, height: 100, transform: [{ translateX: "-20%" }, { translateY: "30%" }], alignSelf: "flex-start", backgroundColor: "transparent" }} resizeMode="cover" />

                            {wantsToGetStarted === false && (
                                <>
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
                                        <Animated.Text entering={FadeInDown.duration(900)}  allowFontScaling={false} style={styles.subtext}>
                                            Interesting
                                        </Animated.Text>
                                        <Animated.Text entering={FadeInDown.duration(1000)}   allowFontScaling={false} style={styles.subtext}>
                                            Insights,
                                        </Animated.Text>
                                        <Animated.Text entering={FadeInDown.duration(1100)}   allowFontScaling={false} style={styles.subtext}>
                                            Instantly.
                                        </Animated.Text>
                                    </View>
                                </>
                            )}

                            {wantsToGetStarted === true && (
                                <>
                                    <View style={{ width: "100%", display: 'flex', flexDirection: 'row', gap: 10 }}>
                                        <Text  allowFontScaling={false} style={{ width: '100%', fontWeight: 'bold', fontSize: 40, color: colors.readioWhite, fontFamily: readioBoldFont }}>
                                            {headingText[page]}
                                        </Text>
                                    </View>

                                    <View style={{ width: '70%' }}>
                                        <Text  allowFontScaling={false} style={styles.subtext}>
                                            {subheadingText[page]}
                                        </Text>
                                    </View>
                                </>
                            )}

                            

                        </View>

                        {wantsToGetStarted === false && (
                            <>
                                <TouchableOpacity activeOpacity={0.9} style={buttonStyle.mainButton} onPress={handleGetStarted}>
                                    <Text  allowFontScaling={false} style={[buttonStyle.mainButtonText, { color: colors.readioWhite }]}>Get Started</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {wantsToGetStarted === true && (
                            <>
                                <TouchableOpacity activeOpacity={0.9} style={buttonStyle.mainButton} onPress={() => { setWantsToGetStarted?.(false); router.push('/(auth)/quiz') }}>
                                    <Text  allowFontScaling={false} style={[buttonStyle.mainButtonText, { color: colors.readioWhite }]}>Tell us your interests</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* <Text style={{marginTop: 10, color: colors.readioWhite, width: '100%', display: 'flex', textAlign: 'center', fontFamily: readioRegularFont}}>Already have an account?</Text> */}

                        <TouchableOpacity activeOpacity={0.9} style={[buttonStyle.mainButton, { backgroundColor: colors.readioBlack }]}>

                            {user && (
                                
                                <Text  allowFontScaling={false} onPress={() => {
                                    setWantsToGetStarted?.(false)
                                    console.log("wantsToGetStarted", wantsToGetStarted)
                                    router.push('/(tabs)/(home)/home')
                                }
                                }
                                    style={[styles.option]}>Login</Text>
                            )}

                            {!user && (

                                <Text  allowFontScaling={false} onPress={() => {
                                    setWantsToGetStarted?.(false)
                                    console.log("wantsToGetStarted", wantsToGetStarted)
                                    router.push('/(auth)/sign-in')
                                }
                                }
                                    style={[styles.option]}>Log In</Text>

                            )}

                        </TouchableOpacity>

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