import { StyleSheet, TextInput, Text, View } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
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
import { generateTracksListId } from '@/helpers/misc'
import { Readio } from '@/types/type';
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import { retryWithBackoff } from "@/helpers/retryWithBackoff";
import { colors } from '@/constants/tokens';
import sql from '@/helpers/neonClient';

export default function Favorites() {
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Readio[]>([]);

  const tracks = favorites
  const { user } = useUser()

  const filteredTracks = useMemo(() => {
    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])


  useEffect(() => {

    
    const getFavorites = async () => {
      
      const response = await sql`
      SELECT * FROM readios WHERE clerk_id = ${user?.id} AND favorited = true
      `;

      setFavorites(response)
      console.log("favorites", favorites)

    }

    getFavorites()
  }, [])
  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation

  const handleShowPlaylist = (id: number) => {

    const strId = id.toString()
    const route = `/(library)/${strId}`
    console.log(route)

    router.push(route as Href)

    // router.push(route)
  }

  const handleClearSearch = () => {
    setSearch('')
    setSearch('')
  }

  const handlePress = () => {
    navigation.navigate("lib"); // <-- Using 'player' as screen name
}


  return (
    <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: colors.readioBrown
    }}>

    <ScrollView style={{ 
      width: '90%', 
      minHeight: '100%' 
      }}
      showsVerticalScrollIndicator={false}
      >
        <Text style={styles.back} onPress={handlePress}>Library</Text>
        <Text style={styles.heading}>Favorites</Text>
        <View style={{ 
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'space-between',
        backgroundColor: "transparent",
      }}>
        <TextInput
          style={[
            styles.searchBar,
            { width: search.length > 0 ? '84%' : '99%', color: colors.readioWhite },
          ]}
          placeholderTextColor={colors.readioWhite}
          placeholder="Search by title"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Text onPress={handleClearSearch} style={styles.back}>Cancel</Text>
        )}
      </View>
      <ReadioTracksList id={generateTracksListId('songs', search)} tracks={filteredTracks} scrollEnabled={false}/>


        {/* <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" /> */}
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
    fontSize: 15,
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
    paddingHorizontal: 5,
  },
});
