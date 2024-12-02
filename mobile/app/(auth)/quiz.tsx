import { SafeAreaView, Text, ScrollView, View, Button, TouchableOpacity } from "react-native";
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { quizSelections } from "@/constants/quizSelections";
import { useEffect, useState, useContext } from "react";
import { select, set } from "ts-pattern/dist/patterns";
import { useReadio } from "@/constants/readioContext";
import { TextInput } from "react-native-gesture-handler";
import InputField from "@/components/inputField";
import { buttonStyle } from "@/constants/tokens";
import FastImage from "react-native-fast-image";
import { filter } from "@/constants/images";
import { colors } from "@/constants/tokens";

// const [topicIsSelected, setTopicIsSelected] = useState(false)
// const [activeIndex, setActiveIndex] = useState(0)

export default function Quiz () {
    
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
    <SafeAreaView style={{
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
            {/* <Text style={styles.option} onPress={() => router.push('/(auth)/welcome')}>Welcome</Text> */}
                        {/* header */}
            <View style={{ width:'100%', height: '6%', display: 'flex', justifyContent: 'space-between' }}>    
                
                <TouchableOpacity onPress={() => router.push('/(auth)/welcome')} style={{display: 'flex', flexDirection: 'row'}}>
                    <Text style={{fontSize: 40, fontWeight: 'bold', color: colors.readioOrange}}>R</Text>
                    <Text style={{fontSize: 40, fontWeight: 'bold'}}>eadio</Text>
                </TouchableOpacity>

                <View></View>
            </View>

            <PageOne selectedChoiceIndex={selectedChoiceIndex} setSelectedChoiceIndex={setSelectedChoiceIndex}/>
            
            
            <View style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10}}>

            {selectedChoiceIndex > 0 && (
                <TouchableOpacity style={[buttonStyle.mainButton, {backgroundColor: '#ccc'}]} onPress={handlePreviousChoice}>
                    <Text style={[buttonStyle.mainButtonText, {color: "#000"}]}>Back</Text>
                </TouchableOpacity>
            )}

            {selectedChoiceIndex === 0 && (
                <TouchableOpacity style={[buttonStyle.mainButton, {backgroundColor: '#ccc'}]} onPress={handleGoHome}>
                    <Text style={[buttonStyle.mainButtonText, {color: "#000"}]}>Back</Text>
                </TouchableOpacity>
            )}

            {selectedChoiceIndex < 6 && (readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][0]) || readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][1])) && (
                <TouchableOpacity style={buttonStyle.mainButton} onPress={handleNextChoice}>
                    <Text style={buttonStyle.mainButtonText}>Next</Text>
                </TouchableOpacity>
            )}

            {selectedChoiceIndex === 6 && (readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][0]) || readioSelectedTopics?.includes(quizSelections.selections[selectedChoiceIndex][1])) && (
                <>
                <TouchableOpacity style={buttonStyle.mainButton} onPress={handleNext}>
                    <Text style={buttonStyle.mainButtonText}>Sign Up</Text>
                </TouchableOpacity>
                </>
            )}

            </View>

            </ScrollView>
        </SafeAreaView>
        </>
    )
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
            <ScrollView style={styles.quizChoiceBoxes}>
                {/* {quizSelections.selections?.map((selectionGroup, groupIndex) => (
                    <View style={{width: "90%"}} key={groupIndex}>
                        {selectionGroup?.map((selection, index) => (
                            <TouchableOpacity activeOpacity={0.8} onPress={() => toggleSelection(selection)} key={index} style={ readioSelectedTopics?.includes(selection) ? styles.selectedQuizChoiceBox : styles.quizChoiceBox }>
                                <Text style={ readioSelectedTopics?.includes(selection) ? styles.selectedQuizChoiceBoxText : styles.selectionText }>{selection}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))} */}

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

                    {/* <View style={{width: "90%"}}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => {setShowOther(!showOther);}} style={ showOther || otherWasUsed ? styles.selectedQuizChoiceBox : styles.quizChoiceBox}>
                    <Text style={ showOther || otherWasUsed ? styles.selectedQuizChoiceBoxText : styles.selectionText}>Other...</Text>
                </TouchableOpacity>
                </View> */}

                {/* <Text>topics: {readioSelectedTopics}</Text> */}
               
                {/* {showOther && (
                    <View style={{padding: 10, width: '100%', marginVertical: 10}}>
                        <InputField
                            label="Other:"
                            placeholder="Enter your topic here"
                            value={otherTopic}
                            onChangeText={(text) => setOtherTopic(text)}
                        />
                        <TouchableOpacity style={[buttonStyle.mainButton, {marginTop: 10}]} onPress={addOtherTopic}>
                            <Text style={buttonStyle.mainButtonText}>Add Topic</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={{width: '100%'}}>

                    <Text style={[styles.title, {marginVertical: 20}]}>Selected Topics: </Text>
                    <Text style={[styles.title, {marginBottom: 20, color: '#fc3c44'}]}>{readioSelectedTopics?.join(', ') || ''}</Text>
                    <Text style={[styles.title, {textAlign: 'center', color: '#999999'}]} onPress={() => {setOtherWasUsed(false); setReadioSelectedTopics?.([]);}}>Reset</Text>

                </View> */}

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
    quizChoicesContainer: {
        display: 'flex', 
        alignItems: 'center', 
        marginVertical: 10,
        justifyContent: "flex-start",
        height: '60%',
        backgroundColor: "transparent",
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
    },
    heading: {
      fontSize: 60,
      fontWeight: 'bold',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
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