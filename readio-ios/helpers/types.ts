import { Track } from 'react-native-track-player'

export interface Goal {
  id: string;
  type: 'water' | 'meditation' | 'steps' | 'reading';
  currentValue: number;
  targetValue: number;
  reminderFrequency: number; // in hours
  isEnabled: boolean;
  lastUpdated: Date;
}

export type Playlist = {
	id: number
	name: string
	tracks: Track[]
	artworkPreview: string
}

export type PlaylistRelationship = {
	id: number
	playlistId: number
	readioId: number
	playlist: string
	readio: string
}

export type Artist = {
	name: string
	tracks: Track[]
}

export type TrackWithPlaylist = Track & { playlist?: string[] }