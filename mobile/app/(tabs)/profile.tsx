import { StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import NotSignedIn from '@/constants/notSignedIn';
import { useEffect, useState } from 'react';
import { UserStuff } from '@/types/type';
import { retryWithBackoff } from '@/helpers/retrywithBackoff';
import { fetchAPI } from '@/lib/fetch';
import { colors } from '@/constants/tokens';
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';

export default function ProfileScreen() {

  const { user } = useUser()
  const [theUserStuff, setTheUserStuff] = useState<{ data: UserStuff[] }>({ data: [] })

  useEffect (() => {
    const getTheUserStuff = async () => {

      retryWithBackoff(async () => {

      const response = await fetchAPI(`/(api)/getUserStuff`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
        }),
      });

      setTheUserStuff(response)
      }, 1, 1000)

    }

    getTheUserStuff()
  }, [])

  return (
    <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: colors.readioBrown,
    }}>

    <ScrollView style={{ 
      width: '90%', 
      minHeight: '100%' 
      }}>


        {/* header */}
        <View style={{ width:'100%', height: '10%', backgroundColor: "transparent", display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>  
              <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={{display: 'flex', flexDirection: 'row'}}>
                  <Text style={{fontSize: 20, fontWeight: 'bold', color: colors.readioOrange, fontFamily: readioBoldFont}}>R</Text>
              </TouchableOpacity>
        </View>
        <SignedIn>

          <Text style={styles.heading}>Profile</Text>
          <View style={styles.separator} lightColor="transparent" darkColor="rgba(255,255,255,0.1)" />
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
      {/* <EditScreenInfo path="app/(tabs)/two.tsx" /> */}
    </ScrollView>
    
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gap: {
    marginVertical: 20,
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
