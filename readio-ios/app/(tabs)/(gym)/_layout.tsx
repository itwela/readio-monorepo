import { tokenCache } from '@/lib/auth';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayoutGym() {

    return (
        <Stack>
          <Stack.Screen name="gym" options={{ headerShown: false, }} />
        </Stack>
    );
  }