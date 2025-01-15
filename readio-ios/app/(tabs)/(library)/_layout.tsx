import { useReadio } from '@/constants/readioContext';
import sql from '@/helpers/neonClient';
import { tokenCache } from '@/lib/auth';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayoutNav() {
    // const colorScheme = useColorScheme();
  //   const { user, setUser } = useReadio();
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
      // <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="lib" options={{ headerShown: false, }} />
          <Stack.Screen name="(playlist)" options={{ headerShown: false }} />
          <Stack.Screen name=":readioId" options={{ headerShown: false }} />
          <Stack.Screen name="all-readios" options={{ headerShown: false }} />
        </Stack>
      // </ThemeProvider>
    );
  }