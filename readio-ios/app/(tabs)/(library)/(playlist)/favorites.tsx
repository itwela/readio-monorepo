import { StyleSheet, TextInput, Text, View, TouchableOpacity } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackContentFilter, trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Href, router } from 'expo-router';
import { Playlist } from '@/helpers/types';
import { useFetch } from '@/lib/fetch';
import { fetchAPI } from "@/lib/fetch";
import { useState, useEffect } from 'react';
import { generateTracksListId } from '@/helpers/misc'
import { LotusArticle } from '@/types/type';
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import { retryWithBackoff } from "@/helpers/retryWithBackoff";
import { colors } from '@/constants/tokens';
import sql from '@/helpers/neonClient';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';

export default function Favorites() {
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<LotusArticle[]>([]);

  const tracks = favorites
  const { user } = useLotusUser()

  const filteredTracks = useMemo(() => {
    return tracks.filter(track => 
      trackTitleFilter(search)(track) || trackContentFilter(search)(track)
    )
    }, [search, tracks])


  useEffect(() => {

    let isMounted = true; // Flag to track whether the component is still mounted

    const getFavorites = async () => {
      
      const response = await sql`
        SELECT * FROM favorites 
        WHERE user_db_id = ${user?.user_db_id};
      `;

      setFavorites(response)
      console.log("favorites", favorites)

    }

    getFavorites()


    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };

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
    router.push('/(tabs)/(library)/(playlist)'); // <-- Using 'player' as screen name
}


  return (
    <View style={styles.container}>

    <ScrollView style={{ 
      width: '93%', 
      minHeight: '100%',
      alignSelf: 'center',
      }}
      showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>
          <TouchableOpacity   style={styles.back} onPress={handlePress}>
            <FontAwesome color={colors.readioWhite}  size={20} name='chevron-left'/>
          </TouchableOpacity>
        </Animated.View>
        <LotusPageDisplayName title='FAVORITES' paddingTop={0}/>
        <View 
          style={{ 
          display: 'flex',
          flexDirection: 'row',
          marginVertical: 10,
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'space-between',
          backgroundColor: "transparent",
        }}>

          <Animated.View entering={FadeInUp.duration(400)} exiting={FadeInDown.duration(400)}  style={{display: "flex", flexDirection: "row", backgroundColor: "transparent", alignItems: "center", gap: 10}}>

                  <TextInput
                  allowFontScaling={false}
                    style={[
                      styles.searchBar,
                      { width: search.length > 0 ? '84%' : '99%', color: colors.readioWhite },
                    ]}
                    placeholderTextColor={colors.readioWhite}
                    placeholder="Search for articles by title or content"
                    value={search}
                    onChangeText={setSearch}
                  />
                  {search.length > 0 && (
                    <Text  allowFontScaling={false} onPress={handleClearSearch} style={styles.back}>Cancel</Text>
                  )}
                  
          </Animated.View>

        </View>
        <ReadioTracksList id={generateTracksListId('songs', search)} tracks={filteredTracks} scrollEnabled={false}/>


        {/* <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" /> */}
        {/* <EditScreenInfo path="app/(tabs)/two.tsx" /> */}
    
    </ScrollView>
    
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'center',
    backgroundColor: colors.readioBrown,
    width: "100%",
    justifyContent: "space-between",
    flex: 1,
    marginTop: 120,
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
    opacity: 0.5,
    paddingRight: 20
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
