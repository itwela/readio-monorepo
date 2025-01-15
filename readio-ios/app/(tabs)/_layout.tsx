import { router, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { readioRegularFont } from '@/constants/tokens';
import { colors } from '@/constants/tokens';
import ReadioFloatingPlayer from '@/components/ReadioFloatingPlayer';
import sql from '@/helpers/neonClient';
import { useReadio } from '@/constants/readioContext';
import { tokenCache } from '@/lib/auth';
import { useActiveTrack } from 'react-native-track-player';
import { useLastActiveTrack } from '@/hooks/useLastActiveTrack';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();

  // const { user, setUser } = useReadio();
  // useEffect(() => {
  //   const checkSignInStatus = async () => {
  //     const savedHash = await tokenCache.getToken('userPasswordHash');
  //     if (savedHash) {
  //       getUserInfo(savedHash);
  //     }
  //   };
  //   const getUserInfo = async (hash: string) => {
  //     const userInfo = await sql`SELECT * FROM users WHERE pwhash = ${hash}`
  //     setUser?.(userInfo[0]);
  //     console.log("userInfo: ", userInfo[0]);
  //   }
  //   checkSignInStatus();
  // }, [user?.clerk_id]);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.readioOrange,
          tabBarInactiveTintColor: colors.readioWhite,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              backgroundColor: colors.readioBrown,
              borderColor: "transparent",
              borderTopWidth: 0,
              paddingTop: 10,
            },
            default: {
              backgroundColor: colors.readioBrown,
              borderColor: "transparent",
              borderTopWidth: 0,
            },
          }),
          tabBarLabelStyle: {
            fontFamily: readioRegularFont,
          },
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="(library)"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />
          <Tabs.Screen
            name="giant"
            options={{
              title: '',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name='star.fill' color={color} />,
            }}

          />

      </Tabs>

      <AnouncmentPopup/>

        <ReadioFloatingPlayer
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 78,
          }}
        />

    </>
  );
}

const AnouncmentPopup = () => {
  
  const activeTrack = useActiveTrack();
  const lastActiveTrack = useLastActiveTrack();

  const displayedTrack = activeTrack ?? lastActiveTrack;
  const [show, setShow] = useState(true)
  
  if (show == false) {
    return null
  }


  return (
    <>
      <View style={{width: '90%',  paddingHorizontal: 5, alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center', height: 50, backgroundColor: colors.readioWhite, borderRadius: 50, position: 'absolute', bottom: activeTrack ? 150 : 80}}>
          
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}} >
            <View style={{width: 45,  alignSelf: 'center',  height: 45, borderRadius: 100, backgroundColor: colors.readioOrange}}/>
            <View style={{display: 'flex', flexDirection: 'column', paddingLeft: 5}}>
              <Text style={{fontWeight: 'bold', fontFamily: readioRegularFont}}>Here for the Giant Steps?</Text>
              <Text>Press me to get started!</Text>
            </View>
          </View>

         <FontAwesome onPress={() => router.push('/(tabs)/giant')} name='arrow-right' style={{paddingRight: 10}} size={24}/>
          <Pressable onPress={() => setShow(!show)} style={{position: 'absolute', top: -20, left: '0%', paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.readioOrange,}}>
            <Text style={{color: colors.readioWhite, fontFamily: readioRegularFont}}>Hide</Text>
          </Pressable>
      </View>
    </>
  )

}