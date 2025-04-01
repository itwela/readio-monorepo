import { colors } from "@/constants/tokens"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export const DismissModalSymbol = ({color} : {color: string} ) => {

    const { top } = useSafeAreaInsets()

    return (
        <View style={{
            position: 'absolute',
            top: top + 8,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            zIndex: 1000,
        }}>
            <View accessible={false} style={{
                width: 50,
                height: 8,
                borderRadius: 8,
                backgroundColor: color,
                opacity: 0.7

            }} />
        </View>
    )
}