import { colors } from "@/constants/tokens";
import React from 'react';
import { Dimensions, View } from "react-native";


export default function LotusPresenceIntro () {
  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={{height: screenHeight, backgroundColor: colors.readioOrange}}/>
  )
  
}