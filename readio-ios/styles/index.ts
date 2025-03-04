import { colors, fontSize } from '@/constants/tokens'
import { StyleSheet } from 'react-native'
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';

export const defaultStyles = StyleSheet.create({
	container: {
		flex: 1,
		// backgroundColor: colors.background,
	},
	text: {
		fontSize: 20,
		// color: colors.text,
	},
})

export const utilsStyles = StyleSheet.create({
	centeredRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 25,
	},
	slider: {
		height: 7,
		borderRadius: 16,
	},
	itemSeparator: {
		borderColor: colors.textMuted,
		borderWidth: StyleSheet.hairlineWidth,
		opacity: 0.3,
	},
	emptyContentText: {
		...defaultStyles.text,
		color: colors.readioWhite,
		textAlign: 'center',
		marginTop: 20,
		fontFamily: readioRegularFont
	},
	emptyContentImage: {
		width: 200,
		height: 200,
		alignSelf: 'center',
		marginTop: 40,
		opacity: 0.3,
	},
	buttonContainer: {
		// backgroundColor: colors.readioOrange,
		// width: 200,
		// shadowColor: colors.readioOrange,
		borderRadius: 100,
		flex: 1,
		height: 48,
		alignItems: 'center',
		justifyContent: 'center',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		alignSelf: 'center'
	},
	buttonText: {
		// color: colors.readioWhite,
		fontSize: 16,
		fontFamily: readioBoldFont,
		letterSpacing: 0.3,
	}
})