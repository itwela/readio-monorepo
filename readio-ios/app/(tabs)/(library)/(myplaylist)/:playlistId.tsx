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
import { api } from '@/convex/_generated/api';
import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
// import { TextInput } from 'react-native-gesture-handler';
import { RootNavigationProp } from "@/types/type";
import { useNavigation, useRoute } from "@react-navigation/native";
import { generateTracksListId } from '@/helpers/misc'
import { LotusArticle, LotusTrack } from '@/types/type';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
// Save S3 URL to the Neon database
import { retryWithBackoff } from "@/helpers/retryWithBackoff";
import { colors, readioBoldFont } from '@/constants/tokens';
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

  const { user, deletePlaylistMutation } = useLotusUser()
  const { articleSelectedPlaylistId, articleSelectedPlaylistName } = useLotusUtils()
  const { userPlaylists } = useLotusUser()
  const { lightFeedback } = useLotusHaptic();

  const playlistData = useQuery(api.playlistArticles.getPlaylistWithArticles, {
    playlistId: articleSelectedPlaylistId ? String(articleSelectedPlaylistId) : ''
  });

  const tracks = (playlistData?.articles ?? []).filter(Boolean) as LotusTrack[];
  
  const filteredTracks = useMemo(() => {
    if (!search) return tracks;
    return tracks.filter(trackTitleFilter(search));
  }, [search, tracks]);

  const handlePressLibrary = () => {
    router.back(); // <-- Using 'player' as screen name
  }

  const handleDeletePlaylist = async () => {
    if (!articleSelectedPlaylistId || !user?.user_db_id) return;
    
    lightFeedback();
    try {
      await deletePlaylistMutation({
        playlistId: articleSelectedPlaylistId,
        user_db_id: user.user_db_id
      });
      router.back();
    } catch (error) {
      console.error('Failed to delete playlist:', error);
    }
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
        <Animated.View style={{ flexDirection: 'row', justifyContent: 'space-between' }} entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>
          <TouchableOpacity style={styles.back} onPress={handlePressLibrary}>
            <FontAwesome color={colors.readioWhite} size={20} name='chevron-left' />
          </TouchableOpacity>
          {userPlaylists?.some((playlist: any) => playlist._id === articleSelectedPlaylistId) && (
            <TouchableOpacity onPress={handleDeletePlaylist}>
              <FontAwesome color={colors.readioWhite} size={20} name='trash' />
            </TouchableOpacity>
          )}
        </Animated.View>

        <LotusPageDisplayName title={playlistData?.name?.toUpperCase() as string} paddingTop={0} />

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
              <Animated.View entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)} style={{display: 'flex', flexDirection: 'row', backgroundColor: "transparent", paddingRight: 15, alignItems: "center", justifyContent: 'center', width: 70, gap: 10}}>
              <Text allowFontScaling={false} onPress={handleClearSearch} style={styles.back}>Cancel</Text>
            </Animated.View>
                )}

          </Animated.View>
          <ReadioTracksList id={generateTracksListId('songs', search)} tracks={filteredTracks} scrollEnabled={false} isOnPlaylistRoute={true} />
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
    color: `${colors.readioWhite}80`,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  searchBar: {
    backgroundColor: `${colors.readioBlack}90`,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: `${colors.readioOrange}30`,
    fontFamily: readioBoldFont,
  },
});
