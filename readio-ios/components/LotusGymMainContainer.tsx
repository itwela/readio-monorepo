import { getLocalImageUri } from "@/constants/imageAssets";
import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { IconSymbol } from "./ui/IconSymbol";
import { Link, router } from "expo-router";
import LotusImageWithLoader from "./LotusImageWithLoader";
import { useLotusHaptic } from "@/helpers/providers/lotusHapticProvider";

interface LotusGymMainContainerProps {
    title: string;
    subTitle: string;
    icon: any;
    link: any;
}

export function LotusGymMainContainer({ title, subTitle, icon, link }: LotusGymMainContainerProps) {
    const { lightFeedback } = useLotusHaptic();
    const styles = StyleSheet.create({
        container: {
            width: '100%',
            height: 180,
            backgroundColor: link === 'giant' || link === 'timer' ? 'transparent' : 'rgba(35, 35, 35, 0.8)',
            borderRadius: 15,
            gap: 15,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 2,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            overflow: 'hidden',
            padding: 15,
        },
        imgContainer: {
            width: '100%',
            height: 180,
            borderRadius: 15,
            position: 'absolute',
            backgroundColor: 'transparent',
            bottom: 0,
        },
        maintext: {
            color: colors.readioWhite,
            // color: colors.readioOrange,
            fontSize: 30,
            fontWeight: 'bold',
            fontFamily: readioBoldFont,
        },
        subtext: {
            color: colors.readioWhite,
            fontSize: 12,
            fontFamily: readioRegularFont,
        },
        iconContainer: {
            backgroundColor: 'transparent',
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            
        },
        subtextContainer: {
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: 'transparent',
            gap: 15,
            alignItems: 'center',
            justifyContent: 'center',
        },
        maintextContainer: {
            width: '40%',
        },
        divider: {
            width: 1.618,
            height: 40,
            backgroundColor: colors.readioOrange,
            borderRadius: 1.618,
        },
        letsGoButton: {
            backgroundColor: colors.readioOrange,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            width: '90%',
        },
        letsGoButtonText: {
            color: colors.readioWhite,
            fontSize: 18,
            fontFamily: readioBoldFont,
            fontWeight: 'bold',
        },
    });

    const bgImages = {
    }

    const handleLink = () => {
        if (link === 'giant') {
            return '/(tabs)/giant';
        }
        return `/(tabs)/${link}`;
    }

    const handleLetsGoPress = () => {
        lightFeedback();
        router.push(handleLink() as any);
    }

    return (
        <View style={{ position: 'relative', borderRadius: 15, width: '90%', overflow: 'hidden' }}>

            {/* IMG BG  */}
            {link === 'giant' && (
                <View style={styles.imgContainer}>
                    <LotusImageWithLoader
                        source={{
                            uri: getLocalImageUri("walkingGif"),
                        }}
                        style={{ zIndex: -2, opacity: 0.618, position: 'absolute', width: '100%', height: '100%', backgroundColor: colors.readioBrown }}
                        resizeMode="cover"
                    />
                </View>
            )}

            {link === 'timer' && (
                <View style={styles.imgContainer}>
                    <LotusImageWithLoader
                        source={{
                            uri: getLocalImageUri("aliGif"),
                        }}
                        style={{ zIndex: -2, opacity: 0.618, position: 'absolute', width: '100%', height: '100%', backgroundColor: colors.readioBrown }}
                        resizeMode="cover"
                    />
                </View>
            )}

            <View style={styles.container}>

                <View/>

                {/* Content container */}
                <View style={styles.subtextContainer}>

                    <View style={styles.iconContainer}>
                        <IconSymbol name={icon} size={50} color={colors.readioOrange} />
                    </View>

                    <View style={styles.divider} />

                    {/* text container */}
                    <View style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                        <Text allowFontScaling={false} style={styles.maintext}>{title}</Text>
                        <Text allowFontScaling={false} style={styles.subtext}>{subTitle}</Text>
                    </View>

                </View>

                {/* Let's Go Button */}
                <TouchableOpacity 
                    style={styles.letsGoButton}
                    onPress={handleLetsGoPress}
                    activeOpacity={0.8}
                >
                    <Text allowFontScaling={false} style={styles.letsGoButtonText}>Let's Go</Text>
                </TouchableOpacity>

            </View>

        </View>
    );
}