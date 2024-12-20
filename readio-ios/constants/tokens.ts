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

export const utilStyle = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeAreaContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: "transparent"
  },
  padding: {
    padding: 20
  },
  text: {
    fontSize: 60,
    fontWeight: 'bold',
    fontFamily: readioBoldFont
  },
  option: {
    fontSize: 20,
    paddingVertical: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: readioBoldFont,
    color: colors.readioWhite
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: readioBoldFont,
    color: colors.readioWhite
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  selectionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: readioBoldFont
  },
  button: {
      width: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignContent: 'center', 
      alignItems: 'center', 
      backgroundColor: colors.readioOrange, 
      borderRadius: 80, 
      padding: 8,
      marginVertical: 10,
},
})
