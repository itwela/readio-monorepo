import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
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
import { useUser } from '@clerk/clerk-expo';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useUser();
  const [theUserStuff, setTheUserStuff] = useState<any>();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserStuff = async () => {
      try {
        const response = await sql`SELECT * FROM users WHERE clerk_id = ${user?.id}`;
        setTheUserStuff(response);
        console.log("theUserStuff", response); // Log the actual response
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (user) { // Only fetch if user is available
      fetchUserStuff();
    }
  }, [user]);


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
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="(library)"
          options={{
            title: 'Library',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />
        {theUserStuff?.[0]?.role === "owner" && (
          <Tabs.Screen
            name="chat"
            options={{
              title: 'Chat',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
            }}
          />
        )}
      </Tabs>

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