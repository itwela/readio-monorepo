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
})