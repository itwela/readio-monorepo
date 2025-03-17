import InputField from "@/components/inputField";
import { LotusArticleModal } from "@/components/LotusModals/LotusArticleModal";
import LotusHeader from "@/components/LotusHeader";
import { LotusStudyModal } from "@/components/LotusModals/LotusStudyModal";
import { getLocalImageUri, ImageAssets } from "@/constants/imageAssets";
import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { setStateAsync } from "@/constants/utilityFunctions";
import { useProgressQueue } from "@/handleArticleGenerations/processingQueue";
import sql from "@/helpers/neonClient";
import { useLotusModal } from "@/helpers/providers/lotusModalContext";
import { useLotusSettings } from "@/helpers/providers/lotusSetingsProvider";
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import { utilsStyles } from "@/styles";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image, KeyboardAvoidingView, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LotusButtonSelectGroup } from "./LotusButtonSelectGroup";
import { LotusStatsCard } from "./LotusStatsCard";
import { IconSymbol } from "./ui/IconSymbol";
import LotusGap from "./LotusGap";

export default function ProfileScreen() {
  
  const { user, setUser, checkSignInStatus, refreshUserData, userUpvoteCount, userArticleCount, userStepCount, needsToRefresh, setNeedsToRefresh, setIsSignedIn, setHasAccount } = useLotusUser()
  const { form, setForm, isArticleModalVisible, wantsToMakeAStudyArticle, setWantsToMakeAStudyArticle, setIsArticleGenerating, setIsStudyModalVisible, setIsArticleModalVisible, setArticleGenerationStatus, setWantsToMakeAnArticle, wantsToMakeAnArticle, articleGenerationStatus } = useLotusModal()
  const [modalMessage, setModalMessage] = useState("")
  const [wantsToEditProfile, setWantsToEditProfile] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true);
  // const [articleLength, setArticleLength] = useState(0)
  const {setSettingsOpen} = useLotusSettings()
  const { settingsOpen } = useLotusSettings()
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

  const handleNavigation = async (path: any) => {
    router.push(path as any);
    setTimeout(() => {
      setStateAsync(setSettingsOpen, false, 'affectsSomethingVisual')
    }, 500)
  };

  const profileCategories = [
    { title: 'Stats', content: (
      <LotusStatsCard
        stats={[
          { value: userStepCount as number, label: 'steps', iconName: 'shoeprints.fill' },
          { value: userArticleCount as number, label: 'articles', iconName: 'book.fill'},
          { value: userUpvoteCount as number, label: 'upvotes', iconName: 'hand.thumbsup.fill' },
          { value: 25 as number, label: 'minutes meditating', imgIconName: 'presenceIcon'}
        ]}
      />
    )},
    { title: 'Achievements', content: (
      <View style={{ width: '100%', gap: 15 }}>
      </View>
    )},
    { title: 'Notifications', content: (
      <View style={{ width: '100%', gap: 15 }}>
      </View>
    )}
  ]

  return (
    <>
    <View style={{ display: settingsOpen ? 'flex' : 'none', marginTop: 120, }}>

        <View style={[styles.container, {backgroundColor: colors.readioBrown, paddingBottom: 30,}]}>
          <Animated.View entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(300)} style={{ marginTop: 10, width: 110, justifyContent: 'center', alignSelf: 'center', height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', alignContent: 'center', backgroundColor: colors.readioWhite, borderRadius: 500 }}>
            <Image 
              source={ImageAssets.blackLogo} 
              style={{ width: 70, height: 70, alignSelf: "center", marginTop: 10, backgroundColor: "transparent" }} 
              resizeMode="cover"
            />
          </Animated.View>

          <Text numberOfLines={1} allowFontScaling={false} style={[styles.text, { width: '100%', padding: 10, textAlign: 'center', fontSize: 20 }]}>{user?.name}</Text>
       
        <Pressable 
          onPress={() => setIsEditModalVisible(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.readioOrange,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
            marginTop: 10,
            alignSelf: 'center'
          }}
        >
          <FontAwesome name="edit" size={16} color={colors.readioWhite} style={{marginRight: 8}} />
          <Text style={{
            color: colors.readioWhite,
            fontFamily: readioBoldFont,
            fontSize: 16
          }}>
            Edit Profile
          </Text>
        </Pressable>
        </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            tintColor={colors.readioWhite}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false} style={{ height: '100%', backgroundColor: colors.readioBrown }}>


        <View style={{ width: '100%', minHeight: Dimensions.get('window').height - headerHeight * 2, backgroundColor: colors.readioBrown, borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
          <View style={{ display: 'flex', padding: 20, flexDirection: 'column', width: '100%', gap: 30 }}>
            {profileCategories.map((category, index) => (
              <View key={index} style={{ width: '100%' }}>
                <Text style={[styles.text, { fontSize: 24, marginBottom: 15 }]}>{category.title}</Text>
                {category.content}
              </View>
            ))}

            <View style={{ height: 170, padding: 20, paddingBottom: 60, alignItems: 'center', justifyContent: 'center', }}>
              <Text style={{ 
                color: colors.readioWhite, 
                fontFamily: readioRegularFont,
                fontSize: 16,
                textAlign: 'center',
                opacity: 0.5
              }}>
                Keep going! Every step, article, and moment of mindfulness brings you closer to your goals.
              </Text>
            </View>
          </View>
        </View>

        <LotusGap backgroundColor="" gapNumber={200}/>
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

    </View>
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

