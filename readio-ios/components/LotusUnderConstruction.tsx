
import { Text, View } from "react-native";
import { colors, systemPromptReadio } from "@/constants/tokens";

export const LotusUnderConctruction = () => {
    return (
        <>
        <View style={{position: 'absolute', paddingVertical: 10, zIndex: 50, top: 0, minHeight: 60, alignItems: 'center', alignSelf: 'flex-end', justifyContent: 'center', width: '50%', backgroundColor: colors.readioOrange,}}>
            <Text numberOfLines={4} style={{fontWeight: 'bold', color: colors.readioWhite}}>Hey, this feature is undergoing some big changes and will be back up soon!</Text>
        </View>
        </>
    )
}