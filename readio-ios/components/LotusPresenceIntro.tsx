import { colors } from "@/constants/tokens";
import React from 'react';
import { Dimensions, View } from "react-native";
import { IconSymbol } from "./ui/IconSymbol";


export default function LotusPresenceIntro () {
  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={{height: screenHeight, backgroundColor: "transparent"}}>
      {/* <IconSymbol name="apple.meditate" color={colors.readioWhite}/>
      <IconSymbol name="apple.meditate.circle" color={colors.readioWhite}/>
      <IconSymbol name="apple.meditate.square.stack" color={colors.readioWhite}/> */}
      </View>
  )
  
}