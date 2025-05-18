import React from 'react';
import { View } from 'react-native';
import { colors } from '@/constants/tokens';
import { useLotusNotifications } from '@/helpers/providers/LotusNotificationProvider';
import { Pressable } from 'react-native-gesture-handler';

interface StepsContainerProps {
  children: React.ReactNode;
}

export const LotusStepsContainer: React.FC<StepsContainerProps> = ({ children }) => {
  const { scheduleNotification } = useLotusNotifications();

  const testNotification = async () => {
    // console.log("test notification");
    await scheduleNotification(
      'trigger.title',
      'trigger.body',
      null,
      { type: 'stepMilestone' }, // Data object
      'Flute-Chime-Kgas.mp3' // Sound file name as the 5th argument
    );
  };
  
  return (
    <Pressable 
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
      // onPress={() => testNotification()}
    >
      {children}
    </Pressable>
  );

};
