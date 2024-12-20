import { useReadio } from '@/constants/readioContext';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity} from 'react-native';
// import { useNavigation } from "@react-navigation/native";
// import { RootNavigationProp } from "@/types/type";
import { router } from 'expo-router';
import { buttonStyle, utilStyle } from "@/constants/tokens";
import { bookshelfImg } from "@/constants/images";
import { colors } from "@/constants/tokens";
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import FastImage from "react-native-fast-image";

export default function Welcome() {
    
    const { isSignedInLotus, setIsSignedInLotus } = useReadio();
    const colorscheme = useColorScheme();

    return (
        <>
        {/* <View style={{zIndex: -1, opacity: 0.618, position: 'absolute', width: '100%', height: '100%', backgroundColor: '#000'}}></View>
        <SafeAreaView style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'transparent',
        }}>
            <View 
                style={{ 
                    width: '90%', 
                    flex: 1,
                    height: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <View style={{ width:'100%', height: '6%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    
                    <TouchableOpacity activeOpacity={0.99} onPress={() => router.push('/(auth)/welcome')} style={{display: 'flex', flexDirection: 'row'}}>
                        <Text style={{fontSize: 40, fontWeight: 'bold', color: colors.readioOrange, fontFamily: readioBoldFont}}>L</Text>
                        <Text style={{fontSize: 40, fontWeight: 'bold', fontFamily: readioBoldFont, color: colors.readioWhite}}>otus</Text>
                    </TouchableOpacity>
                </View>

                <View 
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Text style={styles.title}>
                    Discover a new way to experience articles, tailored just for you.
                    </Text>
                    <View style={{width: '70%'}}>

                    <Text style={styles.subtext}>
                    Get started by telling us a bit about your interests.            
                    </Text>
                    <Text onPress={() => router.push('/(auth)/sign-up')} style={styles.subtext}>
                    Sign Up           
                    </Text>
                    <Text onPress={() => router.push('/(auth)/sign-in')} style={styles.subtext}>
                    Sign In           
                    </Text>

                    </View>
                </View>

                <View style={{paddingVertical: 20, display: 'flex', alignItems: 'center'}}>

                    <TouchableOpacity style={buttonStyle.mainButton} onPress={() => router.push('/(auth)/quiz')}>
                        <Text style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Get Started</Text>
                    </TouchableOpacity>

                    <Text style={{marginTop: 10, color: colors.readioWhite, width: '100%', display: 'flex', textAlign: 'center', fontFamily: readioRegularFont}}>Already have an account?</Text>
                <Text style={[styles.option]} onPress={() => router.push('/(tabs)/home')}>Enter App</Text>
                
                </View>

            </View>

        </SafeAreaView> */}
        <View style={{zIndex: -1, opacity: 0.618, position: 'absolute', width: '100%', height: '100%', backgroundColor: '#000'}}></View>
        <FastImage source={{uri: bookshelfImg}} style={[{zIndex: -2, opacity: 1, position: 'absolute', width: '100%', height: '100%'}]} resizeMode='cover'/>
        <SafeAreaView style={utilStyle.safeAreaContainer}>
            <View style={styles.container}>
           
                <View style={{ width:'100%', height: '6%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    
                    <TouchableOpacity activeOpacity={0.99} onPress={() => router.push('/(auth)/welcome')} style={{display: 'flex', flexDirection: 'row'}}>
                        <Text style={{fontSize: 40, fontWeight: 'bold', color: colors.readioOrange, fontFamily: readioBoldFont}}>L</Text>
                        <Text style={{fontSize: 40, fontWeight: 'bold', fontFamily: readioBoldFont, color: colors.readioWhite}}>otus</Text>
                    </TouchableOpacity>
                </View>

                <View 
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Text style={styles.title}>
                    Discover a new way to experience articles, tailored just for you.
                    </Text>
                    <View style={{width: '70%'}}>

                    <Text style={styles.subtext}>
                    Get started by telling us a bit about your interests.            
                    </Text>

                    <Text onPress={() => router.push('/(auth)/sign-up')} style={styles.subtext}>
                    Sign Up           
                    </Text>
                    <Text onPress={() => router.push('/(auth)/sign-in')} style={styles.subtext}>
                    Sign In           
                    </Text>

                    </View>
                </View>

                <View style={{paddingVertical: 20, display: 'flex', alignItems: 'center'}}>

                    <TouchableOpacity activeOpacity={0.9} style={buttonStyle.mainButton} onPress={() => router.push('/(auth)/quiz')}>
                        <Text style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Get Started</Text>
                    </TouchableOpacity>

                    <Text style={{marginTop: 10, color: colors.readioWhite, width: '100%', display: 'flex', textAlign: 'center', fontFamily: readioRegularFont}}>Already have an account?</Text>
                
                    <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(tabs)/home')}>
                        <Text style={[styles.option]}>Enter App</Text>
                    </TouchableOpacity>

                </View>


            </View>
        </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: "space-evenly",
    },
    text: {
        fontSize: 60,
        fontWeight: 'bold',
        fontFamily: readioBoldFont,
        color: colors.readioWhite
    },
    option: {
        fontSize: 20,
        paddingVertical: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        fontFamily: readioBoldFont,
        color: colors.readioWhite
    },
    title: {
        fontSize: 30,
        paddingVertical: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        fontFamily: readioBoldFont,
        color: colors.readioWhite,
    },
    subtext: {
        fontSize: 15,
        opacity: 0.5,
        textAlign: 'center',
        fontFamily: readioRegularFont,
        color: colors.readioWhite
    },
});