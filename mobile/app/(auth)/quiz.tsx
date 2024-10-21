import { SafeAreaView, Text, ScrollView, View, Button, TouchableOpacity } from "react-native";
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { quizSelections } from "@/constants/quizSelections";
import { useState } from "react";
import { select, set } from "ts-pattern/dist/patterns";
import { useReadio } from "@/constants/readioContext";
import { TextInput } from "react-native-gesture-handler";
import InputField from "@/components/inputField";
import { buttonStyle } from "@/constants/tokens";

// const [topicIsSelected, setTopicIsSelected] = useState(false)
// const [activeIndex, setActiveIndex] = useState(0)

export default function Quiz () {

    const {readioSelectedTopics, setReadioSelectedTopics} = useReadio()
    const [showOther, setShowOther] = useState(false);
    const [otherTopic, setOtherTopic] = useState('');
    const [otherWasUsed, setOtherWasUsed] = useState(false);

    function handleNext () {

        if (readioSelectedTopics && readioSelectedTopics.length < 3) {
            // Set default topics if less than 3 are selected
            let defaultTopics = ['Fitness', 'Health', 'Nature'];
            if (readioSelectedTopics.length > 0) {
                defaultTopics = defaultTopics.slice(0, 3 - readioSelectedTopics.length);
            }
            setReadioSelectedTopics?.([...readioSelectedTopics, ...defaultTopics]);

        }
        router.push('/(auth)/sign-up')
    }

    function toggleSelection(selection: string) {
        if (!readioSelectedTopics) return;
        if (readioSelectedTopics.includes(selection)) {
            setReadioSelectedTopics?.(readioSelectedTopics.filter(topic => topic !== selection));
        } else if (readioSelectedTopics.length < 3) {
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
    <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fff'
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
                    <Text style={{fontSize: 40, fontWeight: 'bold', color: '#fc3c44'}}>R</Text>
                    <Text style={{fontSize: 40, fontWeight: 'bold'}}>eadio</Text>
                </TouchableOpacity>

                <View></View>
            </View>

            <PageOne/>
            
            <TouchableOpacity style={buttonStyle.mainButton} onPress={() => router.push('/(auth)/sign-up')}>
                <Text style={buttonStyle.mainButtonText}>Next</Text>
            </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
        </>
    )
}

function PageOne () {

    const  {readioSelectedTopics, setReadioSelectedTopics} = useReadio()
    const [showOther, setShowOther] = useState(false);
    const [otherTopic, setOtherTopic] = useState('');
    const [otherWasUsed, setOtherWasUsed] = useState(false);

    function toggleSelection(selection: string) {
        if (!readioSelectedTopics) return;
        if (readioSelectedTopics.includes(selection)) {
            setReadioSelectedTopics?.(readioSelectedTopics.filter(topic => topic !== selection));
        } else if (readioSelectedTopics.length < 3) {
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
            <Text style={styles.title}>What topics interest you the most?</Text>
            <View style={styles.quizChoiceBoxes}>
                {quizSelections.selections.map((selection, index) => (
                    <TouchableOpacity activeOpacity={0.8} onPress={() => toggleSelection(selection)} key={index} style={ readioSelectedTopics?.includes(selection) ? styles.selectedQuizChoiceBox : styles.quizChoiceBox }>
                        <Text style={ readioSelectedTopics?.includes(selection) ? styles.selectedQuizChoiceBoxText : styles.selectionText }>{selection}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity activeOpacity={0.8} onPress={() => {setShowOther(!showOther);}} style={ showOther || otherWasUsed ? styles.selectedQuizChoiceBox : styles.quizChoiceBox}>
                    <Text style={ showOther || otherWasUsed ? styles.selectedQuizChoiceBoxText : styles.selectionText}>Other...</Text>
                </TouchableOpacity>
                {/* <Text>topics: {readioSelectedTopics}</Text> */}
                {showOther && (
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
    quizChoicesContainer: {
        display: 'flex', 
        alignItems: 'center', 
        marginVertical: 10,
        justifyContent: 'space-between',
        minHeight: '60%',
    },
    quizChoiceBoxes: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        minHeight: '50%',
        gap: 10,
        marginTop: 20
    },
    quizChoiceBox: {
        width: '48%', // Slightly less than 50% to account for spacing
        minHeight: 50,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    selectedQuizChoiceBox: {
        width: '48%', // Slightly less than 50% to account for spacing
        minHeight: 50,
        backgroundColor: '#fc3c44',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
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
    },
    button: {
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#fc3c44', 
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