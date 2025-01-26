import { TracksListItem } from '@/components/ReadioTLItem'
import { unknownTrackImageUri } from '@/constants/images'
import { useQueue } from '@/store/queue'
import { utilsStyles } from '@/styles'
import { QueueControls } from './QueueControls'
import FastImage from 'react-native-fast-image'
import { useRef } from 'react'
import { FlatList, FlatListProps, Text, View } from 'react-native'
import TrackPlayer, { isPlaying } from 'react-native-track-player'
import { Readio } from '@/types/type'
import { Track , RepeatMode } from 'react-native-track-player'
import { AddTrack } from 'react-native-track-player'
import { setQueue } from 'react-native-track-player/lib/src/trackPlayer'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useReadio } from '@/constants/readioContext'
import { Asset } from 'expo-asset';

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
	const { user, modalMessage, setModalMessage, modalVisible, setModalVisible } = useReadio()


	const handleTrackSelect = async (selectedTrack: Track) => {
		
		if ((await TrackPlayer.getQueue()).length === 0) {
			setQueue(tracks)
		}

		isPlaying

		console.log("id: ", id)
		const trackIndex = tracks?.findIndex((track) => track.url === selectedTrack.url)
		console.log('trackIndex', tracks?.find((track) => track.url === selectedTrack.url))
		
		if (trackIndex === -1) {
			console.log("trackIndex: ", trackIndex)
			return
		} 

		if (selectedTrack?.url === null) {
			console.log("selectedTrack: ", selectedTrack)
			return
		}

		const isChangingQueue = id !== activeQueueId

		if (isChangingQueue) {
			const beforeTracks = tracks.slice(0, trackIndex)
			const afterTracks = tracks.slice(trackIndex + 1)

			await TrackPlayer.reset()

			// we construct the new queue
			await TrackPlayer.add(selectedTrack as Track)
			await TrackPlayer.add(afterTracks)
			await TrackPlayer.add(beforeTracks)

			await TrackPlayer.play()
			await TrackPlayer.setRepeatMode(RepeatMode.Off)

			queueOffset.current = trackIndex
			setActiveQueueId(id)

			console.log("activeQueueId: ", activeQueueId)
		} 
		
		else {
			const nextTrackIndex = trackIndex - queueOffset.current < 0 ? tracks.length + trackIndex - queueOffset.current : trackIndex - queueOffset.current
			await TrackPlayer.skip(nextTrackIndex)
			await TrackPlayer.play()
			console.log("activeQueueId: ", activeQueueId)
		}

	}



	return (
		
		<>
		<FlatList 
			data={tracks} contentContainerStyle={{ paddingTop: 10, paddingBottom: 128 }}
			ListHeaderComponent={ !hideQueueControls ? ( 
			<>
				<QueueControls tracks={tracks} style={{ paddingBottom: 20 }} />
			</>
		) : undefined }
			ListFooterComponent={ItemDivider}
			ItemSeparatorComponent={ItemDivider}
			ListEmptyComponent={ 
			<>
			<View > 
				<View style={{height: 10}}/>
				<View style={{height: 30}}>
					<FastImage source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))} style={{width: 100, height: 100, opacity: 0.5, position: 'absolute', top: '-100%', alignSelf: 'center', backgroundColor: "transparent"}} resizeMode='cover' />
				</View>
				<Text  allowFontScaling={false} style={[utilsStyles.emptyContentText, {opacity: 0.5}]}>No articles found. Try searching something else.</Text> 
			</View> 
			</>
			}
			renderItem={({ item: track, index }) => (
				<>
			<Animated.View  entering={FadeIn.duration(300 + (index * 100))} exiting={FadeOut.duration(300 + (index * 100))} >
				<TracksListItem  track={track} onTrackSelect={() => handleTrackSelect(track)} /> 
			</Animated.View>
				</>
		    )}
			{...flatlistProps}
		/>
        
		</>
	)

	// return (
	// 	<>
	// 	<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
	// 		<Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>ReadioTracksList</Text>
	// 	</View>
	// 	</>
	// )
}