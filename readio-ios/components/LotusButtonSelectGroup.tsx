import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, readioBoldFont } from '@/constants/tokens';

interface LotusButtonSelectGroupProps {
  buttons: string[];
  activeButton: string;
  onButtonPress: (buttonName: string) => void;
  containerStyle?: object;
  paddingBottom?: number;
}

export const LotusButtonSelectGroup: React.FC<LotusButtonSelectGroupProps> = ({
  buttons,
  activeButton,
  onButtonPress,
  containerStyle,
  paddingBottom = 10,
}) => {
  return (
    <View style={[styles.container, containerStyle, {paddingBottom}]}>
      {buttons.map((buttonName) => (
        <TouchableOpacity
          key={buttonName}
          style={[
            styles.button,
            activeButton === buttonName && styles.activeButton,
          ]}
          onPress={() => onButtonPress(buttonName)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              activeButton === buttonName && styles.activeButtonText,
            ]}
          >
            {buttonName}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.readioBrown,
    borderWidth: 1,
    borderColor: colors.readioWhite,
  },
  activeButton: {
    backgroundColor: colors.readioOrange,
    borderColor: colors.readioOrange,
  },
  buttonText: {
    color: colors.readioWhite,
    fontSize: 14,
    fontFamily: readioBoldFont,
  },
  activeButtonText: {
    color: colors.readioWhite,
  },
});