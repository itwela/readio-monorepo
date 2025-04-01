import { DismissModalSymbol } from "@/components/LotusModals/DismissModalSymbol";
import { colors } from "@/constants/tokens";
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import { RootNavigationProp } from "@/types/type";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";

export default function DoneGiantStepsPopup() {

    // CONTROLS IF THE MODEL WILL SHOW OR NOT
    const { setNeedsToRefresh } = useLotusUser()
    const navigation = useNavigation<RootNavigationProp>(); // use typed navigation

    return (
        <>

            <LinearGradient style={{ flex: 1 }} colors={[colors.readioBrown, colors.readioBrown,]}>

                <View style={styles.overlayContainer}>

                    <KeyboardAvoidingView
                        behavior="padding"
                        style={{ height: '100%' }}
                    >
                        <BlurView intensity={26.18} tint="dark" style={[styles.modalBackdrop, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}>
                            <View
                                style={[styles.modalContent, {
                                    // backgroundColor: 'rgba(45, 28, 22, 1)',
                                    minHeight: 300,
                                    width: '100%',
                                    position: 'relative',
                                    backgroundColor: 'transparent',
                                    zIndex: 2,
                                }]}
                            >

                                <DismissModalSymbol color={colors.readioWhite} />


                            </View>
                        </BlurView>
                    </KeyboardAvoidingView>

                </View>

            </LinearGradient>
        </>
    )

}

const styles = StyleSheet.create({
    overlayContainer: {
        // paddingHorizontal: 16,
        // backgroundColor: colors.readioWhite,
        backgroundColor: 'transparent',
        height: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
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
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        borderRadius: 20,
        paddingTop: 20,
        height: '100%',
        width: '100%',
        position: 'relative',
        zIndex: 1001
    },
})