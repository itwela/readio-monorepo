import { filter, unknownTrackImageUri } from '@/constants/images'
import { colors, fontSize } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { Readio } from '@/types/type'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { MenuView } from '@react-native-menu/menu'
import { StyleSheet, Text, TouchableHighlight, TouchableOpacity, View, Modal, SafeAreaView, Button, FlatList, Pressable } from 'react-native'
import FastImage from 'react-native-fast-image'
import LoaderKit from 'react-native-loader-kit'
import { Track, useActiveTrack, useIsPlaying } from 'react-native-track-player'
import { useEffect, useState } from 'react'
import { match } from 'ts-pattern'
import { fetchAPI } from '@/lib/fetch';
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import { s3 } from '@/helpers/s3Client';
import { useReadio } from '@/constants/readioContext'
import InputField from './inputField'
import { Playlist, PlaylistRelationship } from '@/helpers/types'
import { retryWithBackoff } from "@/helpers/retryWithBackoff";
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import sql from "@/helpers/neonClient";
import  createAnimatedComponent, { Easing, FadeIn, FadeOut, FadeOutDown }  from 'react-native-reanimated'
import { FadeInDown, FadeInUp } from 'react-native-reanimated'
import Animated from 'react-native-reanimated'
import { useLastActiveTrack } from './useLastActiveTrack'

export type TracksListItemProps = {
	track: Readio
	onTrackSelect: (track: Track) => void
}

export const TracksListItem = ({ track, onTrackSelect: handleTrackSelect }: TracksListItemProps) => {
	const { playing } = useIsPlaying()
	const AnimatedTouchableHighLight = Animated.createAnimatedComponent(TouchableHighlight)

	const isActiveTrack = useActiveTrack()?.url === track.url
	
	const activeTrack = useActiveTrack()
	const lastActiveTrack = useLastActiveTrack();

	const {readioSelectedReadioId, setReadioSelectedReadioId} = useReadio()
	// const {readioSelectedPlaylistId, setReadioSelectedPlaylistId} = useReadio()
	// const [selectedReadio, setSelectedReadio] = useState<Readio>()
	const { isFavorite, setIsFavorite} = useReadio()
	const { user } = useReadio()
	const [playlists, setPlaylists] = useState<{ data: Playlist[] }>({ data: [] })
	const [playlistRelationships, setPlaylistRelationships] = useState<{ data: PlaylistRelationship[] }>({ data: [] })
	const {wantsToUpdateFavoriteStatus, setWantsToUpdateFavoriteStatus, needsToRefresh, setNeedsToRefresh} = useReadio()
  
	const toggleFavorite = async () => {
		let wantsToBeFavorite = null
		
		if(isFavorite === true) {
		  setWantsToUpdateFavoriteStatus?.(true)
		  wantsToBeFavorite = false
		  setIsFavorite?.(false)
		} 
		
		if(isFavorite === false) {
		  setWantsToUpdateFavoriteStatus?.(true)
		  wantsToBeFavorite = true
		  setIsFavorite?.(true)
		}   
		
	}

	useEffect(() => {
		let isMounted = true; // Flag to track whether the component is still mounted

		if (wantsToUpdateFavoriteStatus === true) {
		  const updateFavorite = async () => {
			const response = await sql`
			  UPDATE readios
			  SET favorited = ${isFavorite}
			  WHERE id = ${readioSelectedReadioId} AND clerk_id = ${user?.clerk_id}
			  RETURNING *;
			`;
		  }
		  updateFavorite();
		}
	
		setWantsToUpdateFavoriteStatus?.(false)
		console.log("updated favorite status")

		return () => {
			isMounted = false; // Set the flag to false when the component unmounts
		};
		
	}, [isFavorite, wantsToUpdateFavoriteStatus, readioSelectedReadioId, user?.clerk_id])
	

	const handleAddToPlaylist = async () => {

		// retryWithBackoff(async () => {


		// const response = await fetchAPI(`/(api)/addReadioToPlaylist`, {
		// 	method: "POST",
		// 	headers: {
		// 	  "Content-Type": "application/json"
		// 	},
		// 	body: JSON.stringify({
		// 	  readioId: track.id as number,  
		// 	  readioName: track.title,
		// 	  playlistInfo: createPlaylistSelections,
		// 	  clerkId: user?.id as string
		// 	}),
		//   });

		// }, 3, 1000)


		  console.log("added to playlist")
		  toggleModal()
	}

	const removeReadioFromPlaylist = async () => {

		// retryWithBackoff(async () => {


		// const response = await fetchAPI(`/(api)/removeReadioFromPlaylist`, {
		// 	method: "POST",
		// 	headers: {
		// 	  "Content-Type": "application/json"
		// 	},
		// 	body: JSON.stringify({
		// 	  readioId: track.id as number,  
		// 	  clerkId: user?.id as string
		// 	}),
		//   });

		// }, 3, 1000)


		  console.log("removed from playlist")
	}

	const handlePressAction = (id: string, playlistName?: string, readioName?: string) => {
		match(id)
			.with('add-to-favorites', async () => {
				toggleFavorite()
			})
			.with('remove-from-favorites', async () => {
				toggleFavorite()
			})
			.with('add-to-playlist', () => {
				toggleModal()
			})
			.with('remove-from-playlist', () => {
				removeReadioFromPlaylist()
				console.log('remove-from-playlist')

			})
			.with('delete', () => {
				handleDeleteReadio(track.id as number)
			})

			.otherwise(() => console.warn(`Unknown menu action ${id}`))
	}

	useEffect(() => {
		let isMounted = true; // Flag to track whether the component is still mounted

        if(activeTrack) {
            setIsFavorite?.(activeTrack?.favorited ?? false)
        }

		return () => {
			isMounted = false; // Set the flag to false when the component unmounts
		};
    }, [activeTrack])

	const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
	const handleDeleteReadio = async (id: number) => {
		const s3Key = `${id}.mp3`;  
		s3.deleteObject({
			Bucket: "readio-audio-files",  // Your S3 bucket name
			Key: s3Key,
		}, (err, data) => {

			if (err) {
				console.error(err);
			} else {

				console.log("S3 object deleted: ", s3Key);

			// 	retryWithBackoff(async () => {


			// 	fetchAPI(`/(api)/del/deleteReadio`, {
			// 		method: "POST",
			// 		body: JSON.stringify({
			// 			readioId: id,
			// 			clerkId: user?.id
			// 		}),
			// 	});

			// }, 3, 1000)

				console.log("readio deleted")
				navigation.navigate("lib"); 

			}
		});
		try {
			await sql`
			DELETE FROM readios WHERE id = ${id}
			`.then(() => {
				setNeedsToRefresh?.(true)
				setTimeout(() => {
					setNeedsToRefresh?.(true)
				}, 1000)
				console.log('Record deleted successfully');
			}).catch((error) => {
				console.error('Error deleting record:', error);
			});

			console.log('success')
		} catch (error) {
			console.log('fail')
		}
	}

	const [isModalVisible, setIsModalVisible] = useState(false);
	const toggleModal = () => {
		setIsModalVisible(!isModalVisible);
	};

	const [form, setForm] = useState({
		title: '',
	})

	const [createPlaylistSelections, setCreatePlaylistSelections] = useState<{ id: number, name: string }[]>([]);
	function toggleSelection(selectionId: number, selectionName: string) {
		// Check if the item with this id is already in the selections
		const isSelected = createPlaylistSelections.some(item => item.id === selectionId);
		
		if (isSelected) {
		  // Remove the item if it exists
		  setCreatePlaylistSelections(createPlaylistSelections.filter(item => item.id !== selectionId));
		} else {
		  // Add the item if it does not exist
		  setCreatePlaylistSelections([...createPlaylistSelections, { id: selectionId, name: selectionName }]);
		}
	}




	return (
		<>
		<TouchableHighlight  style={{borderRadius: 5}} activeOpacity={0.95}>
			<TouchableOpacity activeOpacity={0.95} onPress={() => {}} style={styles.trackItemContainer}>
				<View>
					
					<Pressable
					 onPress={() => handleTrackSelect(track)}
					>

					<FastImage source={{uri: filter}} style={[styles.trackArtworkImage, {zIndex: 1, opacity: 0.4, position: 'absolute'}]} resizeMode='cover'/>
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

					</Pressable>

					{isActiveTrack &&
						(playing ? (
							//NOTE animated icon
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
					<Pressable 
					onPress={() => handleTrackSelect(track)}
					style={{
						flex: 1,
						flexDirection: 'column',
						justifyContent: 'center',
						height: 30,
					}}>
						<Text
						 allowFontScaling={false}
							numberOfLines={1}
							style={{
								// ...styles.trackTitleText,
								color: isActiveTrack ? colors.readioOrange : colors.readioWhite,
								fontSize: 15,
								fontWeight: '600',
								fontFamily: readioBoldFont
							}}
						>
							{track.title}
						</Text>

						{track.artist && (
							<Text  allowFontScaling={false} numberOfLines={1} style={styles.trackArtistText}>
								{track.artist}
							</Text>
						)}
					</Pressable>

					{/* <TrackShortcutsMenu track={track} /> */}
						<MenuView
						style={{}}
						onPressAction={({ nativeEvent: { event } }) => handlePressAction(event)}
						actions={[
							{
							id: isFavorite ? 'remove-from-favorites' : 'add-to-favorites',
							title: isFavorite ? 'Remove from favorites' : 'Add to favorites',
							image: isFavorite ? 'heart.fill' : 'heart',
							},
							{
								id: 'delete',
								title: 'Delete',
								image: 'trash',
							}	
						]}
						>
							<View style={{width: 50, alignItems: 'center'}}>
								<Text  allowFontScaling={false} style={{color: colors.readioWhite, padding: 3}}>...</Text>
							</View>
						</MenuView>
					{/* <StopPropagation>
					</StopPropagation> */}
					
				</TouchableOpacity>
			</TouchableOpacity>
		</TouchableHighlight>

		<Modal
            animationType="slide" 
            transparent={true} 
            visible={isModalVisible}
            onRequestClose={toggleModal}
          >
            <SafeAreaView style={{height: '100%'}}>
              <View style={{padding: 20, backgroundColor: '#fff', width: '100%', display: 'flex', flexDirection: 'column', height: '100%'}}>
                
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <Button title="Close" color="#fc3c44" onPress={toggleModal} />
                </View>
        
				<View style={{display:'flex', flexDirection: 'row', width: '100%'}}>
					<Text  allowFontScaling={false} style={{}}>Adding to Playlist:</Text>
				</View>
				<View style={{display:'flex', flexDirection: 'column', width: '100%', maxHeight: 'auto'}}>
					<Text  allowFontScaling={false} numberOfLines={2} style={{fontSize: 46, fontWeight: 'bold'}}>{track?.title}</Text>
					{playlists?.data && playlists?.data.length > 0 && (
							<>

							<Text  allowFontScaling={false} style={{fontSize: 16, marginVertical: 10, fontWeight: 'bold'}}>Choose Playlist(s) to add to:</Text>
							<FlatList
								data={playlists?.data}
								renderItem={({ item }) =>

								<TouchableOpacity onPress={() => toggleSelection(item.id ? item.id : -1, item.name ? item.name : '')} activeOpacity={0.9} style={{ backgroundColor: createPlaylistSelections.some(selection => selection.id === item.id) ? '#fc3c44' : 'transparent', display: 'flex', flexDirection: 'row', alignItems: 'center', height: 40, borderRadius: 5, marginVertical: 3}}>
									{/* <FastImage source={{uri: item?.image ? item.image : unknownTrackImageUri}} style={{width: 40, height: 40, borderRadius: 5, marginRight: 10}} /> */}
									<Text  allowFontScaling={false} numberOfLines={1} style={{fontSize: 16, maxHeight: 20, marginHorizontal: 10, color: createPlaylistSelections.some(selection => selection.id === item.id) ? '#fff' : 'black', fontWeight: createPlaylistSelections.some(selection => selection.id === item.id) ? 'bold' : 'normal'}}>{item?.name}</Text>
								</TouchableOpacity>}
								// keyExtractor={(item) => item?.id ? item.id.toString() : ''}
							/>
						</>
					)}
					<Text  allowFontScaling={false} style={{color: '#fc3c44', marginTop: 10}} onPress={handleAddToPlaylist}>Add to Playlist</Text>
				</View>

              </View>

            </SafeAreaView>
        </Modal>
		</>
	)
}

const styles = StyleSheet.create({
	trackItemContainer: {
		flexDirection: 'row',
		columnGap: 14,
		alignItems: 'center',
		paddingHorizontal: 6,
		paddingVertical: 6,
		backgroundColor: 'transparent',
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
		color: colors.readioWhite,
		fontSize: 14,
		fontFamily: readioRegularFont
	},
	heading: {
		fontSize: 60,
		fontWeight: 'bold',
	  },

})