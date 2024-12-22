// Import necessary dependencies and types
import { unknownTrackImageUri } from '@/constants/images'
import { Artist, Playlist, TrackWithPlaylist } from '@/helpers/types'
import { Track } from 'react-native-track-player'
import { create } from 'zustand'
import { useUser } from '@clerk/clerk-expo'
import { fetchAPI } from '@/lib/fetch'
import { useEffect, useState } from 'react'
import { Readio } from '@/types/type'
import { retryWithBackoff } from "@/helpers/retryWithBackoff";

// Define the structure of our library state
interface LibraryState {
	tracks: TrackWithPlaylist[]
	toggleTrackFavorite: (track: Track) => void
	addToPlaylist: (track: Track, playlistName: string) => void
	setTracks: (newTracks: TrackWithPlaylist[]) => void // New function to set tracks
}

// Create a Zustand store for managing library state
export const useLibraryStore = create<LibraryState>()((set: any) => ({
	tracks: [],

	// Function to set tracks from S3
	setTracks: (newTracks) => set({ tracks: newTracks }),

	// Function to toggle a track's favorite status
	toggleTrackFavorite: (track) => set((state: any) => ({
		tracks: state.tracks.map((currentTrack: any) => {
			if (currentTrack.url === track.url) {
				// Toggle favorite status
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
					// Add playlist name to track
					return {
						...currentTrack,
						playlist: [...(currentTrack.playlist ?? []), playlistName],
					}
				}
				return currentTrack
			}),
		})),
}))

// Fetch S3 tracks and set them in Zustand
export const useFetchTracksFromS3 = () => {
	const setTracks = useLibraryStore((state) => state.setTracks)

	useEffect(() => {
		const fetchTracks = async () => {
			try {
				const response = await fetch('https://dkz7f291hhjsr.cloudfront.net') // Replace with actual S3 bucket URL
				const data: TrackWithPlaylist[] = await response.json()
				setTracks(data)
			} catch (error) {
				console.error("Error fetching tracks from S3:", error)
			}
		}
		fetchTracks()
	}, [setTracks])
}

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
				existingArtist.tracks.push(track)
			} else {
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
					existingPlaylist.tracks.push(track)
				} else {
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
