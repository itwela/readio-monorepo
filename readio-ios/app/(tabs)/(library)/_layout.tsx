import { Stack } from 'expo-router';

export default function RootLayoutNav() {
    // const colorScheme = useColorScheme();
  
    return (
      // <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="lib" options={{ headerShown: false }} />
          <Stack.Screen name="(playlist)" options={{ headerShown: false }} />
          <Stack.Screen name=":readioId" options={{ headerShown: false }} />
          <Stack.Screen name="all-readios" options={{ headerShown: false }} />
        </Stack>
      // </ThemeProvider>
    );
  }