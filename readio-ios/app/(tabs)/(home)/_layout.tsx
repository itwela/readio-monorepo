import { Stack } from 'expo-router';

export default function RootLayoutNav() {
    // const colorScheme = useColorScheme();
  
    return (
      // <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="home" options={{ headerShown: false , animation: 'fade' }} />
          <Stack.Screen name=":stationId" options={{ headerShown: false }} />
        </Stack>
      // </ThemeProvider>
    );
  }