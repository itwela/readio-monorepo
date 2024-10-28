import { TracksListItem } from '@/components/ReadioTLItem'
import { unknownTrackImageUri } from '@/constants/images'
import { useQueue } from '@/store/queue'
import { utilsStyles } from '@/styles'
import { QueueControls } from './QueueControls'
import FastImage from 'react-native-fast-image'
import { useRef } from 'react'
import { FlatList, FlatListProps, Text, View } from 'react-native'
import TrackPlayer, { Track } from 'react-native-track-player'
import { Readio } from '@/types/type'
import { Audio, AVPlaybackStatusSuccess } from 'expo-av';
import ReactNativeBlobUtil from 'react-native-blob-util'

export type TracksListProps = Partial<FlatListProps<Track>> & {
	id: string
	tracks: Track[]
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

	const handleTrackSelect = async (selectedTrack: Readio) => {
		

		const path = selectedTrack?.basepath
		const audioDirectory = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/audioFiles`;
		const filePath = `${audioDirectory}/tempAudio-${selectedTrack.title}-${selectedTrack.id}.mp3`;

		console.log("starting sound variable")

		const directoryExists = await ReactNativeBlobUtil.fs.exists(audioDirectory);
		if (!directoryExists) {
			await ReactNativeBlobUtil.fs.mkdir(audioDirectory);
		}
		await ReactNativeBlobUtil.fs.writeFile(filePath, selectedTrack.basepath, 'base64');
		const { sound } = await Audio.Sound.createAsync(
			{ uri: `file://${filePath}` },
			{ shouldPlay: true, progressUpdateIntervalMillis: 10 }
		);
		const waitForDiJustFinishedPlaying = (sound: Audio.Sound) =>
			new Promise(resolve => {
			  sound.setOnPlaybackStatusUpdate(
				(playbackStatus) => { // Keep the parameter type as is
				  const status = playbackStatus as AVPlaybackStatusSuccess; // Type assertion
				  if (status.didJustFinish) {
					resolve(null)
				  }
				},
			  )
		})
		console.log("starting waitForDiJustFinishedPlaying function")
		await waitForDiJustFinishedPlaying(sound)

		console.log("unlinking file")
		await ReactNativeBlobUtil.fs.unlink(filePath);
		// ReactNativeBlobUtil.fs.unlink(path)

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