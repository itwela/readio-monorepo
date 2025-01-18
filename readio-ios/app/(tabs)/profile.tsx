import { colors } from "@/constants/tokens";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Pressable, Modal, KeyboardAvoidingView } from "react-native";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
// import { router } from "expo-router";
// import NotSignedIn from '@/constants/notSignedIn';
// import { useEffect, useState } from 'react';
// import { UserStuff } from '@/types/type';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { buttonStyle, utilStyle } from "@/constants/tokens";
import { router } from 'expo-router';
import { useReadio } from "@/constants/readioContext";
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, FadeOutUp } from "react-native-reanimated";
import { SlideInUp, SlideOutDown } from "react-native-reanimated";
import { whitelogo, blacklogo } from "@/constants/images";
import FastImage from "react-native-fast-image";
import { useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import InputField from "@/components/inputField";
import { icons } from "@/constants/icons";
import sql from "@/helpers/neonClient";
import { Asset } from 'expo-asset';

export default function ProfileScreen() {
  const {user, setUser, needsToRefresh, setNeedsToRefresh} = useReadio()
  const [wantsToEditProfile, setWantsToEditProfile] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [articleLength, setArticleLength] = useState(0)
const toggleModal = () => {
  setIsModalVisible(!isModalVisible);
}
const [form, setForm] = useState({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const [showPass, setShowPass] = useState(false)
const [doPasswordsMatch, setDoPasswordsMatch] = useState(false)

useEffect(() => {
    if (form.password.length > 5 && form.confirmPassword.length > 5 && form.password === form.confirmPassword) {
        setDoPasswordsMatch(true)
        console.log('match')
      } else {
        setDoPasswordsMatch(false)
        console.log('NO match')
    }
}, [form.confirmPassword, form.password])
  
const [imagesLoaded, setImagesLoaded] = useState(0)
const [screenIsReady, setScreenIsReady] = useState(false)

useEffect(() => {
  if (imagesLoaded > 4 && user) {
      setTimeout(()=> {
          setScreenIsReady(true)
      }, 1000)
  }
}, [imagesLoaded, screenIsReady, setScreenIsReady])

useEffect(() => {
  const handleGetArticleCount = async () => {
    const getArticleIds = await sql`SELECT id FROM readios WHERE clerk_id = ${user?.clerk_id}`;
    const ALength = getArticleIds?.length
    setArticleLength(ALength)
  } 

  handleGetArticleCount()

}, [])

const handleSaveChanges = async () => {
  console.log(form);

  if (form.name !== '' && form.name.length > 0) {
    console.log('valid name');
    try {
      const saveNewName = await sql`UPDATE users SET name = ${form.name} WHERE name = ${user?.name} AND jwt = ${user?.jwt}`;
      console.log('successfully updated name');
    } catch (error) {
      console.log('error', error)
    } 
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    console.log('valid email');
    try {
      const saveNewName = await sql`UPDATE users SET email = ${form.email} WHERE name = ${user?.name} AND jwt = ${user?.jwt}`;
      console.log('successfully updated email');
    } catch (error) {
      console.log('error', error)
    } 
  }

  if (  form.password.length > 5 && form.password.length > 5 && doPasswordsMatch === true  ) {
    console.log('valid password');
    try {
      const saveNewName = await sql`UPDATE users SET pass = ${form.password} WHERE name = ${user?.name} AND jwt = ${user?.jwt}`;
      console.log('successs1');
    } catch (error) {
      console.log('error', error)
    } 
  }

  const updateUser = await sql`SELECT * FROM users WHERE jwt = ${user?.jwt}`
  setUser?.(updateUser[0])
  setIsModalVisible(false)

}

  return (
    <>


            {screenIsReady === false && (
                <>
                <Animated.View  exiting={FadeOut.duration(500)} style={{position: 'absolute', zIndex: 1, width: '100%', height: '100%', justifyContent: 'center', backgroundColor: colors.readioBrown}}>
                    <Animated.Text  exiting={FadeOutUp.duration(150)} style={{alignSelf: 'center', color: colors.readioWhite, fontFamily: readioBoldFont, fontSize: 38}}>Lotus</Animated.Text>
                    <Animated.Text  exiting={FadeOutUp.duration(100)} style={{alignSelf: 'center', color: colors.readioWhite, fontFamily: readioRegularFont, fontSize: 25}}>Always Growing</Animated.Text>
                </Animated.View>
                </>
            )}


      {isModalVisible === true && (
        <>
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.modalBackground}>

          </Animated.View>
        </>
      )}
  

      <SafeAreaView style={[{   alignItems: 'flex-start', backgroundColor: colors.readioOrange}]}>
        
            <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))} style={{width: 700, top: '-150%',  position: 'absolute', left: '-5%', height: 1300, opacity: 0.3, alignSelf: "center",  backgroundColor: "transparent"}} resizeMode="cover" />
            <FastImage  onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))}  style={{width: 700, top: '-380%',  position: 'absolute', right: '-120%', height: 1300, opacity: 0.3, alignSelf: "center",  backgroundColor: "transparent"}} resizeMode="cover" />
            <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)}  source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))}  style={{width: 700, top: '-200%', position: 'absolute', right: '25%', height: 700, opacity: 0.3, alignSelf: "center", backgroundColor: "transparent"}} resizeMode="cover" />
            <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))}  style={{width: 700, top: '-100%', position: 'absolute', right: '45%', height: 700, opacity: 0.3, alignSelf: "center", backgroundColor: "transparent"}} resizeMode="cover" />



        <View style={styles.container}>
          
          <Text numberOfLines={1}  allowFontScaling={false} style={[styles.text, {width: '100%', padding: 20,}]}>Hi, {user?.name}!</Text>
          
          <Animated.View  entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(300)}  style={{marginTop: 10, width: 110, justifyContent: 'center', alignSelf: 'center', height: 110, backgroundColor: colors.readioWhite, borderRadius: 500}}>
            <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={Asset.fromModule(require('@/assets/images/cropblacklogo.png'))}  style={{width: 70, height: 70, alignSelf: "center", marginTop: 10, backgroundColor: "transparent"}} resizeMode="cover" />
          </Animated.View>
          
          

        </View>

      </SafeAreaView>
     
      <View style={{zIndex: -1, position: 'absolute', backgroundColor: colors.readioOrange, width: '100%', height: '100%'}}></View>
     
      <View style={{width: '100%', alignSelf: 'flex-end'}}>
        <Pressable onPress={() => toggleModal()} style={{alignSelf: 'center', margin: 20, padding: 10, borderRadius: 10, backgroundColor: colors.readioWhite, alignItems: 'center'}}>
          <Text style={{color: colors.readioOrange, fontFamily: readioBoldFont}}>Edit Profile</Text>
        </Pressable>
      </View>

      <ScrollView style={{width: '100%', minHeight: '100%', backgroundColor: colors.readioBrown, padding: 20,  borderTopLeftRadius: 30, borderTopRightRadius: 30}}>
        <View style={{display: 'flex', padding: 10, flexDirection: 'column', width: '100%', height: '100%', gap: 15,}}>
            
            
              <Text style={{color: colors.readioWhite, fontFamily: readioBoldFont, fontSize: 20, paddingBottom: 10,}}>@ {user?.name}</Text>
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
              <Text style={{color: colors.readioWhite, textAlign: 'center', fontFamily: readioBoldFont, fontSize: 20}}>{articleLength} articles</Text>
              <Text style={{color: colors.readioWhite, textAlign: 'center', fontFamily: readioBoldFont, fontSize: 20}}>{user?.upvotes} upvotes</Text>
            </View>

            <View style={{width: '100%', height: 50, borderBottomWidth: 1, borderBottomColor: colors.readioWhite,  justifyContent: 'center', paddingHorizontal: 5}}>
              <Text  allowFontScaling={false} onPress={() => router.push('/(tabs)/(library)/(playlist)/favorites')} style={{color: colors.readioWhite, fontSize: 18, fontFamily: readioRegularFont}}>Your Favorites</Text>
            </View>
            <View style={{width: '100%', height: 50, borderBottomWidth: 1, borderBottomColor: colors.readioWhite,  justifyContent: 'center', paddingHorizontal: 5}}>
              <Text  allowFontScaling={false} onPress={() => router.push('/(auth)/welcome')}style={{color: colors.readioWhite, fontSize: 18, fontFamily: readioRegularFont}}>About Lotus</Text>
            </View>
            {/* <View style={{width: '100%', height: 50, borderBottomWidth: 1, borderBottomColor: colors.readioWhite,  justifyContent: 'center', paddingHorizontal: 5}}>
              <Text  allowFontScaling={false} onPress={() => router.push('/(auth)/welcome')} style={{color: colors.readioWhite, fontSize: 18, fontFamily: readioRegularFont}}>Help</Text>
            </View> */}
            <View style={{width: '100%', height: 50, borderBottomWidth: 1, borderBottomColor: colors.readioWhite,  justifyContent: 'center', paddingHorizontal: 5}}>
              <Text  allowFontScaling={false} onPress={() => router.push('/(auth)/welcome')} style={{color: colors.readioWhite, fontSize: 18, fontFamily: readioRegularFont}}>Go back to welcome screen</Text>
            </View>
        </View>
      </ScrollView>

      <Modal
          animationType="slide" 
          transparent={true} 
          visible={isModalVisible}
          onRequestClose={toggleModal}
          style={{width: '100%', height: '95%',  }}
        >
          <SafeAreaView style={{width: '100%', height: '95%', bottom: 0, borderRadius: 40, position: 'absolute', backgroundColor: colors.readioBrown, }}>

            <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={10} style={{padding: 20, borderRadius: 40, backgroundColor: colors.readioBrown,  width: '100%', height: '100%', display: 'flex', justifyContent: "space-between", paddingVertical: "10%"}}>
              
              <View style={{width: '100%', marginBottom: 20, alignItems: 'center', flexDirection: 'row', display: 'flex', justifyContent: 'space-between', backgroundColor: "transparent"}}>
                <View>
                  <Text style={{color: colors.readioWhite, fontFamily: readioBoldFont, fontSize: 30}}>Edit profile</Text>
                </View>
                <TouchableOpacity onPress={toggleModal}>
                  <FontAwesome name="close" size={30} color={colors.readioWhite} />
                </TouchableOpacity>
              </View>

              {/* the actual modal content */}
              <ScrollView>
              
                <View>
                  <Text style={{fontFamily: readioBoldFont, color: colors.readioWhite}}>Name</Text>
                  <InputField 
                      allowFontScaling={false}
                        label=""
                        placeholder={user?.name}
                        placeholderTextColor={'#7a7a7a'}
                        icon={''}
                        value={form.name}
                        onChangeText={(text) => setForm({ ...form, name: text })}
                      />
                </View>
              
               
                <View>
                  <Text style={{fontFamily: readioBoldFont, color: colors.readioWhite}}>Email</Text>
                  <InputField 
                      allowFontScaling={false}
                        label=""
                        placeholder={user?.email}
                        placeholderTextColor={'#7a7a7a'}
                        icon={''}
                        value={form.email}
                        onChangeText={(text) => setForm({ ...form, email: text })}
                      />
                </View>
               
      

                <View>
                  <View style={{display: 'flex', justifyContent: 'space-between', flexDirection: 'row', width: '100%', alignItems: 'center'}}>
                    <Text style={{fontFamily: readioBoldFont, color: colors.readioWhite}}>New Password</Text>
                    <Pressable onPress={() => {setShowPass(!showPass)}} style={{padding: 10, opacity: showPass ? 1 : 0.7, display: 'flex', justifyContent: 'center', alignItems: 'center',}}>
                      <FontAwesome size={15} name={showPass ? 'eye' : 'eye-slash'} color={colors.readioWhite}/>
                    </Pressable>
                  </View>
                  <InputField 
                      allowFontScaling={false}
                        label=""
                        placeholder={showPass ? user?.pass : '*******'}
                        placeholderTextColor={'#7a7a7a'}
                        icon={''}
                        value={form.password}
                        onChangeText={(text) => setForm({ ...form, password: text })}
                      />
                </View>

                <View>
                  <Text style={{fontFamily: readioBoldFont, color: colors.readioWhite}}>Confirm Password</Text>
                  <InputField 
                      allowFontScaling={false}
                        label=""
                        placeholder=""
                        icon={''}
                        value={form.confirmPassword}
                        onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
                      />

                     {doPasswordsMatch === true && (
                        <Text style={{color: 'lime', fontFamily: readioRegularFont, opacity: 0.8}}>Passwords match!</Text>
                      )}
                
                      {doPasswordsMatch === false && form.confirmPassword.length > 0 && (
                        <Text style={{color: colors.readioWhite, fontFamily: readioRegularFont, opacity: 0.7}}>Passwords do not match</Text>
                      )}
                </View>
               
                
              </ScrollView>

                <Pressable onPress={() => {handleSaveChanges()}} style={{width: '100%', height: 40, alignSelf: 'center', justifyContent: 'center', position: 'absolute', bottom: 60, alignItems: 'center', borderRadius: 15, backgroundColor: colors.readioOrange}}>
                    <View>
                      <Text style={{color: colors.readioWhite, fontFamily: readioBoldFont, fontSize: 18}}>Save Changes</Text>
                    </View>
                </Pressable>
            </KeyboardAvoidingView>

          </SafeAreaView>
      </Modal>
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
    fontSize: 60,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: readioBoldFont
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
});

