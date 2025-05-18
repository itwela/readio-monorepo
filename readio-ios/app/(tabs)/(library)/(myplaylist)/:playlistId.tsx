import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
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
import { LotusArticle } from '@/types/type';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
// Save S3 URL to the Neon database
import { retryWithBackoff } from "@/helpers/retryWithBackoff";
import { colors } from '@/constants/tokens';
import sql from "@/helpers/neonClient";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'; // Import this
import { CommonActions } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';

export default function Playlists() {

  const [search, setSearch] = useState('');
  const handleClearSearch = () => {
    setSearch('')
    setSearch('')
  }

  const { user } = useLotusUser()
  const { readioSelectedPlaylistId, setReadioSelectedPlaylistId, readioSelectedPlaylistName } = useLotusUtils()
  const { communityPlaylistArticles, playlistCategories } = useLotusUser()
  const {lightFeedback, mediumFeedback} = useLotusHaptic();

  //  filter by playlistcategory, i need to look at the readioselectedplaylistid and use that to filter
  const filteredCategory = playlistCategories?.find((category: any) =>
    category.name === readioSelectedPlaylistName
  );

  const categoryWithArticles = useMemo(() => {
    if (!communityPlaylistArticles || !filteredCategory) {
      return undefined;
    }
    // Find the object in communityPlaylistArticles whose 'category' property matches the filteredCategory's name
    return communityPlaylistArticles.find((catObj: any) => catObj.category === filteredCategory.name);
  }, [communityPlaylistArticles, filteredCategory]);

  // Extract the articles array from the found category object
  const tracks = useMemo(() => categoryWithArticles?.articles || [], [categoryWithArticles]);
  const filteredTracks = useMemo(() => {

    // console.log("the category", filteredCategory?.name)
    // console.log("filteredtracksbycategory", communityPlaylistArticles)

    if (!search) return tracks;
    return tracks.filter(trackTitleFilter(search));
  }, [search, tracks]);

  const handlePressLibrary = () => {
    router.back(); // <-- Using 'player' as screen name
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
        <Animated.View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between' }} entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>
          <TouchableOpacity style={styles.back} onPress={handlePressLibrary}>
            <FontAwesome color={colors.readioWhite} size={20} name='chevron-left' />
          </TouchableOpacity>
        </Animated.View>

        <LotusPageDisplayName title={filteredCategory?.name?.toUpperCase()} paddingTop={0} />

        <View style={{
          backgroundColor: "transparent"
        }}>
          <Animated.View entering={FadeInUp.duration(400)} exiting={FadeInDown.duration(400)} style={{ display: "flex", flexDirection: "row", backgroundColor: "transparent", alignItems: "center", gap: 10 }}>

            <TextInput
              allowFontScaling={false}
              style={[
                styles.searchBar,
                { width: search.length > 0 ? '84%' : '99%', color: colors.readioWhite }
              ]}
              placeholder="Search"
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={colors.readioDustyWhite}
            />
            {search.length > 0 && (
              <Text allowFontScaling={false} onPress={handleClearSearch} style={{ color: colors.readioOrange, zIndex: 10, fontSize: 15 }}>Cancel</Text>
            )}

          </Animated.View>
          <ReadioTracksList id={generateTracksListId('songs', search)} tracks={filteredTracks} scrollEnabled={false} />
        </View>

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
    marginTop: 110,
    paddingTop: 10,
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
    color: colors.readioWhite
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
