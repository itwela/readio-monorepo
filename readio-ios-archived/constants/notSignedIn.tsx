import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { buttonStyle } from './tokens';
import { router } from 'expo-router';
import { colors } from './tokens';

export default function NotSignedIn() {
    return (
        <>
            <View style={{ display: 'flex', flexDirection: 'column', gap: 20, alignContent: 'center', justifyContent: 'space-between', minWidth: '100%', alignItems: 'center', minHeight: '50%' }}>

                                
                <View style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', }}>

                <TouchableOpacity onPress={() => router.push('/(auth)/welcome')} style={{display: 'flex', flexDirection: 'row',}}>
                    <Text style={{fontSize: 40, fontWeight: 'bold', color: 'transparent'}}>R</Text>
                    <Text style={{fontSize: 40, fontWeight: 'bold', color: 'transparent'}}>eadio</Text>
                </TouchableOpacity>

                </View>


                <View style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', alignItems: 'center' }}>

                    <Text style={[styles.title]}>
                    You made it to Lotus without an account. Sign in or sign up below to get started.
                    </Text>

                    <TouchableOpacity style={buttonStyle.mainButton} onPress={() => router.push('/(auth)/sign-in')}>
                        <Text style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Sign In</Text>
                    </TouchableOpacity>

                    <Text style={[styles.option, {color: colors.readioWhite}]}>or</Text>

                    <TouchableOpacity style={buttonStyle.mainButton} onPress={() => router.push('/(auth)/quiz')}>
                        <Text style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Sign Up</Text>
                    </TouchableOpacity>

                    {/* <Text onPress={() => router.push('/(auth)/welcome')}>Quiz</Text> */}

                </View>

                <View/>


            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 20,
    },
    heading: {
      fontSize: 60,
      fontWeight: 'bold',
    },
    option: {
      fontSize: 20,
      paddingVertical: 10
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      color: colors.readioWhite
    },
    gap: {
      marginVertical: 20,
    },
    stationContainer: {
      display: 'flex',
      flexDirection: 'row',
      gap: 10,
    },
    station: {
      borderRadius: 100,
      width: 80,
      height: 80,
      backgroundColor: '#ccc',
      marginVertical: 10,
    },
    nowPlaying: {
      borderRadius: 10,
      width: '95%',
      height: 300,
      backgroundColor: '#ccc',
      marginVertical: 10,
      alignSelf: 'center'
    }
  });
  