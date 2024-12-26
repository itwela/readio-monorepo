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
import { filter } from "@/constants/images";
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
        setSelectedChoiceIndex(selectedChoiceIndex - 1);
        console.log("selectedChoiceIndex", selectedChoiceIndex)
    }

    const handleGoHome = () => {
        router.push('/(auth)/welcome'); // <-- Using 'player' as screen name
    }

    useEffect(() => {
        setSelectedChoiceIndex(0);
    }, [])

    return (
        <>
            {/* <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: colors.readioWhite
    }}>
        <ScrollView 
            style={{ 
                width: '90%', 
                display: 'flex',
            }}
            contentContainerStyle={{
                height: '100%',
                justifyContent: 'space-between',
            }}
        >
            <View style={{ width:'100%', height: '6%', display: 'flex', justifyContent: 'space-between' }}>    
                
                <TouchableOpacity onPress={() => router.push('/(auth)/welcome')} style={{display: 'flex', flexDirection: 'row'}}>
                    <Text style={{fontSize: 40, fontWeight: 'bold', color: colors.readioOrange, fontFamily: readioBoldFont}}>L</Text>
                    <Text style={{fontSize: 40, fontWeight: 'bold', fontFamily: readioBoldFont}}>otus</Text>
                </TouchableOpacity>

                <View></View>
            </View>

            <PageOne selectedChoiceIndex={selectedChoiceIndex} setSelectedChoiceIndex={setSelectedChoiceIndex}/>
            
            
            <View style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10}}>

            {selectedChoiceIndex > 0 && (
                <TouchableOpacity style={[buttonStyle.mainButton, {backgroundColor: colors.readioBlack}]} onPress={handlePreviousChoice}>
                    <Text style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Back</Text>
                </TouchableOpacity>
            )}

            {selectedChoiceIndex === 0 && (
                <TouchableOpacity style={[buttonStyle.mainButton, {backgroundColor: colors.readioBlack}]} onPress={handleGoHome}>
                    <Text style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Back</Text>
                </TouchableOpacity>
            )}

            {selectedChoiceIndex < 6 && (readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][0]) || readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][1])) && (
                <TouchableOpacity style={buttonStyle.mainButton} onPress={handleNextChoice}>
                    <Text style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Next</Text>
                </TouchableOpacity>
            )}

            {selectedChoiceIndex === 6 && (readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][0]) || readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][1])) && (
                <>
                <TouchableOpacity style={buttonStyle.mainButton} onPress={handleNext}>
                    <Text style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Sign Up</Text>
                </TouchableOpacity>
                </>
            )}

            </View>

            </ScrollView>
        </SafeAreaView> */}
        <SafeAreaView style={[utilStyle.safeAreaContainer, {backgroundColor: colors.readioWhite, width: "100%", height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center"}, utilStyle.padding]}>
            
            <View style={{ width:'100%', height: '6%', display: 'flex', justifyContent: 'space-between' }}>    
                
                <TouchableOpacity onPress={() => router.push('/(auth)/welcome')} style={{display: 'flex', flexDirection: 'row'}}>
                    <Text style={{fontSize: 40, fontWeight: 'bold', color: colors.readioOrange, fontFamily: readioBoldFont}}>L</Text>
                    <Text style={{fontSize: 40, fontWeight: 'bold', fontFamily: readioBoldFont}}>otus</Text>
                </TouchableOpacity>

                <View></View>
            </View>

            <PageOne selectedChoiceIndex={selectedChoiceIndex} setSelectedChoiceIndex={setSelectedChoiceIndex}/>
            
            
            <View style={{display: 'flex', flexDirection: 'column', width: "100%", justifyContent: 'space-between', gap: 10}}>

            {selectedChoiceIndex > 0 && (
                <TouchableOpacity style={[buttonStyle.mainButton, {backgroundColor: colors.readioBlack}]} onPress={handlePreviousChoice}>
                    <Text style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Back</Text>
                </TouchableOpacity>
            )}

            {selectedChoiceIndex === 0 && (
                <TouchableOpacity style={[buttonStyle.mainButton, {backgroundColor: colors.readioBlack}]} onPress={handleGoHome}>
                    <Text style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Back</Text>
                </TouchableOpacity>
            )}

            {selectedChoiceIndex < 6 && (readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][0]) || readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][1])) && (
                <TouchableOpacity style={buttonStyle.mainButton} onPress={handleNextChoice}>
                    <Text style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Next</Text>
                </TouchableOpacity>
            )}

            {selectedChoiceIndex === 6 && (readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][0]) || readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][1])) && (
                <>
                <TouchableOpacity style={buttonStyle.mainButton} onPress={handleNext}>
                    <Text style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Sign Up</Text>
                </TouchableOpacity>
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
    

    function toggleSelection(selection: string) {
        if (!readioSelectedTopics) return;
        if (readioSelectedTopics.includes(selection)) {
            setReadioSelectedTopics?.(readioSelectedTopics.filter(topic => topic !== selection));
        } else if (readioSelectedTopics.length < 7) {
            setReadioSelectedTopics?.([...readioSelectedTopics, selection]);
        }
    }

    function addOtherTopic() {
        if (readioSelectedTopics && readioSelectedTopics.length < 3) {
            setReadioSelectedTopics?.([...readioSelectedTopics, otherTopic]);
            setOtherTopic('');
            setOtherWasUsed(true);
        }
    }


    return (
        <>
        <View style={styles.quizChoicesContainer}>
            <Text style={styles.title}>Which do you like more?</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.quizChoiceBoxes}>


                {quizSelections.selections?.[selectedChoiceIndex] && (
                    <View style={{width: "90%"}} key={0}>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => toggleSelection(quizSelections.selections[selectedChoiceIndex][0])} key={0} style={ readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][0]) ? styles.selectedQuizChoiceBox : styles.quizChoiceBox }>
                            <FastImage source={{uri: filter}} style={[{zIndex: 1, opacity: 0.3, position: 'absolute', width: "100%", height: "100%", borderRadius: 10}]} resizeMode='cover'/>
                            <FastImage source={{uri: quizSelections.images[selectedChoiceIndex][0]}} style={{width: "100%", height: "100%", position: 'absolute', borderRadius: 10, zIndex: -2}} resizeMode='cover' />
                            <View style={{ backgroundColor: readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][0]) ? colors.readioOrange : "rgba(0, 0, 0, 0.5)", padding: 10, borderRadius: 5, zIndex: 1,}}>
                                <Text style={ readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][0]) ? styles.selectedQuizChoiceBoxText : styles.selectionText }>{quizSelections.selections[selectedChoiceIndex][0]}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
           
                {quizSelections.selections?.[selectedChoiceIndex] && (
                    <View style={{width: "90%"}} key={1}>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => toggleSelection(quizSelections.selections[selectedChoiceIndex][1])} key={1} style={ readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][1]) ? styles.selectedQuizChoiceBox : styles.quizChoiceBox }>
                            <FastImage source={{uri: filter}} style={[{zIndex: 1, opacity: 0.3, position: 'absolute', width: "100%", height: "100%", borderRadius: 10}]} resizeMode='cover'/>
                            <FastImage source={{uri: quizSelections.images[selectedChoiceIndex][1]}} style={{width: "100%", height: "100%", position: 'absolute', borderRadius: 10, zIndex: -2}} resizeMode='cover' />
                            <View style={{ backgroundColor: readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][1]) ? colors.readioOrange : "rgba(0, 0, 0, 0.5)", padding: 10, borderRadius: 5, zIndex: 1,}}>
                                <Text style={ readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][1]) ? styles.selectedQuizChoiceBoxText : styles.selectionText }>{quizSelections.selections[selectedChoiceIndex][1]}</Text>
                            </View>                        
                            </TouchableOpacity>
                    </View>
                )}

                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', width: "100%", gap: 10, marginVertical: 10}}>
                {quizSelections.selections?.map((selectionGroup, groupIndex) => (
                    <View key={groupIndex} style={{width: 10, height: 10, backgroundColor: selectedChoiceIndex === groupIndex ? colors.readioOrange : "#ccc", borderRadius: 10}}/>
                ))}
                </View>

            

            </ScrollView>
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
        alignItems: 'center', 
        marginVertical: 10,
        justifyContent: "flex-start",
        height: '60%',
        backgroundColor: "transparent",
        width: '100%',
    },
    quizChoiceBoxes: {
        display: 'flex',
        flexDirection: 'column',
        // flexWrap: 'wrap',
        height: '50%',
        gap: 10,
        marginTop: 20,
        width: '100%',
        backgroundColor: 'transparent',
    },
    quizChoiceBox: {
        width: '108%', // Slightly less than 50% to account for spacing
        minHeight: 180,
        // backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 2
    },
    selectedQuizChoiceBox: {
        width: '108%', // Slightly less than 50% to account for spacing
        minHeight: 180,
        backgroundColor: colors.readioOrange,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 2,
        
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
      fontSize: 20,
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
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
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
  });
