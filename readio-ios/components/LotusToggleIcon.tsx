import React from 'react';
import { Pressable, Text, View, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/constants/tokens';
import { IconProps } from '@expo/vector-icons/build/createIconSet';

interface LotusToggleProps {
  isEnabled: boolean;
  enabledIcon: any;
  enabledText?: string;
  disabledIcon: any;
  disabledText?: string;
}

const LotusToggleIcon: React.FC<LotusToggleProps> = ({ isEnabled, enabledIcon, disabledIcon }) => {
  return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.readioBlack,
          borderRadius: 20,
          padding: 4,
          width: 100,
          height: 36,
          position: 'relative',
        }}
      >
        <View
          style={{
            position: 'absolute',
            backgroundColor: colors.readioOrange,
            width: '55%',
            height: '100%',
            borderRadius: 16,
            left: isEnabled ? '50%' : 0,
          }}
        />
        <MaterialCommunityIcons
        //   name={"bell-o"}
          name={disabledIcon}
          size={20}
          color={!isEnabled ? colors.readioDustyWhite : 'rgba(255,255,255,0.5)'}
          style={{ flex: 1, textAlign: 'center' }}
        />
        <MaterialCommunityIcons
          name={enabledIcon}
          size={20}
          color={isEnabled ? colors.readioDustyWhite : 'rgba(255,255,255,0.5)'}
          style={{ flex: 1, textAlign: 'center' }}
        />
      </View>
  );
};

export default LotusToggleIcon;