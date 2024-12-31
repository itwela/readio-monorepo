import { Stack } from "expo-router";

export default function Layout() {
    return (
        <>
        <Stack>
            <Stack.Screen name="welcome" options={{ headerShown: false }}/>
            <Stack.Screen name=":playlistId" options={{ headerShown: false }} />
            <Stack.Screen name="demo" options={{ headerShown: false }}/>
            <Stack.Screen name="features" options={{ headerShown: false }}/>
            <Stack.Screen name="quiz" options={{ headerShown: false }}/>
            <Stack.Screen name="sign-up" options={{ headerShown: false }}/>
            <Stack.Screen name="sign-in" options={{ headerShown: false }}/>
        </Stack>
        </>
    )
}