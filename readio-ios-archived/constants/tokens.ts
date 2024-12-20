import { StyleSheet } from 'react-native';

const tintColorLight = '#DB581A';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

export const colors = {
	primary: '#fc3c44',
	background: '#000',
	text: '#000',
	textMuted: '#9ca3af',
	icon: "#2F2B2A",
	// maximumTrackTintColor: 'rgba(255,255,255,0.4)',
	minimumTrackTintColor: "#db581a",
	// minimumTrackTintColor: 'rgba(255,255,255,0.6)',
	maximumTrackTintColor: '#e9e0c1',
  // readioBrown: '#382A22',
  readioBrown: '#272121',
  readioWhite: '#E9E0C1',
  // readioWhite: '#F7F6F4',
  readioBlack: '#2F2B2A',
  readioOrange: '#DB581A',
}

export const readioRegularFont = "Montserrat-Regular"
export const readioBoldFont = "Montserrat-Bold"

export const fontSize = {
	xs: 12,
	sm: 16,
	base: 20,
	lg: 24,
}

export const buttonStyle = StyleSheet.create({
  mainButton: {
    backgroundColor: colors.readioOrange,
    borderRadius: 80,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#fff',
    width: '100%',
  },
  mainButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: readioBoldFont,
  }
})