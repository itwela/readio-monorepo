import { useCallback, useEffect, useState } from 'react'
import TrackPlayer, { RepeatMode } from 'react-native-track-player'

export const useTrackPlayerRepeatMode = () => {
	const [repeatMode, setRepeatMode] = useState<RepeatMode>()

	const changeRepeatMode = useCallback(async (repeatMode: RepeatMode) => {
		await TrackPlayer.setRepeatMode(repeatMode)
		setRepeatMode(repeatMode)
	}, [])

	useEffect(() => {
		TrackPlayer.getRepeatMode().then(repeatMode => {
			if (repeatMode === undefined) {
				setRepeatMode(repeatMode)
			} else {
				setRepeatMode(0)
			}
		})
	}, [])

	return { repeatMode, changeRepeatMode }
}