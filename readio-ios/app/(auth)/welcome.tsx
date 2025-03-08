import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { StyleSheet, Text, Image, View, ScrollView, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
// import { useNavigation } from "@react-navigation/native";
// import { RootNavigationProp } from "@/types/type";
import { router } from 'expo-router';
import { buttonStyle, utilStyle } from "@/constants/tokens";
import { bookshelfImg, brownfade, croplogoblack, croplogowhite } from "@/constants/images";
import { colors } from "@/constants/tokens";
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { HelloWave } from '@/components/HelloWave';
import  Animated, {useSharedValue,  FadeIn, FadeInDown, FadeOut, FadeOutDown, useAnimatedReaction, useAnimatedStyle, withTiming, FadeOutUp } from "react-native-reanimated";
import { Asset } from 'expo-asset';
import React from 'react';
import { getLocalImageUri, ImageAssets } from '@/constants/imageAssets';
import { ResizeMode, Video } from 'expo-av';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { useLotusSettings } from '@/helpers/providers/lotusSetingsProvider';
import { setStateAsync } from '@/constants/utilityFunctions';
import { utilsStyles } from '@/styles';

export default function Welcome() {

    const { user } = useLotusUser();
    const colorscheme = useColorScheme();
    const { setSettingsOpen } = useLotusSettings();

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

    const images: any = [
        ImageAssets.signUpImg1,
        ImageAssets.signUpImg2,
        ImageAssets.signUpImg3,
    ];

    const { wantsToGetStarted, setWantsToGetStarted, setSignUpBannerIsVisible} = useLotusUtils()
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

            {wantsToGetStarted === false && (
                <>
                <Animated.View  style={{ zIndex: -2, opacity: 1, position: 'absolute', width: '100%', height: '80%' }} entering={FadeIn.duration(600)} exiting={FadeOut.duration(600)}>
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
                </>
            )}

            
            {wantsToGetStarted === true && (
                <>
                <Animated.View style={[animatedStyle, { zIndex: -2, overflow: 'hidden', opacity: 1, position: 'absolute', width: '100%', height: '80%' }]} entering={FadeIn.duration(1000)} exiting={FadeOut.duration(1000)}>
                    {/* Image */}
                    <Image 
                        source={images[page]} 
                        style={[zoomAnimated, { width: '100%', height: '100%' }]} 
                        resizeMode='cover' 
                    />
                </Animated.View>
                </>
            )}


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

                    <TouchableOpacity activeOpacity={0.90} onPress={() => { setWantsToGetStarted?.(false); router.push('/(auth)/(demo)/demo') }} style={{ width: "100%", display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: 10 }}>
                        <Text allowFontScaling={false} style={{ fontSize: 16, letterSpacing: 0.3, fontWeight: 'bold', color: colors.readioWhite, fontFamily: readioBoldFont, alignSelf: "flex-end" }}>Demo</Text>
                    </TouchableOpacity>


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

                            <Image source={ImageAssets.whiteLogo} style={{ width: 70, height: 70, zIndex: 2, }} resizeMode='contain' />
                            {/* <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={{ uri: croplogowhite }} style={{ width: 100, height: 100, transform: [{ translateX: "-20%" }, { translateY: "30%" }], alignSelf: "flex-start", backgroundColor: "transparent" }} resizeMode="cover" /> */}

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


                        {/* Buttons */}
                        <View style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                            gap: 12,
                            paddingHorizontal: 10,
                            alignItems: 'center'
                        }}>
                            {wantsToGetStarted === false && (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={[utilsStyles.buttonContainer, { 
                                        width: '70%', 
                                        backgroundColor: colors.readioOrange, 
                                        shadowColor: colors.readioOrange 
                                    }]}
                                    onPress={handleGetStarted}
                                >
                                    <Text allowFontScaling={false}
                                        style={[utilsStyles.buttonText, {
                                            color: colors.readioWhite,
                                        }]}
                                    >
                                        Get Started
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {wantsToGetStarted === true && (
                                <Pressable
                                    // activeOpacity={0.7}
                                    style={[utilsStyles.buttonContainer, { 
                                        width: '70%', 
                                        backgroundColor: colors.readioOrange, 
                                        shadowColor: colors.readioOrange 
                                    }]}
                                    onPress={() => { setWantsToGetStarted?.(false); router.push('/(auth)/quiz') }}
                                >
                                    <Text allowFontScaling={false}
                                          style={[utilsStyles.buttonText, {
                                            color: colors.readioWhite,
                                        }]}
                                    >
                                        Tell us your interests
                                    </Text>
                                </Pressable>
                            )}

                            <Pressable
                                style={[utilsStyles.buttonContainer, { 
                                    width: 90, 
                                    backgroundColor: 'transparent',
                                    shadowColor: colors.readioOrange,
                                    borderWidth: 1,
                                    borderColor: `${colors.readioWhite}80`,
                                    borderRadius: 100, 
                                }]}
                            >
                                <Text allowFontScaling={false}
                                    onPress={async () => {
                                        setWantsToGetStarted?.(false)
                                        await setStateAsync(setWantsToGetStarted as Function, false, 'backendData')
                                        await setStateAsync(setSettingsOpen, false, 'backendData')
                                        if (user) {
                                            setSignUpBannerIsVisible?.(false)
                                        }
                                        router.push(user ? '/(tabs)/(home)/home' : '/(auth)/sign-in')
                                    }}
                                    style={[utilsStyles.buttonText, {
                                        color: colors.readioWhite,
                                    }]}
                                >
                                    {user ? 'Log in' : 'Log In'}
                                </Text>
                            </Pressable>
                        </View>


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