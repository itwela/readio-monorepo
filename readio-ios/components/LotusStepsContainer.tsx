import React from 'react';
import { View } from 'react-native';
import { colors } from '@/constants/tokens';

interface StepsContainerProps {
  children: React.ReactNode;
}

export const LotusStepsContainer: React.FC<StepsContainerProps> = ({ children }) => {
  return (
    <View 
      style={{ 
        alignItems: 'center', 
        justifyContent: 'center', 
        display: 'flex', 
        flexDirection: "column", 
        backgroundColor: colors.readioBlack, 
        borderRadius: 10, 
        width: '45%', 
        height: 120, 
        gap: 6.18 
      }}
    >
      {children}
    </View>
  );
};
