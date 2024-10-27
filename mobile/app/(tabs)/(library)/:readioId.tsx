import { StyleSheet } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { Text, View } from '@/components/Themed';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Playlist } from '@/helpers/types';
import { useFetch } from '@/lib/fetch';
import { useUser } from '@clerk/clerk-expo'
import { fetchAPI } from "@/lib/fetch";
import { useState, useEffect } from 'react';
import { Readio } from '@/types/type';
import { useReadio } from '@/constants/readioContext';
import { Image } from 'react-native';
import { generateTracksListId } from '@/helpers/misc'
import { unknownTrackImageUri } from '@/constants/images';


export default function SelectedReadio() {
  const [readios, setReadios] = useState<{ data: Readio[] }>({ data: [] })
  const {readioSelectedReadioId, setReadioSelectedReadioId} = useReadio()

  const search = useNavigationSearch({
    searchBarOptions: {
      placeholder: 'Find in songs',
    },
  })

  const tracks = readios.data
  const { user } = useUser()

  const filteredTracks = useMemo(() => {
    // if (!search) return tracks
    return tracks.filter(track => track.id === readioSelectedReadioId)
  }, [search, tracks])


  useEffect(() => {
    const getSelectedReadio = async () => {
      const response = await fetchAPI(`/(api)/getReadios`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
        }),
      });

      setReadios(response)

      console.log("response: ", readios.data)

    }

    getSelectedReadio()
  }, [user?.id])

  return (
    <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fff'
    }}>

    <ScrollView style={{ 
      width: '90%', 
      minHeight: '100%' 
      }}>
        <Text style={styles.back} onPress={() => router.push('/(library)')}>Playlist</Text>
        <View style={{ 
          paddingVertical: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          width: '100%',
        }}>
          {readios?.data?.filter(readio => readio.id === readioSelectedReadioId).map((readio: Readio) => (
            <View key={readio.id} style={{display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', width: '100%'}}>
              <Image source={{uri: readio.image ?? unknownTrackImageUri}} style={styles.nowPlayingImage} resizeMode='cover'/>
              <Text style={styles.title}>{readio.title}</Text>
              <Text style={styles.option}>{readio.topic}</Text>
            </View>
            
          ))}
          
          <ReadioTracksList id={generateTracksListId('songs', search)} tracks={filteredTracks} scrollEnabled={false}/>

        </View>

        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        {/* <EditScreenInfo path="app/(tabs)/two.tsx" /> */}
    
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
  nowPlayingImage: {
    width: '70%', 
    height: 250, 
    right: 0, 
    top: 0, 
    borderRadius: 10
  },
  heading: {
    fontSize: 60,
    fontWeight: 'bold',
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
    fontSize: 15,
    textDecorationLine: 'underline',
    color: '#fc3c44',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '100%',
  },
});
