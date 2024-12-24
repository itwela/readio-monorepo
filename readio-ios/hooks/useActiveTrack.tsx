import { Readio } from '@/types/type';
import { Track } from 'react-native-track-player';
export declare const useActiveTrack: () => Readio | undefined;
export declare const [activeTrack, setActiveTrack]: [Readio | undefined, (track: Track) => void];
