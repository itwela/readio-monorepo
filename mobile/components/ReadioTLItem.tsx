import { TrackShortcutsMenu } from '@/components/ReadioTShortcutMenu'
import { StopPropagation } from '@/components/utils/StopPropagation'
import { unknownTrackImageUri } from '@/constants/images'
import { colors, fontSize } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { Readio } from '@/types/type'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { MenuView } from '@react-native-menu/menu'
import { StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import LoaderKit from 'react-native-loader-kit'
import { Track, useActiveTrack, useIsPlaying } from 'react-native-track-player'
import { useEffect, useState } from 'react'
import { match } from 'ts-pattern'
import { useUser } from '@clerk/clerk-expo'
import { fetchAPI } from '@/lib/fetch';
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import s3 from '@/helpers/s3Client';
import { useReadio } from '@/constants/readioContext'

export type TracksListItemProps = {
	track: Readio
	onTrackSelect: (track: Track) => void
}

export const TracksListItem = ({ track, onTrackSelect: handleTrackSelect }: TracksListItemProps) => {
	const { playing } = useIsPlaying()

	const isActiveTrack = useActiveTrack()?.url === track.url
	const activeTrack = useActiveTrack()

	const {readioSelectedReadioId, setReadioSelectedReadioId} = useReadio()
	const [selectedReadio, setSelectedReadio] = useState<Readio | undefined>()
	const [isFavorite, setIsFavorite] = useState<boolean | undefined>()
	const { user } = useUser()

	const toggleFavorite = async () => {
		let wantsToBeFavorite = null
	  
		if(isFavorite === true) {
			wantsToBeFavorite = false
		} 
	  
		if(isFavorite === false) {
			wantsToBeFavorite = true
		}
		
	  // starting client api call
		if (wantsToBeFavorite === true) {
		  console.log("fovoriting readio: ", wantsToBeFavorite)
		}
	  
		if (wantsToBeFavorite === false) {
		  console.log("unfovoriting readio: ", wantsToBeFavorite)
		}
	  
		console.log("username: ", user)
		const response = await fetchAPI(`/(api)/handleFavoriteSelection`, {
			method: "POST",
			headers: {
			  "Content-Type": "application/json"
			},
			body: JSON.stringify({
			  id: readioSelectedReadioId,  
			  clerkId: user?.id as string,
			  selection: wantsToBeFavorite
			}),
		  });
	  
		  // NOTE: this is the data from the resoponse variable
		  const data = await response;
		  console.log("data: ", data)
		  setIsFavorite(!isFavorite)
	  
	  }

	useEffect(() => {

		setIsFavorite(track?.favorited);
		console.log("foundReadio: ", track)
		console.log("isFavorite: ", isFavorite)

	}, [track, readioSelectedReadioId])

	const handlePressAction = (id: string) => {
		match(id)
			.with('add-to-favorites', async () => {
				toggleFavorite()
			})
			.with('remove-from-favorites', async () => {
				toggleFavorite()
			})
			.with('add-to-playlist', () => {
				console.log('add-to-playlist')
			})
			.with('remove-from-playlist', () => {
				console.log('remove-from-playlist')
			})
			.with('delete', () => {
				handleDeleteReadio(track.id as number)
			})

			.otherwise(() => console.warn(`Unknown menu action ${id}`))
	}

	useEffect(() => {
        if(activeTrack) {
            setIsFavorite?.(activeTrack?.favorited ?? false)
        }
    }, [activeTrack])

	const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
	const handleDeleteReadio = (id: number) => {
		const s3Key = `${id}.mp3`;  // Define the file path within the S3 bucket
		s3.deleteObject({
			Bucket: "readio-audio-files",  // Your S3 bucket name
			Key: s3Key,
		}, (err, data) => {

			if (err) {
				console.error(err);
			} else {

				console.log("S3 object deleted: ", s3Key);
				fetchAPI(`/(api)/del/deleteReadio`, {
					method: "POST",
					body: JSON.stringify({
						readioId: id,
						clerkId: user?.id
					}),
				});
				console.log("readio deleted")
				navigation.navigate("lib"); 

			}
		});
	}


	return (
		<TouchableHighlight style={{borderRadius: 5}} activeOpacity={0.95} onPress={() => handleTrackSelect(track)}>
			<View style={styles.trackItemContainer}>
				<View>
					<FastImage
						source={{
							uri: track.image ?? unknownTrackImageUri,
							priority: FastImage.priority.normal,
						}}
						style={{
							...styles.trackArtworkImage,
							opacity: isActiveTrack ? 0.6 : 1,
						}}
					/>

					{isActiveTrack &&
						(playing ? (
							<LoaderKit
								style={styles.trackPlayingIconIndicator}
								name="LineScaleParty"
								color={colors.icon}
							/>
						) : (
							<Ionicons
								style={styles.trackPausedIndicator}
								name="play"
								size={24}
								color={colors.icon}
							/>
						))}
				</View>

				<TouchableOpacity
					style={{
						flex: 1,
						flexDirection: 'row',
						justifyContent: 'space-between',
						height: 30,
					}}
					activeOpacity={0.95}
				>
					<View style={{
						flex: 1,
						flexDirection: 'column',
						justifyContent: 'center',
						height: 30,
					}}>
						<Text
							numberOfLines={1}
							style={{
								// ...styles.trackTitleText,
								color: isActiveTrack ? colors.primary : colors.text,
								fontSize: 15,
								fontWeight: '600',
							}}
						>
							{track.title}
						</Text>

						{track.artist && (
							<Text numberOfLines={1} style={styles.trackArtistText}>
								{track.artist}
							</Text>
						)}
					</View>

					{/* <TrackShortcutsMenu track={track} /> */}
					<MenuView
					onPressAction={({ nativeEvent: { event } }) => handlePressAction(event)}
					actions={[
						{
						id: isFavorite ? 'remove-from-favorites' : 'add-to-favorites',
						title: isFavorite ? 'Remove from favorites' : 'Add to favorites',
						image: isFavorite ? 'heart.fill' : 'heart',
						},
						{
							id: 'add-to-playlist',
							title: 'Add to playlist',
							image: 'plus',
						},
						{
							id: 'delete',
							title: 'Delete',
							image: 'trash',
						}	
					]}
					>
						<Text>...</Text>
					</MenuView>

					{/* <StopPropagation>
					</StopPropagation> */}
					
				</TouchableOpacity>
			</View>
		</TouchableHighlight>
	)
}

const styles = StyleSheet.create({
	trackItemContainer: {
		flexDirection: 'row',
		columnGap: 14,
		alignItems: 'center',
		paddingHorizontal: 6,
		paddingVertical: 6,
		backgroundColor: '#fff',
		borderRadius: 5,
	},
	trackPlayingIconIndicator: {
		position: 'absolute',
		top: 18,
		left: 16,
		width: 16,
		height: 16,
	},
	trackPausedIndicator: {
		position: 'absolute',
		top: 14,
		left: 14,
	},
	trackArtworkImage: {
		borderRadius: 8,
		width: 50,
		height: 50,
	},
	trackTitleText: {
		...defaultStyles.text,
		fontSize: fontSize.sm,
		fontWeight: '600',
		maxWidth: '90%',
	},
	trackArtistText: {
		...defaultStyles.text,
		color: colors.textMuted,
		fontSize: 14,
	},
})