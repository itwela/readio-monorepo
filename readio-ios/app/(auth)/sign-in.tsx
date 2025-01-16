import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Alert, Text, ScrollView, View, TouchableOpacity } from "react-native";
import { StyleSheet, Button } from 'react-native';
import { router } from 'expo-router';
import InputField from "@/components/inputField";
import { icons } from "@/constants/icons";
import { useState, useCallback } from "react";
import { Link } from "expo-router";
import OAuth from "@/components/OAuth";
import { buttonStyle } from "@/constants/tokens";
import { useRouter } from 'expo-router'
import FastImage from "react-native-fast-image";
import { colors } from "@/constants/tokens";
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { KeyboardAvoidingView } from 'react-native';
import { useReadio } from '@/constants/readioContext';
import { FontAwesome } from '@expo/vector-icons';
import { tokenCache } from '@/lib/auth';
import bcrypt from 'react-native-bcrypt'; // Use bcrypt or any other hashing library
import sql from "@/helpers/neonClient";
import { useLotusAuth } from '@/constants/LotusAuthContext';

export default function SignIn() {

    const router = useRouter()

    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [pendingVerification, setPendingVerification] = useState(false)
    const [code, setCode] = useState('')
    const { wantsToGetStarted, setWantsToGetStarted } = useReadio()
    const { readioSelectedTopics, setReadioSelectedTopics, user, setUser } = useReadio()
    const {initialAuthEmail, setInitialAuthEmail, lotusToken, setLotusToken} = useLotusAuth()

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
    })

    const getUserWithJWT = async (hash: string) => {
      try {
        const result = await sql`
          SELECT * FROM users WHERE jwt = ${hash};
        `;
        console.log('result', result[0]?.email)
        return result[0];
      } catch (error) {
        console.log('Error retrieving password hash from Neon DB:', error);
        alert('User not found, please sign up');
        return null;
      }
    };

    const getUserWithForm = async (email: string) => {
      try {
        const result = await sql`
          SELECT * FROM users WHERE email = ${email} AND pass = ${form.password};
        `;
        console.log('result', result[0]?.jwt)
        return result[0]?.jwt;
      } catch (error) {
        console.log('Error retrieving password hash from Neon DB:', error);
        alert('User not found, please sign up');
        return null;
      }
    };


    const onSignInPress = async () => {

      const savedHash = await tokenCache.getToken('lotusJWTAlwaysGrowingToken');
      console.log('saved hash', savedHash)
      console.log('saved hash', savedHash?.length)

      if (savedHash) {
          setLotusToken?.(savedHash)
          const getCurrentUser = await getUserWithJWT(savedHash);
          // 
          if (getCurrentUser) {
            setUser?.(getCurrentUser)
            console.log("login successful, MATCH FOUND"); 
            router.push('/(tabs)/(home)/home')   
            // 
          } else {
            alert('There was as unknown error trying to log you in, please try again.')
          }

      } else {
        // will add modal message there probably as well, but this handles cases
        const userFromFormJWT = await getUserWithForm(form.email)
        console.log('fdfdff', getUserWithForm)
        
        // 
        if (userFromFormJWT) {
          console.log('found user')
          const savedHash = await tokenCache.saveToken('lotusJWTAlwaysGrowingToken', userFromFormJWT);
        } else {
          alert(`We couldn't find an account with those credentials, please try again.`)
        }
        // router.push('/(auth)/sign-up')
      }

    };

    return (
        <>
            <SafeAreaView style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              backgroundColor: colors.readioBrown,
            }}>
          
          <KeyboardAvoidingView behavior="padding" style={{width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: "transparent",}} keyboardVerticalOffset={10}>
          
            <ScrollView showsVerticalScrollIndicator={false} style={{ 
              width: '100%', 
              minHeight: '100%',
            }}
            contentContainerStyle={{
              alignItems: 'center',  
            }}
            >

            <View style={{width: "100%", alignItems: "flex-start", display: "flex", flexDirection: "column", gap: 10, padding: 10, }}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => { setReadioSelectedTopics?.([]); setWantsToGetStarted?.(false); router.push("/(auth)/welcome")   }} style={{width: 40, backgroundColor: "transparent", height: 30, display: "flex", alignItems: "flex-start", justifyContent: "center", position: "relative",}}>
                    <FontAwesome  color={colors.readioWhite} size={20} name="arrow-left"/>
            </TouchableOpacity>
              <View style={{width: "100%", display: "flex", flexDirection: "row"}}>
                <TouchableOpacity  style={{width: "20%", height: 10, backgroundColor: colors.readioWhite, borderRadius: 10}} activeOpacity={0.9}>
                </TouchableOpacity>
                <TouchableOpacity  style={{width: "80%", height: 10, backgroundColor: colors.readioOrange, borderRadius: 10}} activeOpacity={0.9}>
                </TouchableOpacity>
              </View>
              <View/>
              <Text  allowFontScaling={false} style={[styles.heading, {color: colors.readioWhite}]}>Log in</Text>
            </View>
                        
            <View style={{ 
              width: '90%', 
              paddingTop: 20,
            }}>

        
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
                label="Password"
                placeholder=""
                icon={icons.lock}
                value={form.password}
                secureTextEntry={true}
                onChangeText={(text) => setForm({ ...form, password: text })}
              />


            <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', gap: 15, marginVertical: 30}}>
              
              <TouchableOpacity onPress={onSignInPress} activeOpacity={0.9} style={styles.button}>
              
                <Text  allowFontScaling={false} style={[buttonStyle.mainButtonText, {color: colors.readioWhite}]}>Log In</Text>
              
              </TouchableOpacity>

              {/* <OAuth /> */}

              <View style={{ width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 10}}>

                <Text  allowFontScaling={false} style={[styles.option, {color: '#999999'}]}>Don't have an account?</Text>
              
                <TouchableOpacity  onPress={() => {readioSelectedTopics?.length === 3 ? router.push('/(auth)/sign-up') : router.push('/(auth)/quiz')}}>
                  <Text  allowFontScaling={false} style={{color: colors.readioOrange, fontFamily: readioBoldFont, fontSize: 20}}>Sign up</Text>
                </TouchableOpacity>
              
              </View>
            
            </View>

            </View>


            </ScrollView>
          </KeyboardAvoidingView>


        </SafeAreaView>
        {/* <View style={styles.container}>
            <Text style={styles.text}>Sign In</Text>
        </View> */}
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
      fontFamily: readioRegularFont
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: '80%',
    },
});