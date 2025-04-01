import { LotusArticle } from '@/types/type';
import { Track } from 'react-native-track-player';
export declare const useActiveTrack: () => LotusArticle | undefined;
export declare const [activeTrack, setActiveTrack]: [LotusArticle | undefined, (track: Track) => void];
