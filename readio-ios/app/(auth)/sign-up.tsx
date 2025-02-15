import { Alert, Text, KeyboardAvoidingView, ScrollView, View, TouchableOpacity, Image } from "react-native";
import { StyleSheet, Button } from 'react-native';
import InputField from "@/components/inputField";
import { icons } from "@/constants/icons";
import { useEffect, useState } from "react";
import OAuth from "@/components/OAuth";
import { buttonStyle, utilStyle } from "@/constants/tokens";
import { useSignUp } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { fetchAPI } from "@/lib/fetch";
import ReactNativeModal from "react-native-modal";
import { useReadio } from "@/constants/readioContext";
import { retryWithBackoff } from "@/helpers/retryWithBackoff";
import FastImage from "react-native-fast-image";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "@/constants/tokens";
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import sql from "@/helpers/neonClient";
import { TextInput } from "react-native-gesture-handler";

export default function SignUp() {

    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [pendingVerification, setPendingVerification] = useState(false)
    const [code, setCode] = useState('')

    const  {readioSelectedTopics, setReadioSelectedTopics} = useReadio()
    const {wantsToGetStarted, setWantsToGetStarted} = useReadio()


    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        topics: readioSelectedTopics 
    })

    const [verification, setVerification] = useState({
      state: 'default',
      error: '',
      code: '',
    })

    const onSignUpPress = async () => {
      if (!isLoaded) return;
      try {
        await signUp.create({
          emailAddress: form.email,
          password: form.password,
        });
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setVerification({
          ...verification,
          state: "pending",
        });
      } catch (err: any) {
        // See https://clerk.com/docs/custom-flows/error-handling
        // for more info on error handling
        console.log(JSON.stringify(err, null, 2));
        Alert.alert("Error", err.errors[0].longMessage);
      }
    };
    const onPressVerify = async () => {
      if (!isLoaded) return;

      try {

        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: verification.code,
        });

        if (completeSignUp.status === "complete") {
          
          const createdUserResponse = await sql`
          INSERT INTO users (
              name,
              email,
              clerk_id,
              topics
          )
          VALUES (
              ${form.name},
              ${form.email},
              ${completeSignUp.createdUserId},
              ${form.topics}
          )
          `;

          const stationIds = await Promise.all(
            readioSelectedTopics?.map(async (topicName: string) => {
                const result = await sql`
                    SELECT id FROM stations WHERE name = ${topicName};
                `;
                
                // If the station is found, return its ID; otherwise, return null
                return result.length > 0 ? result[0].id : null;
            }) || []
          );

          // Filter out any topics that didn't match a station name
          const validStationIds = stationIds?.filter((id) => id !== null);

          // Associate user (clerkId) with valid station IDs
          const stationCreationResponse = await Promise.all(
              validStationIds.map(async (stationId: string) => {
                  return await sql`
                      INSERT INTO station_clerks (
                          station_id,
                          clerk_id
                      )
                      VALUES (
                          ${stationId},
                          ${completeSignUp.createdUserId}
                      )
                      ON CONFLICT DO NOTHING
                      RETURNING *;
                  `;
              })
          );

          await setActive({ session: completeSignUp.createdSessionId });

          setVerification({
            ...verification,
            state: "success",
          });

          console.log("verified", verification.state)

        } else {
          setVerification({
            ...verification,
            error: "Verification failed. Please try again.",
            state: "failed",
          });
        }
      } catch (err: any) {
        // See https://clerk.com/docs/custom-flows/error-handling
        // for more info on error handling
        setVerification({
          ...verification,
          error: err.errors[0].longMessage,
          state: "failed",
        });
      }
    };



    return (
        <>
          <SafeAreaView style={[utilStyle.safeAreaContainer, {backgroundColor: colors.readioBrown}]}>  
          <KeyboardAvoidingView behavior="padding" style={{width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: "transparent",}} keyboardVerticalOffset={10}>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{justifyContent: 'flex-start', alignItems: 'center'}} style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
            {/* <View style={{ width: '100%', height: 150, display: 'flex', position: 'relative', flexDirection: 'column'}}>
            <FontAwesome name="arrow-left" style={[styles.option, {padding: 10, color: 'transparent'}]} onPress={() => router.push('/(auth)/welcome')}/>
            <FastImage style={{ width: "100%", height: 150, position: "absolute", zIndex: -1}} source={{uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsEcoEvLAR0x0eCQ6oLR-odV9yqGa4sYS5jA&s"}} resizeMode="cover"/>
            </View> */}
            <View style={{width: "100%", alignItems: "flex-start", display: "flex", flexDirection: "column", gap: 10, padding: 10, }}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => { setReadioSelectedTopics?.([]); setWantsToGetStarted?.(false); router.push("/(auth)/welcome")   }} style={{width: 40, backgroundColor: "transparent", height: 30, display: "flex", alignItems: "flex-start", justifyContent: "center", position: "relative",}}>
                    <FontAwesome  color={colors.readioWhite} size={20} name="arrow-left"/>
            </TouchableOpacity>
            <View style={{width: "100%", display: "flex", flexDirection: "row"}}>
                <TouchableOpacity onPress={ ()  => { setReadioSelectedTopics?.([]); router.push("/(auth)/quiz") }}  style={{width: "20%", height: 10, backgroundColor: colors.readioWhite, borderRadius: 10}} activeOpacity={0.9}>
                </TouchableOpacity>
                <TouchableOpacity  style={{width: "80%", height: 10, backgroundColor: colors.readioOrange, borderRadius: 10}} activeOpacity={0.9}>
                </TouchableOpacity>
            </View>
            <Text allowFontScaling={false} style={styles.subtext}>Step 2 / 2</Text>
            <Text  allowFontScaling={false} style={[styles.heading, {color: colors.readioWhite}]}>Sign-Up</Text>
            </View>
          
            <View style={{ 
            width: '90%', 
            minHeight: '100%', 
            paddingTop: 20,
          }}>

            
            <InputField 
             allowFontScaling={false}
              label="Name"
              placeholder=""
              icon={icons.person}
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
      
            <InputField 
             allowFontScaling={false}
              label="Email"
              placeholder=""
              icon={icons.email}
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
            />
        
            <InputField 
             allowFontScaling={false}
              label="Pasword"
              placeholder=""
              icon={icons.lock}
              value={form.password}
              secureTextEntry={true}
              onChangeText={(text) => setForm({ ...form, password: text })}
            />

            {/* <InputField 
              label="Selected Topics"
              placeholder={readioSelectedTopics?.join(', ')}
              icon={icons.chat}
              value={readioSelectedTopics?.join(', ')}
              editable={false}
            /> */}
    



          <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', gap: 15, marginVertical: 15}}>
            
              
                <TouchableOpacity onPress={onSignUpPress} activeOpacity={0.9} style={styles.button}>
                
                  <Text  allowFontScaling={false} style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Sign Up</Text>
              
                </TouchableOpacity>


            <OAuth />

            <View style={{ width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 10}}>

              <Text style={[styles.option, {color: '#999999'}]}>Already have an account?</Text>
              <TouchableOpacity  onPress={() => router.push('/(auth)/sign-in')}>
                <Text  allowFontScaling={false} style={{color: colors.readioOrange, fontFamily: readioBoldFont, fontSize: 20}}>Log in</Text>
              </TouchableOpacity>
    
            </View>

                      
          </View>


          <ReactNativeModal 
            isVisible={verification.state === "pending"} 
            onModalHide={async () => {
              console.log("Verification modal hidden", verification.state);
          
              if (verification.state === "success") {
                // Simulate an async operation (e.g., fetching data or waiting for something)
                await new Promise((resolve) => setTimeout(resolve, 100)); // Example delay
                setShowSuccessModal(true);
                console.log("if statement ran", verification.state);
                console.log(showSuccessModal);
              }
            }}
            >
            
            <View style={styles.modalView}>

              <View style={{width: "100%", display: "flex", flexDirection: "column"}}>
                <Text  allowFontScaling={false} style={[styles.option, {fontWeight: 'bold'}]}>Verification</Text>
                <Text  allowFontScaling={false} style={{marginBottom: 0, color: colors.readioBrown, fontStyle: 'italic'}}>We've sent a code to {form.email}. Please enter it below.</Text>
              </View>
              
              <View style={{width: "100%", height: 80}}>
                <TextInput
                 allowFontScaling={false}
                  placeholder="12345"
                  value={verification.code}
                  keyboardType="numeric"
                  onChangeText={(code) => setVerification({ ...verification, code })}
                  placeholderTextColor={colors.readioBrown}
                  style={styles.input}
                  numberOfLines={1}
                />
              </View>

              <View style={{width: "100%", display: "flex", flexDirection: "column"}}>
                
                {verification.error && (
                  <Text  allowFontScaling={false} style={{color: 'red'}}>{verification.error}</Text>
                )}

                <TouchableOpacity style={[buttonStyle.mainButton, {marginTop: 10}]} onPress={onPressVerify}>
                  <Text  allowFontScaling={false} style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Verify Email</Text>
                </TouchableOpacity>

              </View>
            </View>

          </ReactNativeModal>

          <ReactNativeModal isVisible={showSuccessModal === true}>
            
            <View style={styles.modalView}>
              <Image source={icons.check} style={styles.modalImage}/>
              <Text  allowFontScaling={false} style={[styles.option, {textAlign: 'center', fontWeight: 'bold'}]}>Verified</Text>
              <Text  allowFontScaling={false} style={{textAlign: 'center', marginBottom: 20, color: colors.readioBrown, fontStyle: 'italic'}}>You have successsfully verified your account.</Text>
              <TouchableOpacity style={buttonStyle.mainButton} 
              onPress={() => {
                setShowSuccessModal(false);
                router.push('/(tabs)/(home)/home');
              }}>
                <Text  allowFontScaling={false} style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Home</Text>
              </TouchableOpacity>
            </View>

          </ReactNativeModal>

            </View>

            </ScrollView>

            </KeyboardAvoidingView>
        </SafeAreaView>
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
    input: {
      borderRadius: 50,
      padding: 16,
      fontFamily: readioRegularFont,
      fontSize: 30,
      flex: 1,
      textAlign: 'left',
      color: colors.readioBrown,
      borderWidth: 1,
      borderColor: colors.readioBrown,
      height: 80,
    },
    subtext: {
      fontSize: 20,
      opacity: 0.8,
      fontFamily: readioRegularFont,
      color: colors.readioOrange,
      fontWeight: 'bold',
      marginVertical: 5
  },
    button: {
      width: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignContent: 'center', 
      alignItems: 'center', 
      backgroundColor: colors.readioOrange, 
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    heading: {
      fontSize: 45,
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
      color: colors.readioBlack
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: '80%',
    },
    modalView: {
      backgroundColor: colors.readioWhite,
      paddingHorizontal: 28,
      paddingVertical: 20,
      borderRadius: 20,
      minHeight: 300,
      display: 'flex',
      justifyContent: "space-between"
,    },
    modalImage: {
      width: 80,
      height: 80,
      alignSelf: 'center',
      marginVertical: 20,
      backgroundColor: '#32cd32',
      borderRadius: 80,
    },
});