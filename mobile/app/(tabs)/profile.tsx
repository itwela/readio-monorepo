import { StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import NotSignedIn from '@/constants/notSignedIn';


export default function ProfileScreen() {

  const { user } = useUser()

  return (
    <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fff'
    }}>

    <ScrollView style={{ 
      width: '90%', 
      minHeight: '100%' 
      }}>


 {/* header */}
 <View style={{ width:'100%', height: '10%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>  
                      <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={{display: 'flex', flexDirection: 'row'}}>
                          <Text style={{fontSize: 20, fontWeight: 'bold', color: '#fc3c44'}}>R</Text>
                      </TouchableOpacity>
                  </View>
        <SignedIn>

          <Text style={styles.heading}>Profile</Text>
          <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
          <Text>{user?.emailAddresses[0].emailAddress}</Text>  
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
  heading: {
    fontSize: 60,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  option: {
    fontSize: 20,
    paddingVertical: 10
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
