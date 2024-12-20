// import { Alert, SafeAreaView, Text, ScrollView, View, TouchableOpacity, Image } from "react-native";
import { StyleSheet, Button } from 'react-native';
// import InputField from "@/components/inputField";
// import { icons } from "@/constants/icons";
// import { useEffect, useState } from "react";
// import OAuth from "@/components/Oauth";
// import { buttonStyle } from "@/constants/tokens";
// import { useSignUp } from '@clerk/clerk-expo'
// import { useRouter } from 'expo-router'
// import { fetchAPI } from "@/lib/fetch";
// import ReactNativeModal from "react-native-modal";
// import { useReadio } from "@/constants/readioContext";
// import { retryWithBackoff } from "@/helpers/retrywithBackoff";
// import FastImage from "react-native-fast-image";
// import { FontAwesome } from "@expo/vector-icons";
import { colors } from "@/constants/tokens";
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';


export default function SignUp() {

    // const { isLoaded, signUp, setActive } = useSignUp()
    // const router = useRouter()

    // const [emailAddress, setEmailAddress] = useState('')
    // const [password, setPassword] = useState('')
    // const [pendingVerification, setPendingVerification] = useState(false)
    // const [code, setCode] = useState('')

    // const  {readioSelectedTopics, setReadioSelectedTopics} = useReadio()


    // const [showSuccessModal, setShowSuccessModal] = useState(false)

    // const [form, setForm] = useState({
    //     name: '',
    //     email: '',
    //     password: '',
    //     topics: readioSelectedTopics 
    // })

    // const [verification, setVerification] = useState({
    //   state: 'default',
    //   error: '',
    //   code: '',
    // })

    // const onSignUpPress = async () => {
    //   if (!isLoaded) return;
    //   try {
    //     await signUp.create({
    //       emailAddress: form.email,
    //       password: form.password,
    //     });
    //     await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    //     setVerification({
    //       ...verification,
    //       state: "pending",
    //     });
    //   } catch (err: any) {
    //     // See https://clerk.com/docs/custom-flows/error-handling
    //     // for more info on error handling
    //     console.log(JSON.stringify(err, null, 2));
    //     Alert.alert("Error", err.errors[0].longMessage);
    //   }
    // };
    // const onPressVerify = async () => {
    //   if (!isLoaded) return;

    //   try {
    //     const completeSignUp = await signUp.attemptEmailAddressVerification({
    //       code: verification.code,
    //     });
    //     if (completeSignUp.status === "complete") {
          
    //     retryWithBackoff(async () => {

    //         await fetchAPI("/(api)/user", {
    //           method: "POST",
    //           body: JSON.stringify({
    //             name: form.name,
    //             email: form.email,
    //             clerkId: completeSignUp.createdUserId,
    //             topics: form.topics
    //           }),
    //         });

    //     }, 3, 1000)

    //     retryWithBackoff(async () => {


    //       await fetchAPI(`/(api)/createStations`, {
    //         method: "POST",
    //         body: JSON.stringify({
    //           name: form.name,
    //           email: form.email,
    //           clerkId: completeSignUp.createdUserId,
    //           topics: form.topics
    //         }),
    //       });

    //     }, 3, 1000)


    //       await setActive({ session: completeSignUp.createdSessionId });
    //       setVerification({
    //         ...verification,
    //         state: "success",
    //       });

    //     } else {
    //       setVerification({
    //         ...verification,
    //         error: "Verification failed. Please try again.",
    //         state: "failed",
    //       });
    //     }
    //   } catch (err: any) {
    //     // See https://clerk.com/docs/custom-flows/error-handling
    //     // for more info on error handling
    //     setVerification({
    //       ...verification,
    //       error: err.errors[0].longMessage,
    //       state: "failed",
    //     });
    //   }
    // };

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
            <FontAwesome name="arrow-left" style={[styles.option, {padding: 10, color: 'transparent'}]} onPress={() => router.push('/(auth)/welcome')}/>
            <Text style={[styles.heading, {padding: 10, color: colors.readioWhite}]}>Sign-Up</Text>
            <FastImage style={{ width: "100%", height: 150, position: "absolute", zIndex: -1}} source={{uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsEcoEvLAR0x0eCQ6oLR-odV9yqGa4sYS5jA&s"}} resizeMode="cover"/>
            </View>
          
          <View style={{ 
            width: '90%', 
            minHeight: '100%', 
            paddingTop: 20,
          }}>

            
            <InputField 
              label="Name"
              placeholder="Enter your name"
              icon={icons.person}
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
      
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

            <InputField 
              label="Selected Topics"
              placeholder={readioSelectedTopics?.join(', ')}
              icon={icons.chat}
              value={readioSelectedTopics?.join(', ')}
              editable={false}
            />
    



          <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', gap: 10, marginVertical: 30}}>
            
            <TouchableOpacity activeOpacity={0.9} style={styles.button}>
              
                <TouchableOpacity onPress={onSignUpPress} activeOpacity={0.9} style={styles.button}>
                
                  <Text style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Sign Up</Text>
              
                </TouchableOpacity>

            </TouchableOpacity>

            <OAuth />

            <View style={{ width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 10}}>

              <Text style={[styles.option, {color: '#999999'}]}>Already have an account?</Text>
              <Button title="Log In" color={colors.readioOrange} onPress={() => router.push('/(auth)/sign-in')} />
    
            </View>
          
          </View>


          <ReactNativeModal 
            isVisible={verification.state === "pending"} 
            onModalHide={() => {
              if (verification.state === "success") setShowSuccessModal(true);
            }}
            >
            
            <View style={styles.modalView}>
              <Text style={[styles.option, {fontWeight: 'bold'}]}>Verification</Text>
              <Text style={{marginBottom: 20, color: '#999999', fontStyle: 'italic'}}>We've sent a code to {form.email}. Please enter it below.</Text>
              <InputField
                label = "Code"
                icon={icons.lock}
                placeholder="12345"
                value={verification.code}
                keyboardType="numeric"
                onChangeText={(code) => setVerification({ ...verification, code })}
              />
              {verification.error && (
                <Text style={{color: 'red'}}>{verification.error}</Text>
              )}

              <TouchableOpacity style={[buttonStyle.mainButton, {marginTop: 10}]} onPress={onPressVerify}>
                <Text style={buttonStyle.mainButtonText}>Verify Email</Text>
              </TouchableOpacity>
            </View>

          </ReactNativeModal>

          <ReactNativeModal isVisible={showSuccessModal}>
            
            <View style={styles.modalView}>
              <Image source={icons.check} style={styles.modalImage}/>
              <Text style={[styles.option, {textAlign: 'center', fontWeight: 'bold'}]}>Verified</Text>
              <Text style={{textAlign: 'center', marginBottom: 20, color: '#999999', fontStyle: 'italic'}}>You have successsfully verified your account.</Text>
              <TouchableOpacity style={buttonStyle.mainButton} 
              onPress={() => {
                setShowSuccessModal(false);
                router.push('/(tabs)/home');
              }}>
                <Text style={buttonStyle.mainButtonText}>Home</Text>
              </TouchableOpacity>
            </View>

          </ReactNativeModal>
            </View>

          </ScrollView>

        </SafeAreaView> */}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },    
    button: {
      width: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignContent: 'center', 
      alignItems: 'center', 
      backgroundColor: colors.readioOrange, 
      borderRadius: 80, 
      padding: 8
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
      fontFamily: readioRegularFont,
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: '80%',
    },
    modalView: {
      backgroundColor: 'white',
      paddingHorizontal: 28,
      paddingVertical: 20,
      borderRadius: 20,
      minHeight: 300,
    },
    modalImage: {
      width: 80,
      height: 80,
      alignSelf: 'center',
      marginVertical: 20,
      backgroundColor: '#32cd32',
      borderRadius: 80,
    },
});