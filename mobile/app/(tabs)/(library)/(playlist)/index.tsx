import { StyleSheet } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { Text, View } from '@/components/Themed';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Href, router } from 'expo-router';
import { Playlist } from '@/helpers/types';
import { useFetch } from '@/lib/fetch';
import { useUser } from '@clerk/clerk-expo'
import { fetchAPI } from "@/lib/fetch";
import { useState, useEffect } from 'react';


export default function Playlists() {
  const search = useNavigationSearch({
    searchBarOptions: {
      placeholder: 'Find in songs',
    },
  })

  const tracks = useTracks()
  const { user } = useUser()

  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])

  const [playlists, setPlaylists] = useState<{ data: Playlist[] }>({ data: [] })

  useEffect(() => {
    const getPlaylists = async () => {
      const response = await fetchAPI(`/(api)/getPlaylists`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
        }),
      });

      setPlaylists(response)

    }

    getPlaylists()
  }, [user?.id])


  const handleShowPlaylist = (id: number) => {

    const strId = id.toString()
    const route = `/`
    console.log(route)

    // router.push(route as Href)
    router.push('/(library)/selected:playlistId')

    // router.push(route)
  }

  const handleSHowFavorites = () => {
    router.push('/(library)/favorites')
  }

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
        {/* <Text style={styles.back} onPress={() => router.push('/(tabs)/(library)')}>Library</Text> */}
        <Text style={styles.heading}>Playlist</Text>

        <View style={{ 
          paddingVertical: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}>

          <View style={styles.playlistContainer}>
              <View style={styles.playlistIcon}></View>
              <Text style={styles.readioPlaylistTitle}>New Playlist</Text>
          </View>
      
          <View style={styles.playlistContainer}>
              <View style={styles.playlistIcon}></View>
              <Text onPress={handleSHowFavorites} style={styles.readioPlaylistTitle}>Favorite Readios</Text>
          </View>

          <View style={styles.playlistContainer}>
              <View style={styles.playlistIcon}></View>
              {playlists.data.map((playlist) => (
                <Text onPress={() => handleShowPlaylist(playlist.id)} key={playlist.id} style={styles.readioUserPlaylistTitle}>{playlist.name}</Text>
              ))}
              <Text onPress={() => handleShowPlaylist(0)} style={styles.readioUserPlaylistTitle}>Yo</Text>
          </View>

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
    width: '80%',
  },
});
