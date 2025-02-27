import React from "react";
import { View } from "react-native";

export default function LotusGap ({gapNumber, backgroundColor}: {gapNumber: number, backgroundColor: string}) {
    return (
        <>
        <View style={{ zIndex: -2, height: gapNumber, backgroundColor: backgroundColor }}/>
        </>
    )
}