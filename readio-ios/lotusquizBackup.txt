import { Text, ScrollView, View, Button, TouchableOpacity } from "react-native";
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { quizSelections } from "@/constants/quizSelections";
import { useEffect, useState, useContext } from "react";
import { useReadio } from "@/constants/readioContext";
import { TextInput } from "react-native-gesture-handler";
import InputField from "@/components/inputField";
import { buttonStyle } from "@/constants/tokens";
import FastImage from "react-native-fast-image";
import { blacklogo, filter } from "@/constants/images";
import { colors } from "@/constants/tokens";
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { utilStyle } from "@/constants/tokens";
import { FontAwesome } from "@expo/vector-icons";

export default function Quiz() {

    const {readioSelectedTopics, setReadioSelectedTopics} = useReadio()
    const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0);


    useEffect(() => {
        setSelectedChoiceIndex(0);
        setReadioSelectedTopics?.([]);
    }, [])

    return (
        <>
        <SafeAreaView style={[utilStyle.safeAreaContainer, {backgroundColor: colors.readioWhite, width: "100%", minHeight: "100%", display: "flex", justifyContent: "space-between", alignItems: "center"}, utilStyle.padding]}>


            <PageOne selectedChoiceIndex={selectedChoiceIndex} setSelectedChoiceIndex={setSelectedChoiceIndex}/>
            

        </SafeAreaView>
        </>
    );
}

function PageOne ({selectedChoiceIndex, setSelectedChoiceIndex}: {selectedChoiceIndex: number, setSelectedChoiceIndex: any}) {

    const {readioSelectedTopics, setReadioSelectedTopics} = useReadio()
    const {wantsToGetStarted, setWantsToGetStarted} = useReadio()
    const [showOther, setShowOther] = useState(false);
    const [otherTopic, setOtherTopic] = useState('');
    const [otherWasUsed, setOtherWasUsed] = useState(false);
    

    function toggleSelection(questionIndex: any, selection: string) {
        if (readioSelectedTopics.includes(selection)) {
            // Remove the selection
            setReadioSelectedTopics?.(readioSelectedTopics.filter((topic: string) => topic !== selection));
            
        } else {
            // Add the selection
            setReadioSelectedTopics?.([...readioSelectedTopics, selection]);
        }
    }

    function handleNext () {

        if (readioSelectedTopics && readioSelectedTopics.length < 3) {
            // Set default topics if less than 3 are selected
            let defaultTopics = ['Fitness', 'Health', 'Nature'];
            if (readioSelectedTopics.length > 0) {
                defaultTopics = defaultTopics.slice(0, 2 - readioSelectedTopics.length);
            }
            setReadioSelectedTopics?.([...readioSelectedTopics, ...defaultTopics]);

        }

        console.log("readioSelectedTopics", readioSelectedTopics)

        router.push('/(auth)/sign-up')
    }



    return (
        <>
        <View style={styles.quizChoicesContainer}>
            <View style={{width: "100%", transform: [{translateY: -35}],  backgroundColor: "transparent", display: "flex", flexDirection: "column"}}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => { setReadioSelectedTopics?.([]); setWantsToGetStarted?.(false); router.push("/(auth)/welcome")   }} style={{width: 40, backgroundColor: "transparent", height: 30, display: "flex", alignItems: "flex-start", justifyContent: "center", position: "relative",}}>
                    <FontAwesome size={20} name="arrow-left"/>
                </TouchableOpacity>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: "100%", gap: 10, marginVertical: 5}}>

                    <View style={{width: "100%", display: "flex", flexDirection: "row"}}>
                        <TouchableOpacity  style={{width: "80%", height: 10, backgroundColor: colors.readioOrange, borderRadius: 10}} activeOpacity={0.9}>
                        </TouchableOpacity>
                        <TouchableOpacity style={{width: "20%", height: 10, backgroundColor: colors.readioDustyWhite, borderRadius: 10}} activeOpacity={0.9}>
                        </TouchableOpacity>
                    </View>

                </View>
                <Text  allowFontScaling={false} style={[styles.subtext, {}]}>Step 1 / 2</Text>
                <Text  allowFontScaling={false} style={{fontSize: 40, fontWeight: 'bold',}}>Which categories would you like to explore?</Text>
                <Text  allowFontScaling={false} style={styles.subtext}>Select at least 3 to continue.</Text>
                <View  style={styles.quizChoiceBoxes}>

                    <ScrollView style={{width: "100%", backgroundColor: "transparent", display: "flex", flexDirection: "column", gap: 10}} key={0}>
                        {quizSelections.selections?.[0]?.map((select: any, index: any) => (
                            <TouchableOpacity key={index} activeOpacity={0.8} onPress={() => toggleSelection( index, select )} style={ readioSelectedTopics?.includes(select) ? styles.selectedQuizChoiceBox : styles.quizChoiceBox }>
                                {/* <FastImage source={{uri: filter}} style={[{zIndex: 1, opacity: 0.3, position: 'absolute', width: "100%", height: "100%", borderRadius: 10}]} resizeMode='cover'/> */}
                                {/* <FastImage source={{uri: quizSelections.images[selectedChoiceIndex][0]}} style={{width: "100%", height: "100%", position: 'absolute', borderRadius: 10, zIndex: -2}} resizeMode='cover' /> */}
                                <View style={{ borderRadius: 5, zIndex: 1,}}>
                                    <Text  allowFontScaling={false} style={ readioSelectedTopics?.includes(select) ? styles.selectionText : styles.regularText }>{select}</Text>
                                    <Text  allowFontScaling={false} style={ styles.smallersubtext }>{quizSelections?.selections?.[1]?.[index]}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                        <View style={{display: 'flex', flexDirection: 'column', width: "100%", justifyContent: 'space-between', gap: 10, marginTop: 5}}>

                            {readioSelectedTopics?.length > 2 && (
                                <>
                            <TouchableOpacity activeOpacity={0.9} style={buttonStyle.mainButton} onPress={handleNext}>  
                                <Text  allowFontScaling={false} style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Sign Up</Text>
                            </TouchableOpacity>
                                </>
                            )}

                            {readioSelectedTopics?.length < 3 && (
                                <>
                            <TouchableOpacity activeOpacity={0.9} style={[buttonStyle.mainButton, {backgroundColor: colors.readioDustyWhite}]} onPress={readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][0]) || readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][1]) 
                                ? handleNext : () => console.log("awaiting selection")}>  
                                <Text  allowFontScaling={false} style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Sign Up</Text>
                            </TouchableOpacity>
                                </>
                            )}

                        </View>
                    </ScrollView>

                </View>
            </View>
         </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontSize: 60,
      fontWeight: 'bold',
    },
    quizChoicesContainer: {
        display: 'flex', 
        marginVertical: 10,
        justifyContent: "space-between",
        height: '80%',
        backgroundColor: "transparent",
        width: '100%',
    },
    quizChoiceBoxes: {
        display: 'flex',
        flexDirection: 'column',
        // flexWrap: 'wrap',
        justifyContent: "flex-start",
        gap: 10,
        marginTop: 5,
        width: '100%',
        backgroundColor: 'transparent',
    },
    quizChoiceBox: {
        width: '100%', // Slightly less than 50% to account for spacing
        minHeight: 75,
        backgroundColor: colors.readioDustyWhite,
        justifyContent: "center",
        alignItems: "flex-start",
        borderRadius: 8,
        marginVertical: 2,
        paddingHorizontal: 20,
    },
    selectedQuizChoiceBox: {
        width: '100%', // Slightly less than 50% to account for spacing
        minHeight: 75,
        backgroundColor: colors.readioDustyWhite,
        justifyContent: "center",
        alignItems: "flex-start",
        borderRadius: 8,
        marginVertical: 2,
        borderColor: colors.readioOrange,
        borderWidth: 3,
        paddingHorizontal: 20,
    },
    selectedQuizChoiceBoxText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: readioBoldFont  
    },
    heading: {
      fontSize: 60,
      fontWeight: 'bold',
    },
    title: {
      fontSize: 45,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
    },
    option: {
      fontSize: 20,
      paddingVertical: 10
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: '80%',
    },
    regularText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.readioBlack,
      fontFamily: readioBoldFont
    },
    selectionText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.readioOrange,
      fontFamily: readioBoldFont
    },
    button: {
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.readioOrange, 
        borderRadius: 80, 
        padding: 8,
        marginVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    subtext: {
        fontSize: 18,
        opacity: 0.8,
        fontFamily: readioRegularFont,
        color: colors.readioOrange,
        fontWeight: 'bold',
        marginVertical: 5
    },
    smallersubtext: {
        fontSize: 14,
        opacity: 0.8,
        fontFamily: readioRegularFont,
        color: colors.readioBlack,
        fontWeight: 'bold',
    },
  });
