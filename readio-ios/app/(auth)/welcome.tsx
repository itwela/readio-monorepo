import { useReadio } from '@/constants/readioContext';
import { StyleSheet, Text, View } from 'react-native';
// import { useNavigation } from "@react-navigation/native";
// import { RootNavigationProp } from "@/types/type";
import { router } from 'expo-router';

export default function Welcome() {
    
    const { isSignedInLotus, setIsSignedInLotus } = useReadio();
    // const navigation = useNavigation<RootNavigationProp>(); // use typed navigation  

    return (
        <>
        <View style={styles.container}>
            <Text style={styles.text}>Welcome</Text>
            <Text onPress={() => router.push("/(tabs)/home")}>go home</Text>
        </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 60,
        fontWeight: 'bold',
    },
});