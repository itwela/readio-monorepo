import { getLocalImageUri } from "@/constants/imageAssets";
import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { useLotusGiantSteps } from "@/helpers/providers/lotusGiantStepsProvider";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, KeyboardAvoidingView, Modal, SafeAreaView, Text, TouchableOpacity, View } from "react-native";


// TODO
export function LotusDoneGiantStepsModal () {

    const {isDoneModalVisible, setIsDoneModalVisible} = useLotusGiantSteps()
    const { 
        location, setLocation,
        elapsedTime, setElapsedTime,
        steps, setSteps,
        totalDistance, setTotalDistance,
        previousLocation, setPreviousLocation,
        selection, setSelection,
        appState, setAppState,
        search, setSearch,
        speed, setSpeed,
        fetchingLocation, setFetchingLocation,
        errorMsg, setErrorMsg,
        handleClearSearch,
        resetAudio,
        formatTime,
        requestPermissions,
        startTimer,
        stopTimer,
        intervalRef,
        locationSubscription,
        toggleModal,
        sessionSteps,
        sessionTime,
        sessionDistance
    } = useLotusGiantSteps();
      


    return (
        <>
        <Modal
            animationType="slide"
            transparent={true}
            visible={isDoneModalVisible}
            onRequestClose={toggleModal}
            style={{ width: '100%', height: '100%' }}
        >
            <SafeAreaView style={{ width: '100%', height: '100%', backgroundColor: colors.readioBrown, }}>
            <View style={{ width: '100%', display: 'flex', paddingHorizontal: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: "transparent" }}>
                <Image
                style={{ width: 50, height: 50 }}
                source={{uri: getLocalImageUri('whiteLogo')}}
                resizeMode="contain"
                />
                <TouchableOpacity onPress={toggleModal}>
                <FontAwesome name="close" size={30} color={colors.readioWhite} />
                </TouchableOpacity>
            </View>
            {/* <DismissPlayerSymbol></DismissPlayerSymbol>   */}
            <Image
                source={{uri: getLocalImageUri('mapImg')}}
                style={{ zIndex: -2, position: 'absolute', width: '100%', height: '30%' }}
                resizeMode="cover"
            />
            <LinearGradient
                colors={[colors.readioBrown, 'transparent']}
                style={{
                zIndex: -1,
                bottom: '75%',
                position: 'absolute',
                width: '150%',
                height: '100%',
                transform: [{ rotate: '-180deg' }],
                }}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1.318 }}
            />

            <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={10} style={{ padding: 20, width: '100%', height: '100%', display: 'flex', justifyContent: "flex-start", }}>


                <View style={{ gap: 30, padding: 10 }}>

                <View style={{ gap: 30, display: 'flex', flexDirection: 'row', width: '100%' }}>

                    <View style={{ width: '50%' }}>
                    <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 50, fontFamily: readioBoldFont }} >{sessionSteps}</Text>
                    <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont }}>Steps</Text>
                    </View>


                    <View style={{ width: '50%' }}>
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 50, fontFamily: readioBoldFont }} >{formatTime(sessionTime)}</Text>
                    </View>
                    <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont }}>Time spent walking</Text>
                    </View>

                </View>

                <View style={{ gap: 30, display: 'flex', flexDirection: 'row', width: '100%' }}>

                    <View style={{ width: '50%' }}>
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 50, fontFamily: readioBoldFont }} >{sessionDistance?.toFixed(2)}</Text>
                        <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont }}>MI</Text>
                    </View>
                    <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont }}>Miles</Text>
                    </View>

                    <View style={{ width: '50%' }}>
                    <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 50, fontFamily: readioBoldFont }} >Nice!</Text>
                    <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont }}>Great Session!</Text>
                    </View>

                </View>

                </View>

            </KeyboardAvoidingView>

            </SafeAreaView>
        </Modal>
        </>
    )
}