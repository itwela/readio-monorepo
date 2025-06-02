import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Text, ScrollView, View, TouchableOpacity, Pressable } from "react-native";
import { StyleSheet, Button } from 'react-native';
import { router } from 'expo-router';
import InputField from "@/components/inputField";
import { icons } from "@/constants/icons";
import { useState, useCallback } from "react";
import { Link } from "expo-router";
import OAuth from "@/components/OAuth";
import { buttonStyle } from "@/constants/tokens";
import { useRouter } from 'expo-router'
import { colors } from "@/constants/tokens";
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { KeyboardAvoidingView } from 'react-native';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { FontAwesome } from '@expo/vector-icons';
import { tokenCache } from '@/lib/auth';
import { useLotusAuth } from '@/helpers/providers/LotusAuthContext';
import React from 'react';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';
import LotusHeader from '@/components/LotusHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { getLocalImageUri } from '@/constants/imageAssets';
import Animated, { useSharedValue, FadeIn, FadeInDown, FadeOut, FadeOutDown, useAnimatedReaction, useAnimatedStyle, withTiming, FadeOutUp } from "react-native-reanimated";
import LotusImageWithLoader from '@/components/LotusImageWithLoader';
import LotusGap from '@/components/LotusGap';
import { useLotusEnv } from '@/helpers/providers/LotusEnvHandler';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SignIn() {

  const router = useRouter()

  const { masterDebugMode, setMasterDebugMode } = useLotusUtils()
  const { getEnv } = useLotusEnv();

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const { wantsToGetStarted, setWantsToGetStarted } = useLotusUtils()
  const { readioSelectedTopics, setReadioSelectedTopics } = useLotusUtils()
  const { user } = useLotusUser()
  const { initialAuthEmail, setInitialAuthEmail, lotusToken, setLotusToken, logout, authenticateUser, fetchUser } = useLotusAuth()
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(false)
  const { mediumFeedback, lightFeedback, successFeedback } = useLotusHaptic();

  const [loginerror, setLoginError] = useState('')

  // Get environment variables from the LotusEnvHandler instead of Constants
  const debugModeAdminTriggerEmail = getEnv('EXPO_PUBLIC_debugModeAdminTriggerEmail');
  const debugTriggerAdminModePass = getEnv('EXPO_PUBLIC_debugTriggerAdminModePass');
  const debugModeNormieTriggerEmail = getEnv('EXPO_PUBLIC_debugModeNormieTriggerEmail');
  const debugModeNormieTriggerPass = getEnv('EXPO_PUBLIC_debugModeNormieTriggerPass');

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  // NOTE 🟪 - Convex Mutations
  const signInUserMutation = useMutation(api.users.signInUser);

  const onSignInPress = async () => {

    // console.log('\n\n Form Email:', form?.email, '\n...')

    // Check for debug mode triggers
    if (form?.email === debugModeAdminTriggerEmail && form?.password === debugTriggerAdminModePass) {
      setMasterDebugMode?.(true)
    } 
    
    if (form?.email === debugModeNormieTriggerEmail && form?.password === debugModeNormieTriggerPass) {
      setMasterDebugMode?.(true)
    } 
    
    if (form?.email !== debugModeAdminTriggerEmail && form?.password !== debugTriggerAdminModePass && form?.email !== debugModeNormieTriggerEmail && form?.password !== debugModeNormieTriggerPass) {
      setMasterDebugMode?.(false)
    }

    try {

      const authResult = await signInUserMutation({
        email: form.email.trim().toLowerCase(),
        password: form.password
      });


      if (authResult.success && authResult.jwt) {
        setLoginError('found user')
        
        // 🧹 CLEAN UP OLD USER DATA FIRST - This is where we handle "logout" of previous user
        console.log('🧹 CLEANING UP: Clearing previous user data before new login');
        await logout?.(); // This clears all the old data
        
        // Save the JWT token to SecureStore
        await tokenCache.saveToken(
          masterDebugMode ? 'DebuglotusJWTAlwaysGrowingToken' : 'lotusJWTAlwaysGrowingToken', 
          authResult.jwt
        );
        
        // Use pure manual authentication (no useQuery interference!)
        const authSuccess = await authenticateUser?.(authResult.jwt);
        
        if (authSuccess?.success) {
          setLoginError('login successful, MATCH FOUND')
          router.push('/(tabs)/(home)/home')
        } else {
          alert('Authentication failed after login. Please try again.')
        }
      } else {
        alert(`We couldn't find an account with those credentials, please try again.`)
      }
    } catch (error) {
      console.error('[\n (💥) SIGNIN ERROR]', error);
      alert(`We couldn't find an account with those credentials, please try again.`)
    }

  };

  // NOTE 🟪 - PREVIOUS FUNCTION
  const handleGoBack = () => {
    lightFeedback();
    router.push('/(auth)/welcome')
  };

  const isStepValid = () => {
    return form.email.includes('@') && form.email.includes('.') && form.password.length >= 6;
  };
  const canProceed = isStepValid();

  return (
    <>
      {/* NOTE 🟦 - HEADER */}
      <LotusHeader onSignUpPage backgroundColor={colors.readioBrown} />

      {/* NOTE 🟦 - TOP GRADIENT - VIDEO BACKGROUND */}
      <LinearGradient
        colors={[colors.readioBrown, 'transparent']}
        style={{ zIndex: -1, position: 'absolute', width: '100%', height: '80%', opacity: 0.618 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* NOTE 🟦 - VIDEO BACKGROUND */}
      <Animated.View style={{ zIndex: -2, opacity: 1, position: 'absolute', width: '100%', height: '80%' }} entering={FadeIn.duration(600)} exiting={FadeOut.duration(600)}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            opacity: 0.5, // Adjust opacity for desired darkness (0.0 to 1.0)
            zIndex: 1, // Ensure it's above the video but below other content if needed
          }}
        />

        {/* NOTE - SIGN UP GIF ASSET */}
        <LotusImageWithLoader
          source={{
            uri: getLocalImageUri("manDrinkWater"),
          }}
          style={{ zIndex: -3, position: 'absolute', width: '100%', height: '100%', backgroundColor: colors.readioBrown }}
          resizeMode="cover"
        />
      </Animated.View>

      {/* NOTE 🟦 - BOTTOM GRADIENT - VIDEO BACKGROUND */}
      <LinearGradient
        colors={['#272121', 'transparent', 'transparent']}
        style={{
          zIndex: -1,
          bottom: '20%',
          position: 'absolute',
          width: '150%',
          height: 1000,
          transform: [{ rotate: '-180deg' }]
        }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />

      <View style={[{ zIndex: -3, opacity: 1, position: 'absolute', width: '100%', height: '100%', backgroundColor: colors.readioBrown }]} />

      {/* NOTE 🟦 - SIGNUP FORM CONTAINER */}
      <KeyboardAvoidingView behavior="padding" style={{ width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center', }} keyboardVerticalOffset={10}>

        {/* STUB SIGNUP BANNER */}
        <View style={{ width: "100%", alignItems: "flex-start", display: "flex", flexDirection: "column", gap: 10, padding: 20, }}>

          {/* NOTE SIGNUP TEXT */}
          <Text allowFontScaling={false} style={[styles.heading, { color: colors.readioWhite }]}>Log In</Text>
          <LotusGap gapNumber={5} backgroundColor={colors.readioWhite} />

          {/* NOTE THE SKINNY DIVIDER THING */}
          <View style={{ borderBottomColor: `${colors.readioWhite}30`, borderBottomWidth: 5, width: '100%', }}>
            <View style={{ width: `100%`, borderBottomColor: colors.readioOrange, borderBottomWidth: 5, backgroundColor: colors.readioOrange, position: 'absolute' }}></View>
          </View>

        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ justifyContent: 'flex-start', alignItems: 'center' }} style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%', }}>

          {/* STUB FIELDS COMPONENT */}
          <View style={{ width: '90%', minHeight: '100%', paddingTop: 10, }}>
            
            <View style={styles.stepContainer}>
              {/* NOTE 🟦 - EMAIL SIGNUP FIELD */}
              <View style={styles.fieldContainer}>
                <InputField
                  allowFontScaling={false}
                  autoComplete='email'
                  autoFocus
                  label="Email"
                  placeholder=""
                  icon={icons.email}
                  value={form.email}
                  style={styles.inputFieldStyle}
                  onChangeText={(text) => setForm({ ...form, email: text.toLowerCase().trim() })} // Normalize email input
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>

              {/* NOTE 🟦 - PASSWORD SIGNUP FIELD */}
              <View style={styles.fieldContainer}>
                <InputField
                  allowFontScaling={false}
                  label="Password"
                  placeholder=""
                  autoFocus
                  icon={icons.lock}
                  value={form.password}
                  secureTextEntry={true}
                  style={styles.inputFieldStyle}
                  onChangeText={(text) => setForm({ ...form, password: text })}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={{ gap: 10 }}>
              {/* NOTE 🟦 - BACK BUTTON */}
              <Pressable
                onPress={handleGoBack}
                style={styles.backButton}
              >
                <Text allowFontScaling={false} style={[buttonStyle.mainButtonText, { color: `${colors.readioWhite}90` }]}>
                  Back
                </Text>
              </Pressable>

              {/* NOTE 🟦 - LOGIN BUTTON */}
              <Pressable
                onPress={onSignInPress}
                // Disable button if the current step isn't valid
                disabled={!canProceed}
                style={[
                  styles.button,
                  !canProceed && styles.buttonDisabled // Apply disabled style
                ]}
              >
                <Text allowFontScaling={false} style={[buttonStyle.mainButtonText, { color: canProceed ? colors.readioWhite : `${colors.readioWhite}90` }]}>
                  Continue
                </Text>
              </Pressable>
            </View>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>
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
  inputFieldStyle: {
    width: '100%',
    height: 55, // Slightly taller input
    color: colors.readioWhite,
    fontFamily: readioRegularFont,
    // Add other input styling (background, border, text color) if needed
  },
  stepContainer: {
    width: '100%',
    gap: 5,
    marginBottom: 30, // Space below the step content before the button
  },
  fieldContainer: {
    width: '100%', // Field takes full width of its container
    paddingHorizontal: 0, // Reset padding if needed, or adjust as necessary
    marginTop: 10, // Space above the input field
  },
  passwordMatchText: {
    color: 'lightgreen', // Use a lighter green
    fontFamily: readioRegularFont,
    opacity: 0.9,
    fontSize: 14,
    marginTop: 15,
    textAlign: 'center',
  },
  hdyhauSelect: {
    backgroundColor: `${colors.readioBlack}60`, // Use a disabled color
    width: '100%',
    height: 80,
    borderRadius: 5,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  buttonDisabled: {
    backgroundColor: `${colors.readioBlack}60`, // Use a disabled color
  },
  passwordMismatchText: {
    color: '#FFCCCB', // Light red for mismatch
    fontFamily: readioRegularFont,
    opacity: 0.9,
    fontSize: 14,
    marginTop: 15,
    textAlign: 'center',
  },
  loginLinkContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8, // Smaller gap
    marginTop: 20, // Space above the login link
    marginBottom: 10, // Space below the login link
  },
  loginLinkText: {
    color: colors.readioOrange,
    fontFamily: readioBoldFont,
    fontSize: 16, // Match the other text size
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
    borderRadius: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: `${colors.readioBlack}`, // Use a disabled color
    borderRadius: 20,
    // borderWidth: 1,
    paddingVertical: 12,
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: readioBoldFont,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: `${colors.readioWhite}`,
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
    ,
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