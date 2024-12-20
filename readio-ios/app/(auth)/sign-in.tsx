// import { Alert, SafeAreaView, Text, ScrollView, View, TouchableOpacity } from "react-native";
import { StyleSheet, Button, View, Text } from 'react-native';
// import InputField from "@/components/inputField";
// import { icons } from "@/constants/icons";
// import { useState, useCallback } from "react";
// import OAuth from "@/components/Oauth";
// import { buttonStyle } from "@/constants/tokens";
// import { useSignIn } from '@clerk/clerk-expo'
// import { useRouter } from 'expo-router'
// import FastImage from "react-native-fast-image";
import { colors } from "@/constants/tokens";
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';


export default function SignIn() {

    // const { signIn, setActive, isLoaded } = useSignIn();
    // const router = useRouter()

    // const [emailAddress, setEmailAddress] = useState('')
    // const [password, setPassword] = useState('')
    // const [pendingVerification, setPendingVerification] = useState(false)
    // const [code, setCode] = useState('')


    // const [form, setForm] = useState({
    //     name: '',
    //     email: '',
    //     password: '',
    // })

    // const onSignInPress = useCallback(async () => {
    //   if (!isLoaded) return;
  
    //   try {
    //     const signInAttempt = await signIn.create({
    //       identifier: form.email,
    //       password: form.password,
    //     });
  
    //     if (signInAttempt.status === "complete") {
    //       await setActive({ session: signInAttempt.createdSessionId });
    //       router.replace("/(tabs)/home");
    //     } else {
    //       // See https://clerk.com/docs/custom-flows/error-handling for more info on error handling
    //       console.log(JSON.stringify(signInAttempt, null, 2));
    //       Alert.alert("Error", "Log in failed. Please try again.");
    //     }
    //   } catch (err: any) {
    //     console.log(JSON.stringify(err, null, 2));
    //     Alert.alert("Error", err.errors[0].longMessage);
    //   }
    // }, [isLoaded, form.email, form.password]);

    return (
        <>
            {/* <SafeAreaView style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: colors.readioBrown,
          position: 'relative',
    }}>
          <ScrollView showsVerticalScrollIndicator={false} style={{ 
            width: '100%', 
            minHeight: '100%',
            display: 'flex',
          }}
          contentContainerStyle={{
            alignItems: 'center',  
          }}
          >
            <View style={{ width: '100%', height: 150, display: 'flex', position: 'relative', flexDirection: 'column'}}>
                <Text style={[styles.option, {padding: 10, color: 'transparent'}]} onPress={() => router.push('/(auth)/welcome')}>Home</Text>
               <Text style={[styles.heading, {padding: 10, color: colors.readioWhite}]}>Welcome 👋</Text>
              <FastImage style={{ width: "100%", height: 150, position: "absolute", zIndex: -1}} source={{uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsEcoEvLAR0x0eCQ6oLR-odV9yqGa4sYS5jA&s"}} resizeMode="cover"/>
            </View>
            
                      
          <View style={{ 
            width: '90%', 
            minHeight: '100%', 
            paddingTop: 20,
          }}>

      
            <InputField 
              label="Email"
              placeholder="Enter your email"
              icon={icons.email}
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
            />
        
            <InputField 
              label="Pasword"
              placeholder="Enter your password"
              icon={icons.lock}
              value={form.password}
              secureTextEntry={true}
              onChangeText={(text) => setForm({ ...form, password: text })}
            />


          <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', gap: 10, marginVertical: 30}}>
            
            <TouchableOpacity onPress={onSignInPress} activeOpacity={0.9} style={styles.button}>
            
              <Text style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Log In</Text>
            
            </TouchableOpacity>

            <OAuth />

            <View style={{ width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 10}}>

              <Text style={[styles.option, {color: '#999999'}]}>Don't have an account?</Text>
              <Button title="Sign Up" color={colors.readioOrange} onPress={() => router.push('/(auth)/sign-up')} />
    
            </View>
          
          </View>

          </View>


            </ScrollView>

        </SafeAreaView> */}
        <View style={styles.container}>
            <Text style={styles.text}>Sign In</Text>
        </View>
        </>
    );
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
    button: {
      width: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignContent: 'center', 
      alignItems: 'center', 
      backgroundColor: colors.readioOrange, 
      borderRadius: 80, 
      padding: 16
    },
    heading: {
      fontSize: 60,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    option: {
      fontSize: 20,
      paddingVertical: 10,
      fontFamily: readioRegularFont
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: '80%',
    },
});