import { colors } from '@/constants/tokens'
import { useEffect, useState } from 'react'
import { getColors } from 'react-native-image-colors'
import { IOSImageColors } from 'react-native-image-colors/build/types'

export const usePlayerBackground = (imageurl: string) => {
	const [imageColors, setImageColors] = useState<IOSImageColors | null>(null)

	useEffect(() => {
		getColors(imageurl, {
			fallback: colors.background,
			cache: true,
			key: imageurl,
		}).then((colors) => setImageColors(colors as IOSImageColors))
	}, [imageurl])

	return { imageColors }
}