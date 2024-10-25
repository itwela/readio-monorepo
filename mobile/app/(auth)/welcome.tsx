import { SafeAreaView, Text, ScrollView, View, TouchableOpacity } from "react-native";
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { buttonStyle } from "@/constants/tokens";


export default function Welcome () {

    console.log("Hello")

    return (
        <>
    <SafeAreaView style={{
      flex: 1,
      alignItems: 'center',
      backgroundColor: '#fff'
    }}>
        <ScrollView 
            style={{ 
                width: '90%', 
                flex: 1,
            }}
            contentContainerStyle={{
                height: '100%',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}
        >
            {/* header */}
            <View style={{ width:'100%', height: '6%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                
                <TouchableOpacity onPress={() => router.push('/(auth)/welcome')} style={{display: 'flex', flexDirection: 'row'}}>
                    <Text style={{fontSize: 40, fontWeight: 'bold', color: '#fc3c44'}}>R</Text>
                    <Text style={{fontSize: 40, fontWeight: 'bold'}}>eadio</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
                    <Text>Skip</Text>
                </TouchableOpacity>

            </View>

            <View 
                style={{
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {/* <Text style={styles.heading}>Welcome</Text> */}
                <Text style={styles.title}>
                Discover a new way to experience articles, tailored just for you.
                </Text>
                <View style={{width: '70%'}}>

                <Text style={styles.subtext}>
                Get started by telling us a bit about your interests.            
                </Text>

                </View>
            </View>

            <View style={{paddingVertical: 20}}>

                <TouchableOpacity style={buttonStyle.mainButton} onPress={() => router.push('/(auth)/quiz')}>
                    <Text style={buttonStyle.mainButtonText}>Get Started</Text>
                </TouchableOpacity>

            {/* <Text style={styles.option} onPress={() => router.push('/(auth)/sign-in')}>Sign-In</Text> */}
            {/* <Text style={styles.option} onPress={() => router.push('/(auth)/sign-up')}>Sign-Up</Text> */}
            <Text style={styles.option} onPress={() => router.push('/(tabs)/home')}>Enter App</Text>
            
            </View>
        </ScrollView>
    </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heading: {
      fontSize: 60,
      fontWeight: 'bold',
    },
    title: {
        fontSize: 30,
        paddingVertical: 10,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    option: {
      fontSize: 20,
      paddingVertical: 10,
      textAlign: 'center',
      fontWeight: 'bold'
    },
    subtext: {
        fontSize: 15,
        opacity: 0.5,
        textAlign: 'center',
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: '80%',
    },
});