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

export default function Quiz() {

    const {readioSelectedTopics, setReadioSelectedTopics} = useReadio()
    const [showOther, setShowOther] = useState(false);
    const [otherTopic, setOtherTopic] = useState('');
    const [otherWasUsed, setOtherWasUsed] = useState(false);
    const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0);

    function handleNext () {

        if (readioSelectedTopics && readioSelectedTopics.length < 3) {
            // Set default topics if less than 3 are selected
            let defaultTopics = ['Fitness', 'Health', 'Nature'];
            if (readioSelectedTopics.length > 0) {
                defaultTopics = defaultTopics.slice(0, 7 - readioSelectedTopics.length);
            }
            setReadioSelectedTopics?.([...readioSelectedTopics, ...defaultTopics]);

        }

        console.log("readioSelectedTopics", readioSelectedTopics)

        router.push('/(auth)/sign-up')
    }

    const handleNextChoice = () => {        

        setSelectedChoiceIndex(selectedChoiceIndex + 1);
        console.log("selectedChoiceIndex", selectedChoiceIndex)
        
    }


    const handlePreviousChoice = () => {
        if (selectedChoiceIndex === 0) return;
        if (readioSelectedTopics?.[readioSelectedTopics.length - 1]) {
            
        }
        setSelectedChoiceIndex(selectedChoiceIndex - 1);
        console.log("selectedChoiceIndex", selectedChoiceIndex)
    }

    const handleGoHome = () => {
        router.push('/(auth)/welcome'); // <-- Using 'player' as screen name
    }

    useEffect(() => {
        setSelectedChoiceIndex(0);
        setReadioSelectedTopics?.([]);
    }, [])

    return (
        <>
        <SafeAreaView style={[utilStyle.safeAreaContainer, {backgroundColor: colors.readioWhite, width: "100%", height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center"}, utilStyle.padding]}>

            <PageOne selectedChoiceIndex={selectedChoiceIndex} setSelectedChoiceIndex={setSelectedChoiceIndex}/>
            
            
            <View style={{display: 'flex', flexDirection: 'column', width: "100%", justifyContent: 'space-between', gap: 10}}>

                {readioSelectedTopics?.length > 2 && (
                    <>
                <TouchableOpacity activeOpacity={0.9} style={buttonStyle.mainButton} onPress={readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][0]) || readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][1]) 
                    ? handleNext : () => console.log("awaiting selection")}>  
                    <Text style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Sign Up</Text>
                </TouchableOpacity>
                    </>
                )}

                {readioSelectedTopics?.length < 3 && (
                    <>
                <TouchableOpacity activeOpacity={0.9} style={[buttonStyle.mainButton, {backgroundColor: colors.readioDustyWhite}]} onPress={readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][0]) || readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][1]) 
                    ? handleNext : () => console.log("awaiting selection")}>  
                    <Text style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Sign Up</Text>
                </TouchableOpacity>
                    </>
                )}

            {selectedChoiceIndex === 6 && (
                <>
                </>
            )}

            </View>
        </SafeAreaView>
        </>
    );
}

function PageOne ({selectedChoiceIndex, setSelectedChoiceIndex}: {selectedChoiceIndex: number, setSelectedChoiceIndex: any}) {

    const {readioSelectedTopics, setReadioSelectedTopics} = useReadio()
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



    return (
        <>
        <View style={styles.quizChoicesContainer}>
            <View style={{width: "100%", display: "flex", flexDirection: "column"}}>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: "100%", gap: 10, marginVertical: 5}}>
                {quizSelections.selections?.map((selectionGroup, groupIndex) => (
                    <TouchableOpacity  style={{width: selectedChoiceIndex === groupIndex ? "70%" : "30%", height: 10, backgroundColor: selectedChoiceIndex === groupIndex ? colors.readioOrange : "#ccc", borderRadius: 10}} activeOpacity={0.9} key={groupIndex} onPress={() => setSelectedChoiceIndex(groupIndex)}>
                        <View/>
                    </TouchableOpacity>
                ))}
                </View>
                <Text style={styles.subtext}></Text>
                <Text style={{fontSize: 40, fontWeight: 'bold',}}>Which categories would you like to explore?</Text>
                <Text style={styles.subtext}>Select at least 3 to continue.</Text>
            <View  style={styles.quizChoiceBoxes}>


                    <View style={{width: "90%", display: "flex", flexDirection: "column", gap: 10}} key={0}>
                    {quizSelections.selections?.[0]?.map((select: any, index: any) => (
                        <TouchableOpacity key={index} activeOpacity={0.8} onPress={() => toggleSelection( index, select )} style={ readioSelectedTopics?.includes(select) ? styles.selectedQuizChoiceBox : styles.quizChoiceBox }>
                            {/* <FastImage source={{uri: filter}} style={[{zIndex: 1, opacity: 0.3, position: 'absolute', width: "100%", height: "100%", borderRadius: 10}]} resizeMode='cover'/> */}
                            {/* <FastImage source={{uri: quizSelections.images[selectedChoiceIndex][0]}} style={{width: "100%", height: "100%", position: 'absolute', borderRadius: 10, zIndex: -2}} resizeMode='cover' /> */}
                            <View style={{ borderRadius: 5, zIndex: 1,}}>
                                <Text style={ styles.selectionText }>{select}</Text>
                                <Text style={ styles.smallersubtext }>{quizSelections?.selections?.[1]?.[index]}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                    </View>

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
        marginTop: 20,
        width: '100%',
        backgroundColor: 'transparent',
    },
    quizChoiceBox: {
        width: '108%', // Slightly less than 50% to account for spacing
        minHeight: 70,
        backgroundColor: colors.readioDustyWhite,
        justifyContent: "center",
        alignItems: "flex-start",
        borderRadius: 8,
        marginVertical: 2,
        paddingHorizontal: 10
    },
    selectedQuizChoiceBox: {
        width: '108%', // Slightly less than 50% to account for spacing
        minHeight: 70,
        backgroundColor: colors.readioDustyWhite,
        justifyContent: "center",
        alignItems: "flex-start",
        borderRadius: 8,
        marginVertical: 2,
        paddingHorizontal: 10,
        borderColor: colors.readioOrange,
        borderWidth: 3,
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
        fontSize: 20,
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
