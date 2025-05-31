import InputField from "@/components/inputField";
import LotusGap from "@/components/LotusGap";
import LotusHeader from "@/components/LotusHeader";
import LotusImageWithLoader from "@/components/LotusImageWithLoader";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { icons } from "@/constants/icons";
import { getLocalImageUri } from "@/constants/imageAssets";
import { buttonStyle, colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { api } from "@/convex/_generated/api";
import { useLotusAuth } from "@/helpers/providers/LotusAuthContext";
import { useLotusHaptic } from "@/helpers/providers/lotusHapticProvider";
import { useLotusUtils } from "@/helpers/providers/lotusUtilsContext";
import { tokenCache } from "@/lib/auth";
import { useMutation } from "convex/react";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import bcrypt from 'react-native-bcrypt'; // Keep for password hashing
import { Pressable } from "react-native-gesture-handler";
import ReactNativeModal from "react-native-modal";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

// NOTE 🟩 = VARIABLE
// NOTE 🟦 = COMPONENT
// NOTE 🟨 = USEEFFECT
// NOTE 🟪 = FUNCTION
// STUB


export default function SignUp() {

  const router = useRouter()
  const { readioSelectedTopics, setReadioSelectedTopics, setWantsToGetStarted } = useLotusUtils()
  const { initialAuthEmail, setInitialAuthEmail, authenticateUser } = useLotusAuth()
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [processingSignIn, setProcessingSignIn] = useState(false)
  const [currentStep, setCurrentStep] = useState(0); // <-- Add state for current step
  const { mediumFeedback, lightFeedback, successFeedback } = useLotusHaptic();
  const signUpStepsLen = 5
  const { masterDebugMode, underwaterFxSoundRef } = useLotusUtils()

  // const signUpVideoPlayer = useVideoPlayer(ImageAssets.aliVideo, player => {
  //   player.muted = true;
  //   player.loop = true;
  //   player.play();
  //   player.staysActiveInBackground = false;
  // });

  // NOTE 🟩 - FORM STATE
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    howDidYouHearAboutUs: '',
  })
  const [verification, setVerification] = useState({
    state: 'default',
    error: '',
    code: '',
  })
  const getUserInfo = async (hash: string) => {
    // This function is no longer needed - we'll use the nuclear auth pattern
    return true;
  };

  // NOTE 🟪 - Convex Mutations
  const createUserMutation = useMutation(api.users.createUser);

  // NOTE 🟪 - Sign Up Function
  const onPressSignUp = async () => {

    setProcessingSignIn(true);
    

    // NOTE 🟪 ---|> Generate Random Id Function
    const generateRandomId = () => {

      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 16; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    };

    const userId = generateRandomId();

    // NOTE  🟩 ---|> VARIABLES for signup
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(form.password, saltRounds)
    const normalRole = 'user';
    const defaultUpvotes = 0
    const defaultSteps = 0

    try {

      // NOTE 🟩 ---|> Convex User Creation
      const authResult = await createUserMutation({
        name: form.name,
        email: form.email.trim().toLowerCase(),
        user_db_id: userId,
        user_role: normalRole,
        jwt: hashedPassword,
        pass: form.password,
        upvotes: defaultUpvotes,
        usersteps: defaultSteps,
        howDidYouHearAboutUs: form.howDidYouHearAboutUs
      });
      

      // NOTE 🟪 ---|> Save the hashed password in SecureStore for later use
      await tokenCache.saveToken(masterDebugMode ? 'DebuglotusJWTAlwaysGrowingToken' : 'lotusJWTAlwaysGrowingToken', hashedPassword);

      // 🚀 NUCLEAR AUTHENTICATION - This is the key step!
      const authSuccess = await authenticateUser?.(hashedPassword);
      
      if (authSuccess?.success) {
        
        // Stop and unload sound if it's playing
        if (underwaterFxSoundRef.current) {
          try {
            const status = await underwaterFxSoundRef.current.getStatusAsync();
            if (status.isLoaded && status.isPlaying) {
              await underwaterFxSoundRef.current.stopAsync();
            }
            if (status.isLoaded) {
              await underwaterFxSoundRef.current.unloadAsync();
            }
            underwaterFxSoundRef.current = null; // Clear the ref
          } catch (error) {
            console.error("❌ [NUCLEAR SIGNUP] Error stopping underwater fx:", error);
          }
        }
        
        setInitialAuthEmail?.(form.email);
        setProcessingSignIn(false);
        
        // Success! User is now authenticated and data will be fetched automatically
        
      } else {
        console.error("❌ [NUCLEAR SIGNUP] Authentication failed after user creation");
        alert('Account created but authentication failed. Please try logging in.');
        setProcessingSignIn(false);
      }

    } catch (error) {
      console.error("❌ [NUCLEAR SIGNUP] Error during signup:", error);
      alert('Signup failed. Please try again.');
      setProcessingSignIn(false);
    }
  };


  // NOTE 🟪 - PREVIOUS FUNCTION
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      lightFeedback();
    } else {
      router.push('/(auth)/welcome')
      lightFeedback();
    }
  };

  // NOTE 🟪 - NEXT FUNCTION
  const handleNextStep = () => {
    // Add validation logic here if needed before proceeding
    // e.g., check if form.name is filled in step 0
    if (currentStep < 4) { // 4 is the index of the last step (step 5)
      setCurrentStep(currentStep + 1);
      mediumFeedback();
    } else {
      successFeedback();
      onPressSignUp();
    }
  };

  // NOTE 🟪 - PROGRESS BAR WIDTH FUNCTION
  const getProgressBarWidth = (theCurrentStep: number, totalSteps: number) => {
    const stepWidth = totalSteps;
    const offset = stepWidth * theCurrentStep * 4;
    return offset
  }

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
        {/* NOTE - ARCHIVED SIGN UP VIDEO ASSET */}
        {/* <VideoView
          player={signUpVideoPlayer}
          contentFit={'cover'}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            // zIndex: 10,
            backgroundColor: 'transparent'
          }}
        /> */}
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
          <Text allowFontScaling={false} style={[styles.heading, { color: colors.readioWhite }]}>Sign Up</Text>
          <LotusGap gapNumber={5} backgroundColor={colors.readioWhite} />

          {/* NOTE THE SKINNY DIVIDER THING */}
          <View style={{ borderBottomColor: `${colors.readioWhite}30`, borderBottomWidth: 5, width: '100%', }}>
            <View style={{ width: `${getProgressBarWidth(currentStep, signUpStepsLen)}%`, borderBottomColor: colors.readioOrange, borderBottomWidth: 5, backgroundColor: colors.readioOrange, position: 'absolute' }}></View>
          </View>

        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ justifyContent: 'flex-start', alignItems: 'center' }} style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%', }}>

          {/* STUB FIELDS COMPONENT */}
          <View style={{ width: '90%', minHeight: '100%', paddingTop: 10, }}>
            <SignUpInputFields
              form={form}
              setForm={setForm}
              doPasswordsMatch={doPasswordsMatch}
              setDoPasswordsMatch={setDoPasswordsMatch}
              // onPressSignUp={onPressSignUp} // Pass handleNextStep instead
              handleNextStep={handleNextStep} // Pass the next step handler
              handlePreviousStep={handlePreviousStep} // Pass the previous step handler
              // delOrCre={delOrCre} // Pass only if needed by SignUpInputFields
              // setDelOrCre={setDelOrCre} // Pass only if needed by SignUpInputFields
              router={router}
              currentStep={currentStep} // Pass current step index
            />

            {/* NOTE 🟦 - VERIFICATION MODAL */}
            <ReactNativeModal
              isVisible={processingSignIn}
              onModalHide={async () => {
                // console.log("Verification modal hidden", verification.state);

                if (processingSignIn === false) {
                  // Simulate an async operation (e.g., fetching data or waiting for something)
                  await new Promise((resolve) => setTimeout(resolve, 100)); // Example delay
                  setShowSuccessModal(true);
                  // console.log(showSuccessModal);
                }
                
              }}
            >

              <View style={styles.modalView}>

                <View style={{ width: "100%", display: "flex", flexDirection: "column" }}>
                  <Text allowFontScaling={false} style={[styles.option, { fontWeight: 'bold' }]}>Signing you up!</Text>
                  <Text allowFontScaling={false} style={{ marginBottom: 0, color: colors.readioBrown, fontStyle: 'italic' }}>We're getting your Lotus account set up! Please be patient.</Text>
                </View>
              </View>

            </ReactNativeModal>

            {/* NOTE 🟦 - SUCCESS MODAL */}
            <ReactNativeModal isVisible={showSuccessModal === true}>

              <View style={styles.modalView}>
                <Image source={icons.check} style={styles.modalImage} />
                <Text allowFontScaling={false} style={[styles.option, { textAlign: 'center', fontWeight: 'bold', fontSize: 35, fontFamily: readioBoldFont, paddingVertical: 0, paddingTop: 10 }]}>Success!</Text>
                <Text allowFontScaling={false} style={{ textAlign: 'center', marginBottom: 20, color: colors.readioBrown, fontSize: 18, opacity: 0.6, fontStyle: 'italic', fontFamily: readioRegularFont }}>You're signed up!</Text>
                <Text allowFontScaling={false} style={{ textAlign: 'center', marginBottom: 20, color: colors.readioBrown, fontSize: 25, fontStyle: 'italic', fontFamily: readioRegularFont }}>Welcome to Lotus.</Text>
                <TouchableOpacity style={buttonStyle.mainButton}
                  onPress={() => {
                    setShowSuccessModal(false);
                    router.push('/(tabs)/(home)/home');
                  }}>
                  <Text allowFontScaling={false} style={[buttonStyle.mainButtonText, { color: colors.readioWhite }]}>Home</Text>
                </TouchableOpacity>
              </View>

            </ReactNativeModal>
          </View>

        </ScrollView>

      </KeyboardAvoidingView>
    </>
  );
}

// --- Updated SignUpInputFields ---
const SignUpInputFields = ({
  form,
  setForm,
  doPasswordsMatch,
  setDoPasswordsMatch,
  handleNextStep,
  handlePreviousStep,
  router,
  currentStep
}: {
  form: any,
  setForm: any,
  doPasswordsMatch: any,
  setDoPasswordsMatch: any,
  handleNextStep: any,
  handlePreviousStep: any,
  router: any,
  currentStep: number
}) => {

  // NOTE 🟨 - CONFIRM PASSWORD
  useEffect(() => {
    // Password matching logic remains the same
    if (form.password.length > 5 && form.confirmPassword.length > 5 && form.password === form.confirmPassword) {
      setDoPasswordsMatch(true)
      // console.log('match')
    } else {
      setDoPasswordsMatch(false)
      // console.log('NO match')
    }
  }, [form.confirmPassword, form.password, setDoPasswordsMatch])

  // NOTE 🟦 - HOW DID YOU HEAR ABOUT US
  const HowDidYouHearAboutUsComponent = () => {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 20, width: '100%', gap: 10 }}>
        {howDidYouHearAboutUsOptions.map((option, index) => (
          <Pressable
            key={index}
            onPress={() => {
              setForm({ ...form, howDidYouHearAboutUs: option?.value });
              lightFeedback();
            }}
            style={[styles.hdyhauSelect, { backgroundColor: form.howDidYouHearAboutUs === option.value ? `${colors.readioOrange}` : `${colors.readioBlack}50`, },
            ]}
          >
            <View style={{ width: 20, height: 20, borderRadius: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: form.howDidYouHearAboutUs === option.value ? 'green' : `${colors.readioBlack}70` }}>
              <IconSymbol name='checkmark' size={15} color={form.howDidYouHearAboutUs === option.value ? colors.readioWhite : 'transparent'} />
            </View>
            <Text allowFontScaling={false} style={{ fontFamily: readioBoldFont, fontSize: 16, color: colors.readioWhite }}>
              {option?.label}
            </Text>
          </Pressable>
        ))}
      </View>
    )
  }

  // NOTE 🟩 - SIGNUP OBJECT
  const signUpSteps = [
    // Step definitions remain the same...
    {
      step: 1, // Corresponds to index 0
      title: 'What is your name?',
      description: 'Please enter your name.',
      field: (
        <InputField
          allowFontScaling={false}
          autoComplete='name'
          autoFocus
          label=""
          placeholder=""
          icon={icons.person}
          value={form.name}
          style={styles.inputFieldStyle} // Use consistent style
          onChangeText={(text) => setForm({ ...form, name: text })}
          autoCapitalize="words" // Good for names
          returnKeyType="next" // Improve keyboard UX
        // onSubmitEditing={handleNextStep} // Go to next on enter (optional)
        />
      )
    },
    {
      step: 2, // Corresponds to index 1
      title: `What's your email?`,
      description: 'Please enter your email address.',
      field: (
        <InputField
          allowFontScaling={false}
          autoComplete='email'
          autoFocus
          label=""
          placeholder=""
          icon={icons.email}
          value={form.email}
          style={styles.inputFieldStyle}
          onChangeText={(text) => setForm({ ...form, email: text.toLowerCase().trim() })} // Normalize email input
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
        />
      )
    },
    {
      step: 3, // Corresponds to index 2
      title: 'Choose your password',
      description: 'Must be at least 6 characters.',
      field: (
        <InputField
          allowFontScaling={false}
          label=""
          placeholder=""
          autoFocus
          icon={icons.lock}
          value={form.password}
          secureTextEntry={true}
          style={styles.inputFieldStyle}
          onChangeText={(text) => setForm({ ...form, password: text })}
          returnKeyType="next"
        />
      )
    },
    {
      step: 4, // Corresponds to index 3
      title: 'Confirm your password',
      description: 'Please re-enter your password.',
      field: (
        <>
          <InputField
            allowFontScaling={false}
            label=""
            placeholder=""
            icon={icons.lock}
            value={form.confirmPassword}
            secureTextEntry={true}
            style={styles.inputFieldStyle}
            onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
            returnKeyType={doPasswordsMatch ? "next" : "done"} // Change based on match
          // onSubmitEditing={handleNextStep}
          />
          {/* Conditional feedback */}
          {form.confirmPassword.length > 0 && ( // Show feedback only when confirm field has input
            doPasswordsMatch ? (
              <Text allowFontScaling={false} style={styles.passwordMatchText}>Passwords match!</Text>
            ) : (
              <Text allowFontScaling={false} style={styles.passwordMismatchText}>Passwords do not match</Text>
            )
          )}
        </>
      )
    },
    {
      step: 5, // Corresponds to index 4
      title: 'How did you hear about us?',
      description: `(Optional) Select an option or skip.`,
      field: (
        // Replace with your actual selection component (e.g., Picker, Radio buttons)
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <HowDidYouHearAboutUsComponent />
        </View>
      )
    }
  ];

  // NOTE 🟩 - SIGNUP VARIABLES
  const { mediumFeedback, lightFeedback, successFeedback } = useLotusHaptic();
  const howDidYouHearAboutUsOptions = [
    { label: 'Grove Park', value: 'Grove Park', },
    { label: 'Other', value: 'Lotus', },
  ]
  const currentStepData = signUpSteps[currentStep];
  const isLastStep = currentStep === signUpSteps.length - 1;
  // NOTE 🟩 - IS STEP VALID
  const isStepValid = () => {
    switch (currentStep) {
      case 0: return form.name.trim().length > 0;
      case 1: return form.email.includes('@') && form.email.includes('.'); // Basic email check
      case 2: return form.password.length >= 6;
      case 3: return doPasswordsMatch;
      case 4: return form.howDidYouHearAboutUs !== '';
      default: return false;
    }
  };
  const canProceed = isStepValid();

  return (
    <>
      {/* Render only the current step's content */}
      {currentStepData && (
        <View key={currentStepData.step} style={styles.stepContainer}>
          {/* NOTES THE RENDERED SIGNUP TITLE FOR FIELD */}
          <Text allowFontScaling={false} style={[styles.title]}>{currentStepData.title}</Text>
          {/* NOTE 🟦 - THE RENDERED SIGNUP FIELD */}
          <View style={styles.fieldContainer}>
            {currentStepData.field}
          </View>
        </View>
      )}

      <View style={{ gap: 10 }}>
        {/* NOTE 🟦 - BACK SIGNUP BUTTON */}
        <Pressable
          onPress={handlePreviousStep}
          style={styles.backButton}
        >
          <Text allowFontScaling={false} style={[buttonStyle.mainButtonText, { color: `${colors.readioWhite}90` }]}>
            Back
          </Text>
        </Pressable>

        {/* NOTE 🟦 - CONTINUE SIGNUP BUTTON */}
        <Pressable
          onPress={handleNextStep}
          // Disable button if the current step isn't valid
          disabled={!canProceed}
          style={[
            styles.button,
            !canProceed && styles.buttonDisabled // Apply disabled style
          ]}
        >
          <Text allowFontScaling={false} style={[buttonStyle.mainButtonText, { color: canProceed ? colors.readioWhite : `${colors.readioWhite}90` }]}>
            {isLastStep ? 'Sign Up' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </>
  )
}

// NOTE 🎨 STYLES
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