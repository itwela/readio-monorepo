import { router, Stack } from "expo-router";
import { View, Text, Pressable } from "react-native";
import ReadioFloatingPlayer from "@/components/ReadioFloatingPlayer";
import { colors, readioBoldFont } from "@/constants/tokens";
export default function Layout() {
    return (
        <>
        <Stack>
            <Stack.Screen name=":demoInterestId" options={{ headerShown: false }} />
            <Stack.Screen name="demo" options={{ headerShown: false }}/>
        </Stack>

        <ReadioFloatingPlayer
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 78,
          }}
        />

        <Pressable 
        onPress={() => router.push('/(auth)/welcome')}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: 78,
            backgroundColor: colors.readioOrange,
            justifyContent: 'center'
          }}
        >
          <Text style={{color: colors.readioWhite, alignSelf: 'center', fontSize: 16, fontFamily: readioBoldFont}}>Like what you hear?</Text>
          <Text style={{color: colors.readioWhite, alignSelf: 'center', fontSize: 16, fontFamily: readioBoldFont}}>Sign up today!</Text>
          <View style={{height: 15}}/>
        </Pressable>
        </>
    )
}