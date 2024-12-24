/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

import Colors from '@/constants/tokens';
import { useColorScheme } from './useColorScheme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
    props: { light?: string; dark?: string },
    colorName: keyof typeof Colors.light // Ensure colorName is a key of Colors.light
  ) {
    const theme = useColorScheme() ?? 'light';
    // const colorFromProps = props[theme];
//   
    // if (colorFromProps) {
    //   return colorFromProps;
    // } else {
    //   return Colors[theme][colorName as keyof typeof Colors[typeof theme]]; // Cast colorName to the appropriate type
    // }
  }

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

//   return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

//   return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}