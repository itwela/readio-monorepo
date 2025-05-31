import { TracksListItem } from '@/components/ReadioTLItem'
import { croplogowhite, unknownTrackImageUri } from '@/constants/images'
import { useQueue } from '@/store/queue'
import { utilsStyles } from '@/styles'
import { QueueControls } from './QueueControls'
import { useRef } from 'react'
import { FlatList, FlatListProps, Image, Text, View } from 'react-native'
import TrackPlayer, { isPlaying } from 'react-native-track-player'
import { LotusTrack, ContentType } from '@/types/type'
import { Track, RepeatMode } from 'react-native-track-player'
import { AddTrack } from 'react-native-track-player'
import { setQueue } from 'react-native-track-player/lib/src/trackPlayer'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useLotusUser } from '@/helpers/providers/lotusUserContext'
import { Asset } from 'expo-asset';
import React from 'react'
import { getLocalImageUri, ImageAssets } from '@/constants/imageAssets'
import LotusImageWithLoader from './LotusImageWithLoader'

export type TracksListProps = Partial<FlatListProps<LotusTrack>> & {
	id: string
	tracks: LotusTrack[]
	hideQueueControls?: boolean
	isOnPlaylistRoute?: boolean
}

const ItemDivider = () => (
	<View style={{ ...utilsStyles.itemSeparator, 
		marginVertical: 9, 
		// marginLeft: 60 
	}} />
)

export const ReadioTracksList = ({ id, tracks, hideQueueControls = false, isOnPlaylistRoute = false, ...flatlistProps }: TracksListProps) => {
	
    const queueOffset = useRef(0)
	const { activeQueueId, setActiveQueueId } = useQueue()

	const handleTrackSelect = async (selectedTrack: LotusTrack) => {
		try {
			// TODO Validate the selected track
			if (!selectedTrack) {
				console.warn('Invalid track selected');
				return;
			}

			// TODO Check if track has required properties
			if (!selectedTrack.url) {
				console.warn('Track is missing URL:', selectedTrack.title);
				return;
			}

			// TODO Check if we have valid tracks array
			if (!Array.isArray(tracks) || tracks.length === 0) {
				console.warn('No tracks available in the queue');
				return;
			}

			// TODO Initialize queue if empty
			const currentQueue = await TrackPlayer.getQueue();
			if (currentQueue.length === 0) {
				await setQueue(tracks.filter(track => track.url)); // Only add tracks with valid URLs
			}

			await isPlaying();

			const trackIndex = tracks?.findIndex((track) => track?.url === selectedTrack.url);
			
			if (trackIndex === -1) {
				console.warn('Track not found in current queue:', selectedTrack.title);
				return;
			}

			const isChangingQueue = id !== activeQueueId;

			if (isChangingQueue) {
				try {
					const beforeTracks = tracks.slice(0, trackIndex).filter(track => track.url);
					const afterTracks = tracks.slice(trackIndex + 1).filter(track => track.url);

					await TrackPlayer.reset();

					// Construct the new queue with error handling
					const queueOperations = [];
					if (selectedTrack.url) queueOperations.push(TrackPlayer.add(selectedTrack));
					if (afterTracks.length > 0) queueOperations.push(TrackPlayer.add(afterTracks));
					if (beforeTracks.length > 0) queueOperations.push(TrackPlayer.add(beforeTracks));

					await Promise.all(queueOperations);
					await TrackPlayer.play();
					await TrackPlayer.setRepeatMode(RepeatMode.Off);

					queueOffset.current = trackIndex;
					setActiveQueueId(id);
				} catch (error) {
					console.error('Error while changing queue:', error);
				}
			} else {
				try {
					const nextTrackIndex = trackIndex - queueOffset.current < 0 
						? tracks.length + trackIndex - queueOffset.current 
						: trackIndex - queueOffset.current;
					
					await TrackPlayer.skip(nextTrackIndex);
					await TrackPlayer.play();
				} catch (error) {
					console.error('Error while playing track:', error);
				}
			}
		} catch (error) {
			console.error('Error in handleTrackSelect:', error);
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
				<LotusImageWithLoader 
                  source={ImageAssets.whiteLogo} 
                  style={[{ width: 50, height: 50, alignSelf: 'center' }]} 
                  resizeMode='contain' 
                />
				</View>
				<Text  allowFontScaling={false} style={[utilsStyles.emptyContentText, {opacity: 0.5}]}>No articles found. Try searching something else.</Text> 
			</View> 
			</>
			}
			renderItem={({ item: track, index }) => (
				<>
			<Animated.View  entering={FadeIn.duration(300 + (index * 100))} exiting={FadeOut.duration(300 + (index * 100))} >
				<TracksListItem isOnPlaylistRoute={isOnPlaylistRoute} track={track} onTrackSelect={() => handleTrackSelect(track)} />
			</Animated.View>
				</>
		    )}
			{...flatlistProps}
		/>
        
		</>
	)

}
