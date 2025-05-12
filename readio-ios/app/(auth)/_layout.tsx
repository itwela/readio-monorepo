import { router, Stack } from "expo-router";
import { View, Text, Pressable } from "react-native";
import ReadioFloatingPlayer from "@/components/ReadioFloatingPlayer";
import { colors, readioBoldFont } from "@/constants/tokens";
import React from "react";
export default function Layout() {
    return (
        <>
        <Stack>
            <Stack.Screen name="welcome"  options={{ headerShown: false , animation: 'fade'}}/>
            <Stack.Screen name="features" options={{ headerShown: false }}/>
            <Stack.Screen name="quiz" options={{ headerShown: false }}/>
            <Stack.Screen name="sign-up" options={{ headerShown: false, animation: 'fade' }}/>
            <Stack.Screen name="sign-in" options={{ headerShown: false,  animation: 'fade' }}/>
        </Stack>
        </>
    )
}