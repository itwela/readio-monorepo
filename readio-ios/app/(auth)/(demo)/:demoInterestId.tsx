import { StyleSheet, Text, View, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackContentFilter, trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Playlist } from '@/helpers/types';
import { useFetch } from '@/lib/fetch';
import { fetchAPI } from "@/lib/fetch";
import { useState, useEffect } from 'react';
// import { TextInput } from 'react-native-gesture-handler';
import { RootNavigationProp } from "@/types/type";
import { useNavigation, useRoute } from "@react-navigation/native";
import { generateTracksListId } from '@/helpers/misc'
import { Readio } from '@/types/type';
import { useReadio } from '@/constants/readioContext';
   // Save S3 URL to the Neon database
import { retryWithBackoff } from "@/helpers/retryWithBackoff";
import { colors, readioRegularFont } from '@/constants/tokens';
import sql from "@/helpers/neonClient";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'; // Import this
import { CommonActions } from '@react-navigation/native';
import TrackPlayer, { isPlaying, Track } from 'react-native-track-player';
import Animated, { FadeInDown, FadeInUp, SlideInDown, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import { quizSelections } from '@/constants/quizSelections';
import { DimensionValue } from 'react-native';
import { setQueue } from 'react-native-track-player/lib/src/trackPlayer';
export default function DemoLinerNotes() {

  const [search, setSearch] = useState('');
  const handleClearSearch = () => {
    setSearch('')
    setSearch('')
  }
  const [stations, setStations] = useState<any[]>([]);
  const [readios, setReadios] = useState<Readio[]>([]);
  const {readioSelectedPlaylistId, readioSelectedTopics, linerNoteTopic, setLinerNoteTopic, setReadioSelectedTopics, setReadioSelectedPlaylistId} = useReadio()
  const [selectedPlaylist,  setSelectedPlaylist] = useState<any>();

  useEffect(() => {
    let isMounted = true; // Flag to track whether the component is still mounted

    const getReadios = async () => {
      try {
        const topic = "Lotus Liner Notes";
        console.log("topic", topic);
        
        const data = await sql`SELECT * FROM readios WHERE topic = ${topic} ORDER BY id ASC`;
        setReadios(data);
      } catch (error) {
        console.error("Error fetching readios:", error);
      }
    }
    console.log('starting getReadios')
    getReadios()
    console.log('finished getReadios')

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };

  }, []); 

  const handleTrackSelect = async (selectedTrack: Track) => {
    try {
      // Ensure the queue is populated if empty
      const currentQueue = await TrackPlayer.getQueue();
      if (currentQueue.length === 0) {
        await TrackPlayer.add(tracks);
      }
  
      // Find the index of the selected track in the queue
      const trackIndex = tracks.findIndex((track) => track.url === selectedTrack.url);
  
      // Validate the track
      if (trackIndex === -1 || !selectedTrack?.url) {
        console.log("Invalid track selection:", selectedTrack);
        return;
      }
  
      // Play the track directly
      await TrackPlayer.skip(trackIndex);
      await TrackPlayer.play();
  
      console.log(`Now playing: ${selectedTrack.title}`);
    } catch (error) {
      console.error("Error playing track:", error);
    }
  };

  useEffect(() => {
    
    if (linerNoteTopic === "Lotus Liner Notes" && readios && readios?.length > 0) {
      handleTrackSelect(readios[0])
      console.log("yoooo")
    }

  }, [linerNoteTopic, readios])

  const tracks = readios

  const filteredTracks = useMemo(() => {
    // if (!search) return tracks
    return tracks.filter(track => 
      trackTitleFilter(search)(track) || trackContentFilter(search)(track)
    )
  }, [search, tracks])

  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
  const handlePressLibrary = () => {
    navigation.navigate("lib"); // <-- Using 'player' as screen name
  }
  const handleGoBack = () => {
    setLinerNoteTopic?.('');
    navigation.navigate("demo"); // <-- Using 'player' as screen name
  }

const {clickedFromHome, setClickedFromHome } = useReadio()
const {clickedFromLibrary, setClickedFromLibrary } = useReadio()


  return (
    <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: colors.readioBrown
    }}>

    <ScrollView style={{ 
      width: '90%', 
      minHeight: '100%',
      backgroundColor: "transparent" 
      }}
      showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>
          <TouchableOpacity onPress={handleGoBack}>
            <FontAwesome color={colors.readioWhite}  size={20} name='chevron-left'/>
          </TouchableOpacity>
        </Animated.View>
        
        <View style={{ marginVertical: 30}}>

          <Animated.Text allowFontScaling={false} style={[styles.option, {opacity: 0.5, color: colors.readioWhite, fontFamily: readioRegularFont, width: '100%',}]}>
            Inspired by the tradition of album liner notes—the reflective, behind-the-scenes narratives that deepen our connection to music—this series offers thoughtful perspectives that serve as liner notes for living well.
          </Animated.Text>
          <Animated.Text  allowFontScaling={false} style={[styles.option, {opacity: 0.5, color: colors.readioWhite, fontFamily: readioRegularFont, width: '100%',}]}>
            This series invites you to approach each day with curiosity, purpose, and a reverence for the art of practice.
          </Animated.Text>
        
        </View>
        <Animated.Text entering={FadeInUp.duration(100)} exiting={FadeInDown.duration(100)} allowFontScaling={false} style={styles.heading}>Liner Notes</Animated.Text>
      <View style={{ 
        backgroundColor: "transparent",
        minHeight: Dimensions.get('window').height * 0.8,
      }}>
        <Animated.View entering={FadeInUp.duration(400)} exiting={FadeInDown.duration(400)}    style={{display: "flex", flexDirection: "row", backgroundColor: "transparent", alignItems: "center", gap: 10}}>

          <TextInput
           allowFontScaling={false}
            style={[
              styles.searchBar,
              { width: search.length > 0 ? '84%' : '99%', color: colors.readioWhite }
            ]}
            placeholder="Search for articles by title or content"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={colors.readioDustyWhite}
          />
          {search.length > 0 && (
          <Text  allowFontScaling={false} onPress={handleClearSearch} style={{color: colors.readioOrange, zIndex: 10, fontSize: 15}}>Cancel</Text>
          )}

        </Animated.View>
        <ReadioTracksList id={generateTracksListId('songs', search)} tracks={filteredTracks} scrollEnabled={false}/>
      </View>
    
    </ScrollView>
    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center'
  },
  playlistIcon: {
    backgroundColor: '#ccc', 
    width: 60, 
    height: 60,
    borderRadius: 8,
  },
  readioPlaylistTitle: {
    color: '#fc3c44',
    fontSize: 20,
    fontWeight: 'bold',
  },
  readioUserPlaylistTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 60,
    fontWeight: 'bold',
    color: colors.readioWhite,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  option: {
    fontSize: 20,
    paddingVertical: 5
  },
  back: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: colors.readioOrange,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 20,
    opacity: 0.5,
  },
});
