import { filter, unknownTrackImageUri } from '@/constants/images'
import { colors, fontSize, readioBoldFont, readioRegularFont } from '@/constants/tokens'
import { setStateAsync } from '@/constants/utilityFunctions'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider'
import { useLotusUser } from '@/helpers/providers/lotusUserContext'
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext'
import { Playlist, PlaylistRelationship } from '@/helpers/types'
import { defaultStyles } from '@/styles'
import { LotusArticle } from '@/types/type'
import { Ionicons } from '@expo/vector-icons'
import { MenuView } from '@react-native-menu/menu'
import React, { useEffect, useState } from 'react'
import { Button, FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import LoaderKit from 'react-native-loader-kit'
import Animated from 'react-native-reanimated'
import { Track, useActiveTrack, useIsPlaying } from 'react-native-track-player'
import { match } from 'ts-pattern'
import LotusImageWithLoader from './LotusImageWithLoader'
import { Id } from '@/convex/_generated/dataModel'

export type TracksListItemProps = {
	track: LotusArticle
	isOnPlaylistRoute?: boolean
	onTrackSelect: (track: Track) => void
}

export const TracksListItem = ({ track, onTrackSelect: handleTrackSelect, isOnPlaylistRoute }: TracksListItemProps) => {
	
	// NOTE HOOKS
	const { playing } = useIsPlaying()
	const {lightFeedback, mediumFeedback, successFeedback} = useLotusHaptic();
	const activeTrack = useActiveTrack()
	const {currentRouteName} = useLotusUtils()
	const {articleSelectedId, setIsFavorite, setFeatureArticleName, setFeatureArticleImage, articleSelectedPlaylistId } = useLotusUtils()
	const { user, needsToRefresh, setNeedsToRefresh, handleDeleteArticle, removeFromPlaylistMutation } = useLotusUser()
	const isActiveTrack = useActiveTrack()?.url === track.url
	
	// NOTE: VARIABLES
	const AnimatedTouchableHighLight = Animated.createAnimatedComponent(TouchableHighlight)	
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [createPlaylistSelections, setCreatePlaylistSelections] = useState<{ id: string, name: string }[]>([]);
	
	// Content types that users cannot delete
	const nonDeletableContentTypes = ['music', 'audiobook', 'liner_notes', 'meditation_intro', 'meditation_music'];
	
	// Check if current user can delete this track
	const canDeleteTrack = () => {
		// Can't delete if it's a protected content type (audiobooks, music, liner notes, etc.)
		if (track.contentType && nonDeletableContentTypes.includes(track.contentType)) {
			return false;
		}
		
		// Can only delete if it's the user's own article
		if (track.user_db_id && user?.user_db_id) {
			const canDelete = track.user_db_id === user.user_db_id;
			// console.log(`User ownership check: ${canDelete} (track user: ${track.user_db_id}, current user: ${user.user_db_id})`);
			return canDelete;
		}
		
		// If no user_db_id on track, fallback to route-based logic for backward compatibility
		const nonDeletableRoutes = ['fithop', '(home)'];
		const routeAllowsDelete = !nonDeletableRoutes.includes(currentRouteName as string);
		// console.log(`Fallback route check: ${routeAllowsDelete} (current route: ${currentRouteName})`);
		return routeAllowsDelete;
	};

	// NOTE MUTATIONS
	const toggleFavoriteMutation = useMutation(api.articles.toggleArticleFavorite)
	const addToPlaylistMutation = useMutation(api.playlists.addToPlaylist)
	const autoRemoveFromBookmarkedPlaylistMutation = useMutation(api.playlists.autoRemoveFromBookmarkedPlaylist)
	const playlists = useQuery(api.playlists.getPlaylistsByUser, { 
		user_db_id: user?.user_db_id || '' 
	}) || []

	// Check if we're currently viewing the Continue Reading playlist
	const isOnContinueReadingPlaylist = currentRouteName === 'continue-reading';

	// NOTE FUNCTIONS
	const toggleFavorite = async () => {


		if (!track._id){
			// console.log('no track id')
			return
		}
		
		if (!user?.user_db_id) {
			// console.log('no user id')
			return
		}
		
		// console.log('toggleFavorite', track._id)

		try {
			const result = await toggleFavoriteMutation({
				articleId: track._id,
				favorited: !track.favorited
			})
			// console.log('result', result)
		} catch (error) {
			console.error("Failed to toggle favorite:", error)
		}
	}
	const handleAddToPlaylist = async () => {


		if (!user?.user_db_id){
			// console.log('no user or track id')
			return
		}

		if (!track._id){
			// console.log('no track id')
			return
		}

		try {
			// Add to each selected playlist
			for (const selection of createPlaylistSelections) {
				await addToPlaylistMutation({
					playlistId: selection.id as Id<"playlists">,
					articleId: track._id as Id<"articles">,
					userId: user.user_db_id
				})
			}
			
			// Success feedback
			successFeedback();
			
			// Clear selections and close modal
			setCreatePlaylistSelections([]);
			toggleModal();
			
			// console.log(`Successfully added "${track.title}" to ${createPlaylistSelections.length} playlist(s)`);
		} catch (error) {
			console.error("Failed to add to playlist:", error);
			// Keep modal open so user can try again
		}
	}
	// STUB: Update function name and implement with Convex mutations
	const removeLotusFromPlaylist = async (playlistId?: Id<"playlists">) => {
		if (!user?.user_db_id || !track._id) return;

		// If no specific playlist ID is provided, we can't remove from playlist
		// This might need to be context-specific depending on where this component is used
		if (!playlistId) {
			console.warn("No playlist ID provided for removing lotus from playlist");
			return;
		}

		try {
			await removeFromPlaylistMutation({
				playlistId: playlistId,
				articleId: track._id as Id<"articles">,
				userId: user.user_db_id
			});
			// console.log("Lotus successfully removed from playlist");
		} catch (error) {
			console.error("Error removing lotus from playlist:", error);
		}
	}
	// STUB: Remove from Continue Reading playlist
	const removeFromContinueReadingPlaylist = async () => {
		if (!user?.user_db_id || !track._id) return;

		try {
			await autoRemoveFromBookmarkedPlaylistMutation({
				user_db_id: user.user_db_id,
				articleId: track._id as Id<"articles">
			});
			successFeedback();
			console.log("Article successfully removed from Continue Reading playlist");
		} catch (error) {
			console.error("Error removing article from Continue Reading playlist:", error);
		}
	}
	const handlePressAction = (id: string, playlistName?: string, readioName?: string) => {

		match(id)
			.with('add-to-favorites', async () => {
				lightFeedback();
				toggleFavorite();
			})
			.with('remove-from-favorites', async () => {
				lightFeedback();
				toggleFavorite();
			})
			.with('add-to-playlist', () => {
				// Open modal for playlist selection - user will click Add button to execute handleAddToPlaylist
				toggleModal();
			})
			.with('remove-from-playlist', () => {
				lightFeedback();
				// Use the current playlist ID from utils context
				if (articleSelectedPlaylistId) {
					removeLotusFromPlaylist(articleSelectedPlaylistId.toString() as Id<"playlists">);
				}
			})
			.with('remove-from-continue-reading', () => {
				lightFeedback();
				removeFromContinueReadingPlaylist();
			})
			.with('delete',  async () => {
				mediumFeedback();
				handleDeleteArticle?.(track._id as Id<"articles">)
			})

			.otherwise(() => console.warn(`Unknown menu action ${id}`))
	}
	const toggleModal = () => {
		setIsModalVisible(!isModalVisible);
	};
	function toggleSelection(selectionId: string, selectionName: string) {
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
		{/* NOTE: TRACK ITEM */}
		<TouchableHighlight  style={{borderRadius: 5}} activeOpacity={0.95}>
			<TouchableOpacity activeOpacity={0.95} onPress={() => {}} style={[styles.trackItemContainer, {borderRadius: 10, backgroundColor: isActiveTrack ? colors.readioOrange : 'rgba(0, 0, 0, 0)'}]}>
				<View>
					
					<Pressable
					 onPress={() => {handleTrackSelect(track as any); mediumFeedback(); }}
					>

					<LotusImageWithLoader source={{uri: filter}} style={[styles.trackArtworkImage, {zIndex: 1, opacity: 0.4, position: 'absolute'}]} resizeMode='cover'/>
					<LotusImageWithLoader
						source={{
							uri: track.artwork ?? unknownTrackImageUri,
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

				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						justifyContent: 'space-between',
						height: 30,
					}}
				>
					<Pressable 
					onPress={() => {handleTrackSelect(track as any); mediumFeedback(); }}
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
								color: colors.readioWhite,
								fontSize: 15,
								fontWeight: '600',
								fontFamily: readioBoldFont
							}}
						>
							{track.title}
						</Text>

						{track.topic && (
							<Text  allowFontScaling={false} numberOfLines={1} style={styles.trackArtistText}>
								{track.topic}
							</Text>
						)}
					</Pressable>

					{/* <TrackShortcutsMenu track={track} /> */}
						<MenuView
						style={{}}
						onPressAction={({ nativeEvent: { event } }) => handlePressAction(event)}
						actions={[
							{
								id: track?.favorited ? 'remove-from-favorites' : 'add-to-favorites',
								title: track?.favorited ? 'Remove from favorites' : 'Add to favorites',
								image: track?.favorited ? 'heart.fill' : 'heart',
							},
							{
								id: 'add-to-playlist',
								title: 'Add to playlist',
								image: 'plus.circle'
							},
							...(isOnPlaylistRoute ? [{
								id: 'remove-from-playlist',
								title: 'Remove from playlist',
								image: 'minus.circle'
							}] : []),
							...(canDeleteTrack() ? [{
								id: 'delete',
								title: 'Delete',
								image: 'trash'
							}] : []),
							...(isOnContinueReadingPlaylist ? [{
								id: 'remove-from-continue-reading',
								title: 'Remove from Continue Reading',
								image: 'minus.circle'
							}] : [])
						]}
						>
							<View style={{width: 50, alignItems: 'center'}}>
								<Text  allowFontScaling={false} style={{color: colors.readioWhite, padding: 3}}>...</Text>
							</View>
						</MenuView>
					{/* <StopPropagation>
					</StopPropagation> */}
					
				</View>
			</TouchableOpacity>
		</TouchableHighlight>

		{/* NOTE: ADD TO PLAYLIST MODAL */}
		<Modal animationType="slide"  transparent={true}  visible={isModalVisible}  onRequestClose={toggleModal}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center',  alignItems: 'center',  padding: 20}}>
              <View style={{
                backgroundColor: colors.readioBrown,
                borderRadius: 20,
                padding: 24,
                width: '100%',
                maxWidth: 400,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 8,
              }}>
                
                {/* NOTE - Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
                  <Text allowFontScaling={false} style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: colors.readioWhite,
                    fontFamily: readioBoldFont
                  }}>
					Add to Playlist
				</Text>
                  
				  {/* CLOSE BUTTON */}
                  <Pressable 
                    onPress={toggleModal}
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center'
                    }}
                  >
                    <Text allowFontScaling={false} style={{
                      color: colors.readioWhite,
                      fontSize: 18,
                      fontWeight: 'bold'
                    }}>×</Text>
                  </Pressable>
                </View>

                {/* NOTE - Track Info */}
                <View style={{
                  flexDirection: 'row', alignItems: 'center',  backgroundColor: 'rgba(255, 255, 255, 0.05)',  borderRadius: 12, padding: 12,  marginBottom: 20
                }}>
                  <LotusImageWithLoader 
                    source={{ uri: track?.artwork ?? unknownTrackImageUri }}
                    style={{ width: 50, height: 50, borderRadius: 8,  marginRight: 12
                    }}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <Text allowFontScaling={false} numberOfLines={2} style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: colors.readioWhite,
                      fontFamily: readioBoldFont,
                      marginBottom: 4
                    }}>{track?.title}</Text>
                    <Text allowFontScaling={false} style={{
                      fontSize: 14,
                      color: colors.readioDustyWhite,
                      opacity: 0.8,
                      fontFamily: readioRegularFont
                    }}>{track?.topic}</Text>
                  </View>
                </View>

                {/* NOTE - Playlist Selection */}
                {playlists && playlists.length > 0 ? (
                  <>
                    <Text allowFontScaling={false} style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: colors.readioWhite,
                      fontFamily: readioBoldFont,
                      marginBottom: 16
                    }}>Choose Playlist(s):</Text>
                    
                    <FlatList
                      data={playlists}
                      style={{
                        maxHeight: 200,
                        marginBottom: 20
                      }}
                      showsVerticalScrollIndicator={false}
                      renderItem={({ item }) => {
                        const isSelected = createPlaylistSelections.some(selection => selection.id === item._id);
                        return (
                          <Pressable 
                            onPress={() => toggleSelection(item._id, item.name)} 
                            style={{
                              backgroundColor: isSelected ? colors.readioOrange : 'rgba(255, 255, 255, 0.05)',
                              borderRadius: 12,
                              padding: 16,
                              marginBottom: 8,
                              borderWidth: 1,
                              borderColor: isSelected ? colors.readioOrange : 'rgba(255, 255, 255, 0.1)',
                              flexDirection: 'row',
                              alignItems: 'center'
                            }}
                          >
                            <View style={{
                              width: 20,
                              height: 20,
                              borderRadius: 10,
                              borderWidth: 2,
                              borderColor: isSelected ? colors.readioWhite : colors.readioDustyWhite,
                              backgroundColor: isSelected ? colors.readioWhite : 'transparent',
                              marginRight: 12,
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}>
                              {isSelected && (
                                <View style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: colors.readioOrange
                                }} />
                              )}
                            </View>
                            
                            <Text allowFontScaling={false} numberOfLines={1} style={{
                              fontSize: 16,
                              color: isSelected ? colors.readioWhite : colors.readioDustyWhite,
                              fontWeight: isSelected ? 'bold' : 'normal',
                              fontFamily: isSelected ? readioBoldFont : readioRegularFont,
                              flex: 1
                            }}>{item?.name}</Text>
                          </Pressable>
                        );
                      }}
                      keyExtractor={(item) => item._id}
                    />
                  </>
                ) : (
                  <View style={{
                    padding: 20,
                    alignItems: 'center',
                    marginBottom: 20
                  }}>
                    <Text allowFontScaling={false} style={{
                      fontSize: 16,
                      color: colors.readioDustyWhite,
                      textAlign: 'center',
                      fontFamily: readioRegularFont,
                      opacity: 0.7
                    }}>No playlists found. Create a playlist first to add tracks.</Text>
                  </View>
                )}

                {/* NOTE - Action Buttons */}
                <View style={{
                  flexDirection: 'row',
                  gap: 12
                }}>
                  <Pressable 
                    onPress={toggleModal}
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <Text allowFontScaling={false} style={{
                      color: colors.readioWhite,
                      fontSize: 16,
                      fontWeight: '600',
                      fontFamily: readioBoldFont
                    }}>Cancel</Text>
                  </Pressable>
                  
                  <Pressable 
                    onPress={handleAddToPlaylist}
                    disabled={createPlaylistSelections.length === 0}
                    style={{
                      flex: 1,
                      backgroundColor: createPlaylistSelections.length > 0 ? colors.readioOrange : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center',
                      opacity: createPlaylistSelections.length > 0 ? 1 : 0.5
                    }}
                  >
                    <Text allowFontScaling={false} style={{
                      color: colors.readioWhite,
                      fontSize: 16,
                      fontWeight: 'bold',
                      fontFamily: readioBoldFont
                    }}>
                      Add {createPlaylistSelections.length > 0 ? `(${createPlaylistSelections.length})` : ''}
                    </Text>
                  </Pressable>
                </View>

              </View>
            </View>
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
