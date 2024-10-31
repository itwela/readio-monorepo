import { TracksListItem } from '@/components/ReadioTLItem'
import { unknownTrackImageUri } from '@/constants/images'
import { useQueue } from '@/store/queue'
import { utilsStyles } from '@/styles'
import { QueueControls } from './QueueControls'
import FastImage from 'react-native-fast-image'
import { useRef } from 'react'
import { FlatList, FlatListProps, Text, View } from 'react-native'
import TrackPlayer, { RepeatMode, Track } from 'react-native-track-player'
import { Readio } from '@/types/type'
import { Audio, AVPlaybackStatusSuccess } from 'expo-av';
import ReactNativeBlobUtil from 'react-native-blob-util'

export type TracksListProps = Partial<FlatListProps<Track>> & {
	id: string
	tracks: Readio[]
	hideQueueControls?: boolean
}

const ItemDivider = () => (
	<View style={{ ...utilsStyles.itemSeparator, 
		marginVertical: 9, 
		// marginLeft: 60 
	}} />
)

export const ReadioTracksList = ({ id, tracks, hideQueueControls = false, ...flatlistProps }: TracksListProps) => {
	
    const queueOffset = useRef(0)
	const { activeQueueId, setActiveQueueId } = useQueue()

	const handleTrackSelect = async (selectedTrack: Track) => {
		console.log("id: ", id)
		const trackIndex = tracks.findIndex((track) => track.url === selectedTrack.url)
		console.log('selectedTrack', selectedTrack)
		
		if (trackIndex === -1) return

		const isChangingQueue = id !== activeQueueId

		if (isChangingQueue) {
			const beforeTracks = tracks.slice(0, trackIndex)
			const afterTracks = tracks.slice(trackIndex + 1)

			await TrackPlayer.reset()

			// we construct the new queue
			await TrackPlayer.add(selectedTrack)
			await TrackPlayer.add(afterTracks)
			await TrackPlayer.add(beforeTracks)

			await TrackPlayer.play()
			await TrackPlayer.setRepeatMode(RepeatMode.Off)

			queueOffset.current = trackIndex
			setActiveQueueId(id)
		} else {
			const nextTrackIndex =
				trackIndex - queueOffset.current < 0
					? tracks.length + trackIndex - queueOffset.current
					: trackIndex - queueOffset.current

			await TrackPlayer.skip(nextTrackIndex)
			await TrackPlayer.play()
		}
	}

	return (
		
		<>
		<FlatList
			data={tracks}
			contentContainerStyle={{ paddingTop: 10, paddingBottom: 128 }}
			ListHeaderComponent={
				!hideQueueControls ? (
					<QueueControls tracks={tracks} style={{ paddingBottom: 20 }} />
				) : undefined
			}
			ListFooterComponent={ItemDivider}
			ItemSeparatorComponent={ItemDivider}
			ListEmptyComponent={
				<View >
					<Text style={utilsStyles.emptyContentText}>No songs found</Text>

					{/* <FastImage
						source={{ uri: unknownTrackImageUri, priority: FastImage.priority.normal }}
						style={utilsStyles.emptyContentImage}
					/> */}
				</View>
			}
			renderItem={({ item: track }) => (
				<TracksListItem track={track} onTrackSelect={handleTrackSelect} />
			)}
			{...flatlistProps}
		/>
        
		</>
	)
}