import { colors } from "@/constants/tokens";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl, Pressable, Dimensions, Modal, KeyboardAvoidingView, ActivityIndicator, LayoutChangeEvent } from "react-native";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
import { accessKeyId, secretAccessKey } from '@/helpers/s3Client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buttonStyle, utilStyle } from "@/constants/tokens";
import { router } from 'expo-router';
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, FadeOutUp, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SlideInUp, SlideOutDown } from "react-native-reanimated";
import { croplogowhite, croplogoblack } from "@/constants/images";
import FastImage from "react-native-fast-image";
import { useContext, useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import InputField from "@/components/inputField";
import { icons } from "@/constants/icons";
import sql from "@/helpers/neonClient";
import { Asset } from 'expo-asset';
import { LinearGradient } from "expo-linear-gradient";
import AnimatedModal from "@/components/AnimatedModal";
import { geminiPexals, geminiTest, geminiTitle } from "@/helpers/geminiClient";
import { createClient } from "pexels";
import ReactNativeBlobUtil from 'react-native-blob-util'
import { s3 } from '@/helpers/s3Client';
import { pexelsClient } from "@/helpers/pexelsClient";
import { Buffer } from 'buffer';
import React from "react";
import { Keyboard } from "react-native";
import { useProgressQueue } from "../../handleArticleGenerations/processingQueue";
import { handleGenerateReadioCustom, HandleGenerateReadioCustomProps } from "../../handleArticleGenerations/handleGenerateReadioCustom";
import { getLocalImageUri } from "@/constants/imageAssets";
import { LotusArticleModal } from "@/components/LotusArticleModal";
import { LotusStudyModal } from "@/components/LotusStudyModal";
import { useLotusModal } from "@/helpers/providers/lotusModalContext";
import LotusHeader from "@/components/LotusHeader";
import { tokenCache } from "@/lib/auth";
import { setStateAsync } from "@/constants/utilityFunctions";

export default function ProfileScreen() {

  const { user, setUser, checkSignInStatus, refreshUserData, userUpvoteCount, userArticleCount, userStepCount, needsToRefresh, setNeedsToRefresh, setIsSignedIn, setHasAccount } = useLotusUser()
  const { form, setForm, isArticleModalVisible, wantsToMakeAStudyArticle, setWantsToMakeAStudyArticle, setIsArticleGenerating, setIsStudyModalVisible, setIsArticleModalVisible, setArticleGenerationStatus, setWantsToMakeAnArticle, wantsToMakeAnArticle, articleGenerationStatus } = useLotusModal()
  const [modalMessage, setModalMessage] = useState("")
  const [wantsToEditProfile, setWantsToEditProfile] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  // const [articleLength, setArticleLength] = useState(0)
  const { ProgressQueue, animatedStyles, setGenerationStarted, setProgressMessage, generationStarted, progressMessage, handleProgressContainerLayout } = useProgressQueue()
  const headerHeight = 120

  // END  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [showPass, setShowPass] = useState(false)
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(false)

  useEffect(() => {
    if (editForm.password?.length > 5 && editForm?.confirmPassword?.length > 5 && editForm?.password === editForm?.confirmPassword) {
      setDoPasswordsMatch(true)
      console.log('match')
    } else {
      setDoPasswordsMatch(false)
      console.log('NO match')
    }
  }, [editForm.confirmPassword, editForm.password])

  useEffect(() => {
    refreshUserData()
  }, [articleGenerationStatus])

  const handleSaveChanges = async () => {
    console.log(editForm);

    if (editForm?.name !== '' && editForm?.name?.length > 0) {
      console.log('valid name');
      try {
        const saveNewName = await sql`UPDATE users SET name = ${editForm.name} WHERE name = ${user?.name} AND jwt = ${user?.jwt}`;
        console.log('successfully updated name');
      } catch (error) {
        console.log('error', error)
      }
    }

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm?.email)) {
      console.log('valid email');
      try {
        const saveNewName = await sql`UPDATE users SET email = ${editForm.email} WHERE name = ${user?.name} AND jwt = ${user?.jwt}`;
        console.log('successfully updated email');
      } catch (error) {
        console.log('error', error)
      }
    }

    if (editForm?.password?.length > 5 && editForm?.password?.length > 5 && doPasswordsMatch === true) {
      console.log('valid password');
      try {
        const saveNewName = await sql`UPDATE users SET pass = ${editForm.password} WHERE name = ${user?.name} AND jwt = ${user?.jwt}`;
        console.log('successs1');
      } catch (error) {
        console.log('error', error)
      }
    }

    const updateUser = await sql`SELECT * FROM users WHERE jwt = ${user?.jwt}`
    setUser?.(updateUser[0])
    setIsEditModalVisible(false)

  }

  const handleEditCloseModal = () => {
    setModalMessage("");
    setEditForm({ name: '', email: '', password: '', confirmPassword: '' });
    setIsEditModalVisible(false);
    setNeedsToRefresh?.(true)
    setTimeout(() => {
      setNeedsToRefresh?.(false)
    }, 200)
  }

  const [refreshing, setRefreshing] = useState(false); // For refresh control
  const onRefresh = () => {
    setRefreshing(true);
    setNeedsToRefresh?.(true)

    // Add any refresh logic here, such as resetting state or re-fetching data
    setTimeout(() => {
      setRefreshing(false);
      setNeedsToRefresh?.(false)
    }, 1000); // Simulate an async operation
  };

  return (
    <>

      {/* {isEditModalVisible === true && (
            <>
              <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.modalBackground}>

              </Animated.View>
            </>
          )} */}

      <LotusHeader backgroundColor={colors.readioBrown} />

      {/* FIXME I WANT THE HEAD ABOVE TO DISAPPEAR WHEN THE TRIGGER I HAVE MARKED INTERSECTS WITH THE HEADER  */}
      <ScrollView
        refreshControl={
          <RefreshControl
            tintColor={colors.readioWhite}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false} style={{ height: '100%', backgroundColor: colors.readioBrown }}>

        {/* FIXME THIS IS THE TRIGGER TO HIDE THE SCROLL VIEW */}
        <View style={styles.container}>

          <Text numberOfLines={1} allowFontScaling={false} style={[styles.text, { width: '100%', padding: 20, }]}>{user?.name}</Text>

          <Animated.View entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(300)} style={{ marginTop: 10, width: 110, justifyContent: 'center', alignSelf: 'center', height: 110, backgroundColor: colors.readioWhite, borderRadius: 500 }}>
            <FastImage source={{ uri: getLocalImageUri('blackLogo') }} style={{ width: 70, height: 70, alignSelf: "center", marginTop: 10, backgroundColor: "transparent" }} resizeMode="cover" />
          </Animated.View>

        </View>

        <View style={{ width: '100%', alignSelf: 'flex-end' }}>
          <Pressable onPress={() => setIsEditModalVisible(true)} style={[styles.playPauseButton, { alignSelf: 'center', margin: 20, padding: 10, borderRadius: 100, backgroundColor: colors.readioWhite, alignItems: 'center' }]}>
            <Text style={{ color: colors.readioBlack, fontFamily: readioBoldFont, padding: 5 }}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* SECTION this is the scrollview that i want to move to the top of the screen as i scroll, covering everything else */}
        <View style={{ width: '100%', minHeight: Dimensions.get('window').height - headerHeight, backgroundColor: colors.readioBrown, padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
          <View style={{ display: 'flex', padding: 10, flexDirection: 'column', width: '100%', height: '100%', gap: 15, }}>

            <View style={{ display: 'flex', }}>
              <Text style={{ color: colors.readioWhite, fontFamily: readioBoldFont, fontSize: 20, paddingVertical: 10, }}>@{user?.name}</Text>
            </View>

            <View style={{ height: 2 }} />
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>

              <View>
                <Text style={{ color: colors.readioWhite, textAlign: 'center', fontFamily: readioBoldFont, fontSize: 20 }}>{userArticleCount}</Text>
                <Text style={{ color: colors.readioWhite, textAlign: 'center', fontFamily: readioRegularFont, fontSize: 20 }}>articles</Text>
              </View>

              <View>
                <Text style={{ color: colors.readioWhite, textAlign: 'center', fontFamily: readioBoldFont, fontSize: 20 }}>{userUpvoteCount}</Text>
                <Text style={{ color: colors.readioWhite, textAlign: 'center', fontFamily: readioRegularFont, fontSize: 20 }}>upvotes</Text>
              </View>

              <View>
                <Text style={{ color: colors.readioWhite, textAlign: 'center', fontFamily: readioBoldFont, fontSize: 20 }}>{userStepCount}</Text>
                <Text style={{ color: colors.readioWhite, textAlign: 'center', fontFamily: readioRegularFont, fontSize: 20 }}>steps</Text>
              </View>

            </View>

            <View style={{ opacity: 0.5, width: '100%', height: 50, borderBottomWidth: 1, borderBottomColor: colors.readioWhite, justifyContent: 'center', paddingHorizontal: 5 }}>
              <Text allowFontScaling={false} onPress={() => setIsStudyModalVisible(true)} style={{ color: colors.readioWhite, fontSize: 18, fontFamily: readioRegularFont }}>Study</Text>
            </View>

            <View style={{ opacity: 0.5, width: '100%', height: 50, borderBottomWidth: 1, borderBottomColor: colors.readioWhite, justifyContent: 'center', paddingHorizontal: 5 }}>
              <Text allowFontScaling={false} onPress={() => router.push('/(tabs)/(library)/(playlist)/interests')} style={{ color: colors.readioWhite, fontSize: 18, fontFamily: readioRegularFont }}>Your Interests</Text>
            </View>

            <View style={{ opacity: 0.5, width: '100%', height: 50, borderBottomWidth: 1, borderBottomColor: colors.readioWhite, justifyContent: 'center', paddingHorizontal: 5 }}>
              <Text allowFontScaling={false} onPress={() => router.push('/(tabs)/(library)/(playlist)/favorites')} style={{ color: colors.readioWhite, fontSize: 18, fontFamily: readioRegularFont }}>Your Favorites</Text>
            </View>

            <View style={{ opacity: 0.5, width: '100%', height: 50, borderBottomWidth: 1, borderBottomColor: colors.readioWhite, justifyContent: 'center', paddingHorizontal: 5 }}>
              <Text allowFontScaling={false} onPress={() => router.push('/(auth)/welcome')} style={{ color: colors.readioWhite, fontSize: 18, fontFamily: readioRegularFont }}>Go back to welcome screen</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* SECTION edit profile modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={handleEditCloseModal}
        style={{ width: '100%', height: '95%', }}
      >
        <SafeAreaView style={{ width: '100%', height: '95%', bottom: 0, borderRadius: 40, position: 'absolute', backgroundColor: colors.readioBrown, }}>

          <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={10} style={{ padding: 20, borderRadius: 40, backgroundColor: colors.readioBrown, width: '100%', height: '100%', display: 'flex', justifyContent: "space-between", paddingVertical: "10%" }}>

            <View style={{ width: '100%', marginBottom: 20, alignItems: 'center', flexDirection: 'row', display: 'flex', justifyContent: 'space-between', backgroundColor: "transparent" }}>

              <View>
                <Text style={{ color: colors.readioWhite, fontFamily: readioBoldFont, fontSize: 30 }}>Edit profile</Text>
              </View>

              <TouchableOpacity onPress={handleEditCloseModal}>
                <FontAwesome name="close" size={30} color={colors.readioWhite} />
              </TouchableOpacity>

            </View>

            {/* the actual modal content */}
            <ScrollView>

              <View>
                <Text style={{ fontFamily: readioBoldFont, color: colors.readioWhite }}>Name</Text>
                <InputField
                  allowFontScaling={false}
                  label=""
                  placeholder={user?.name}
                  placeholderTextColor={'#7a7a7a'}
                  icon={''}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                />
              </View>


              <View>
                <Text style={{ fontFamily: readioBoldFont, color: colors.readioWhite }}>Email</Text>
                <InputField
                  allowFontScaling={false}
                  label=""
                  placeholder={user?.email}
                  placeholderTextColor={'#7a7a7a'}
                  icon={''}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                />
              </View>



              <View>
                <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', width: '100%', alignItems: 'center' }}>
                  <Text style={{ fontFamily: readioBoldFont, color: colors.readioWhite }}>New Password</Text>
                  <Pressable onPress={() => { setShowPass(!showPass) }} style={{ padding: 10, opacity: showPass ? 1 : 0.7, display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                    <FontAwesome size={15} name={showPass ? 'eye' : 'eye-slash'} color={colors.readioWhite} />
                  </Pressable>
                </View>
                <InputField
                  allowFontScaling={false}
                  label=""
                  placeholder={showPass ? user?.pass : '*******'}
                  placeholderTextColor={'#7a7a7a'}
                  icon={''}
                  value={editForm.password}
                  onChangeText={(text) => setEditForm({ ...editForm, password: text })}
                />
              </View>

              <View>
                <Text style={{ fontFamily: readioBoldFont, color: colors.readioWhite }}>Confirm Password</Text>
                <InputField
                  allowFontScaling={false}
                  label=""
                  placeholder=""
                  icon={''}
                  value={editForm.confirmPassword}
                  onChangeText={(text) => setEditForm({ ...editForm, confirmPassword: text })}
                />

                {doPasswordsMatch === true && (
                  <Text style={{ color: 'lime', fontFamily: readioRegularFont, opacity: 0.8 }}>Passwords match!</Text>
                )}

                {doPasswordsMatch === false && editForm?.confirmPassword?.length > 0 && (
                  <Text style={{ color: colors.readioWhite, fontFamily: readioRegularFont, opacity: 0.7 }}>Passwords do not match</Text>
                )}
              </View>


            </ScrollView>

            <Pressable onPress={() => { handleSaveChanges() }} style={{ width: '100%', height: 40, alignSelf: 'center', justifyContent: 'center', position: 'absolute', bottom: 60, alignItems: 'center', borderRadius: 15, backgroundColor: colors.readioOrange }}>
              <View>
                <Text style={{ color: colors.readioWhite, fontFamily: readioBoldFont, fontSize: 18 }}>Save Changes</Text>
              </View>
            </Pressable>
          </KeyboardAvoidingView>

        </SafeAreaView>
      </Modal>

      {/* SECTION create study article modal */}
      <LotusStudyModal />

      {/* SECTION create article modal */}
      <LotusArticleModal />
    </>
  );

}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
  },
  modalBackground: {
    justifyContent: "flex-end",
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    height: '100%',
    zIndex: 100,
    position: 'absolute',
  },
  gap: {
    marginVertical: 20,
  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: readioBoldFont,
    color: colors.readioWhite
  },
  heading: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.readioWhite,
    zIndex: 1,
    fontFamily: readioBoldFont
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: readioBoldFont
  },
  subtext: {
    fontSize: 15,
    opacity: 0.5,
    textAlign: 'center',
    fontFamily: readioRegularFont,
    color: colors.readioWhite
  },
  option: {
    fontSize: 20,
    paddingVertical: 10,
    color: colors.readioWhite,
    fontFamily: readioRegularFont,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  playPauseButton: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.readioWhite,
    transform: [{ scale: 1 }],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
});

