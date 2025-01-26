import { Stack } from 'expo-router';

export default function PlaylistLayout() {
  
    return (
      // <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false, }} />
          <Stack.Screen name=":playlistId" options={{ headerShown: false }} />
          <Stack.Screen name=":interestId" options={{ headerShown: false }} />
          <Stack.Screen name="interests" options={{ headerShown: false }} />
          <Stack.Screen name="favorites" options={{ headerShown: false }} />
        </Stack>
      // </ThemeProvider>
    );
}