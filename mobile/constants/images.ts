import unknownArtistImage from '../assets/images/untitled-readio.png'
import unknownTrackImage from '../assets/images/untitled-readio.png'
import { Image } from 'react-native'

export const unknownTrackImageUri = Image.resolveAssetSource(unknownTrackImage).uri
export const unknownArtistImageUri = Image.resolveAssetSource(unknownArtistImage).uri