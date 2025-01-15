import { colors } from "@/constants/tokens";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
// import { router } from "expo-router";
// import NotSignedIn from '@/constants/notSignedIn';
// import { useEffect, useState } from 'react';
// import { UserStuff } from '@/types/type';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { buttonStyle, utilStyle } from "@/constants/tokens";
import { router } from 'expo-router';
import { useReadio } from "@/constants/readioContext";
import Animated, { FadeInDown, FadeInUp, FadeOutDown } from "react-native-reanimated";
import { SlideInUp, SlideOutDown } from "react-native-reanimated";
export default function ProfileScreen() {
  const {user} = useReadio()

  // const [theUserStuff, setTheUserStuff] = useState<{ data: UserStuff[] }>({ data: [] })

  return (
    <>
    {/* <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: colors.readioBrown,
    }}>

    <ScrollView style={{ 
      width: '90%', 
      minHeight: '100%' 
      }}>


        <View style={{ width:'100%', height: '10%', backgroundColor: "transparent", display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>  
              <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={{display: 'flex', flexDirection: 'row'}}>
                  <Text style={{fontSize: 20, fontWeight: 'bold', color: colors.readioOrange, fontFamily: readioBoldFont}}>R</Text>
              </TouchableOpacity>
        </View>
        <SignedIn>

          <Text style={styles.heading}>Profile</Text>
          <View style={styles.separator} />
          <Text style={styles.title}>{theUserStuff?.data?.[0]?.name}</Text>  
          <Text style={styles.title}>{user?.emailAddresses[0].emailAddress}</Text>

          <View style={styles.gap}/>

          <Text style={styles.title}>About</Text>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.title}>Terms of Use</Text>
          
          <View style={styles.gap}/>
          
          <Text style={styles.title}>Last Signed In At:</Text>
          <Text style={styles.option}>{user?.lastSignInAt?.toString()}</Text>  

          <View style={styles.gap}/>

          <Text style={styles.option} onPress={() => router.push('/(auth)/welcome')}>Back To Welcome</Text>      
        </SignedIn>
        <SignedOut>
          <NotSignedIn />
        </SignedOut>
    </ScrollView>
    
    </SafeAreaView> */}
      <SafeAreaView style={[utilStyle.safeAreaContainer, {backgroundColor: colors.readioBrown}]}>
      <View style={styles.container}>
        {/* <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeInDown.duration(300)}   allowFontScaling={false} style={styles.text}>Profile</Animated.Text> */}
        {/* <Text  allowFontScaling={false} style={{color: colors.readioWhite, position: 'absolute', top: 20}}>Coming soon...settings will be here</Text> */}
        <Animated.View  entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(300)}  style={{marginTop: 60, width: 200, height: 200, alignSelf: 'center', backgroundColor: colors.readioOrange, borderRadius: 500}}></Animated.View>
        <Text  allowFontScaling={false} style={[styles.text, {textAlign: 'center', width: '100%'}]}>Hi {user?.name}!</Text>
        <Text  allowFontScaling={false} onPress={() => router.push('/(auth)/welcome')} style={{color: colors.readioWhite, textAlign: 'center', width: '100%', fontFamily: readioRegularFont}}>Go back to welcome screen</Text>
        <View style={{width: '100%'}}>
          <View style={{alignSelf: 'center', margin: 20, padding: 10, borderRadius: 10, backgroundColor: colors.readioBlack, alignItems: 'center'}}>
            <Text style={{color: colors.readioWhite, fontFamily: readioBoldFont}}>Edit Profile</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    padding: utilStyle.padding.padding
  },
  gap: {
    marginVertical: 20,
  },
  text: {
    fontSize: 40,
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

