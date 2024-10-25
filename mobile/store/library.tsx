// Import necessary dependencies and types
import library from '@/assets/data/library.json'
import { unknownTrackImageUri } from '@/constants/images'
import { Artist, Playlist, TrackWithPlaylist } from '@/helpers/types'
import { Track } from 'react-native-track-player'
import { create } from 'zustand'
import { useUser } from '@clerk/clerk-expo'
import { fetchAPI } from '@/lib/fetch'
import { useEffect, useState } from 'react'
import { Readio } from '@/types/type'


// Define the structure of our library state
interface LibraryState {
	tracks: TrackWithPlaylist[]
	toggleTrackFavorite: (track: Track) => void
	addToPlaylist: (track: Track, playlistName: string) => void
}

// Create a Zustand store for managing library state
export const useLibraryStore = create<LibraryState>()((set: any) => ({
	// Initialize tracks with data from library.json
	tracks: library,

	// Function to toggle a track's favorite status
	toggleTrackFavorite: (track) => set((state: any) => ({
			tracks: state.tracks.map((currentTrack: any) => {
				if (currentTrack.url === track.url) {
					// If the track matches, toggle its rating between 0 and 1
					return {
						...currentTrack,
						rating: currentTrack.rating === 1 ? 0 : 1,
					}
				}
				return currentTrack
			}),
	})),

	// Function to add a track to a playlist
	addToPlaylist: (track, playlistName) =>
		set((state: any) => ({
			tracks: state.tracks.map((currentTrack: any) => {
				if (currentTrack.url === track.url) {
					// If the track matches, add the playlist name to its playlist array
					return {
						...currentTrack,
						playlist: [...(currentTrack.playlist ?? []), playlistName],
					}
				}
				return currentTrack
			}),
		})),
}))

// Hook to get all tracks
export const useTracks = () => useLibraryStore((state: any) => state.tracks)

// Hook to get favorite tracks and the function to toggle favorites
export const useFavorites = () => {
	const favorites = useLibraryStore((state) => state.tracks.filter((track) => track.rating === 1))
	const toggleTrackFavorite = useLibraryStore((state) => state.toggleTrackFavorite)

	return {
		favorites,
		toggleTrackFavorite,
	}
}

// Hook to get all artists and their tracks
export const useArtists = () =>
	useLibraryStore((state) => {
		return state.tracks.reduce((acc, track) => {
			const existingArtist = acc.find((artist) => artist.name === track.artist)

			if (existingArtist) {
				// If the artist already exists, add the track to their tracks
				existingArtist.tracks.push(track)
			} else {
				// If it's a new artist, create a new entry
				acc.push({
					name: track.artist ?? 'Unknown',
					tracks: [track],
				})
			}

			return acc
		}, [] as Artist[])
})

// Hook to get all playlists and the function to add tracks to playlists
export const usePlaylists = () => {
	const playlists = useLibraryStore((state) => {
		return state.tracks.reduce((acc, track) => {
			track.playlist?.forEach((playlistName) => {
				const existingPlaylist = acc.find((playlist) => playlist.name === playlistName)

				if (existingPlaylist) {
					// If the playlist already exists, add the track to it
					existingPlaylist.tracks.push(track)
				} else {
					// If it's a new playlist, create a new entry
					acc.push({
						id: acc.length + 1,
						name: playlistName,
						tracks: [track],
						artworkPreview: track.artwork ?? unknownTrackImageUri,
					})
				}
			})

			return acc
		}, [] as Playlist[])
	})

	const addToPlaylist = useLibraryStore((state) => state.addToPlaylist)

	return { playlists, addToPlaylist }
}