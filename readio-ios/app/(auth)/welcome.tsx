import { useReadio } from '@/constants/readioContext';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
// import { useNavigation } from "@react-navigation/native";
// import { RootNavigationProp } from "@/types/type";
import { router } from 'expo-router';
import { buttonStyle, utilStyle } from "@/constants/tokens";
import { bookshelfImg, brownfade, blacklogo, whitelogo } from "@/constants/images";
import { colors } from "@/constants/tokens";
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from "react-native-fast-image";
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { HelloWave } from '@/components/HelloWave';


export default function Welcome() {

    const { isSignedInLotus, setIsSignedInLotus } = useReadio();
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
        "https://koala.sh/api/image/v2-61u02-2e304.jpg?width=1216&height=832&dream",
        "https://images.pexels.com/photos/1820563/pexels-photo-1820563.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        "https://images.pexels.com/photos/16535185/pexels-photo-16535185/free-photo-of-vinyl-record-player-in-an-antique-store.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
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


    return (
        <>
            <View style={{ zIndex: -1, opacity: 0.618, position: 'absolute', width: '100%', height: '60%', backgroundColor: colors.readioBrown }}></View>
            {wantsToGetStarted === false && (
                <>
                    <FastImage source={{ uri: bookshelfImg }} style={[{ zIndex: -2, opacity: 1, position: 'absolute', width: '100%', height: '60%' }]} resizeMode='cover' />
                </>
            )}

            {wantsToGetStarted === true && (
                <>
                    <FastImage source={{ uri: images[page] }} style={[{ zIndex: -2, opacity: 1, position: 'absolute', width: '100%', height: '60%' }]} resizeMode='cover' />
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

                    <TouchableOpacity activeOpacity={0.90} onPress={() => { setWantsToGetStarted?.(false); router.push('/(auth)/demo') }} style={{ width: "100%", display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20 }}>
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

                            <FastImage source={{ uri: whitelogo }} style={{ width: 100, height: 100, transform: [{ translateX: "-20%" }, { translateY: "30%" }], alignSelf: "flex-start", backgroundColor: "transparent" }} resizeMode="cover" />

                            {wantsToGetStarted === false && (
                                <>
                                    <View style={{ width: "100%", display: 'flex', flexDirection: 'row', gap: 10 }}>
                                        <Text  allowFontScaling={false} style={styles.title}>
                                            Enter the
                                        </Text>
                                        <Text  allowFontScaling={false} style={styles.orangeTitle}>
                                            Lotus
                                        </Text>
                                    </View>
                                    <View style={{ width: '100%' }}>
                                        <Text  allowFontScaling={false} style={styles.subtext}>
                                            Interesting Insights Instantly.
                                            {/* For the creative, the active, the bbuilders, the nurturers, and all students of life. */}
                                        </Text>
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

                            <SignedIn>
                                <Text  allowFontScaling={false} onPress={() => {
                                    setWantsToGetStarted?.(false)
                                    console.log("wantsToGetStarted", wantsToGetStarted)
                                    router.push('/(tabs)/(home)/home')
                                }
                                }
                                    style={[styles.option]}>Login</Text>
                            </SignedIn>

                            <SignedOut>
                                <Text  allowFontScaling={false} onPress={() => {
                                    setWantsToGetStarted?.(false)
                                    console.log("wantsToGetStarted", wantsToGetStarted)
                                    router.push('/(auth)/sign-in')
                                }
                                }
                                    style={[styles.option]}>Log In</Text>
                            </SignedOut>

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