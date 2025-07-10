import { getLocalImageUri } from "@/constants/imageAssets";
import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { IconSymbol } from "./ui/IconSymbol";
import { Link } from "expo-router";
import LotusImageWithLoader from "./LotusImageWithLoader";

interface LotusGymMainContainerProps {
    title: string;
    subTitle: string;
    icon: any;
    link: any;
}

export function LotusGymMainContainer({ title, subTitle, icon, link }: LotusGymMainContainerProps) {


    const styles = StyleSheet.create({
        container: {
            width: '95%',
            height: 100,
            backgroundColor: link === 'giant' || link === 'timer' ? 'transparent' : 'rgba(35, 35, 35, 0.8)',
            borderRadius: 15,
            gap: 15,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 2,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            overflow: 'hidden',
        },
        imgContainer: {
            width: '100%',
            height: 100,
            borderRadius: 15,
            position: 'absolute',
            backgroundColor: 'transparent',
            bottom: 0,
        },
        maintext: {
            color: colors.readioWhite,
            // color: colors.readioOrange,
            fontSize: 24,
            fontWeight: 'bold',
            fontFamily: readioBoldFont,
        },
        subtext: {
            color: colors.readioWhite,
            fontSize: 12,
            fontFamily: readioRegularFont,
        },
        iconContainer: {
            width: 100,
            height: 50,
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
            gap: 30,
        },
        maintextContainer: {
            width: '40%',
        },
        divider: {
            width: 1.618,
            height: 40,
            backgroundColor: colors.readioOrange,
            borderRadius: 1.618,
            marginHorizontal: 5,
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

                {/* NOTE - icon container */}
                <Link href={handleLink() as any} style={styles.subtextContainer}>

                    <View style={styles.iconContainer}>
                        <IconSymbol name={icon} size={48} color={colors.readioOrange} />
                    </View>

                    <View style={styles.divider} />

                    {/* text container */}
                    <View style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                        <Text style={styles.maintext}>{title}</Text>
                        <Text style={styles.subtext}>{subTitle}</Text>
                    </View>

                </Link>

            </View>

        </View>
    );
}