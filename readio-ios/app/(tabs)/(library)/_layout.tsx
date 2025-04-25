import sql from '@/helpers/neonClient';
import { tokenCache } from '@/lib/auth';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayoutNav() {

    return (
      // <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="lib" options={{ headerShown: false, }} />
          <Stack.Screen name="(myplaylist)" options={{ headerShown: false }} />
          <Stack.Screen name=":readioId" options={{ headerShown: false }} />
          <Stack.Screen name="my-articles" options={{ headerShown: false }} />
        </Stack>
      // </ThemeProvider>
    );
  }