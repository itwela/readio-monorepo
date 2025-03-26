import { StyleSheet, Text, View, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackContentFilter, trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { router, useRouter } from 'expo-router';
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
import { colors, giantFont, readioRegularFont } from '@/constants/tokens';
import sql from "@/helpers/neonClient";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'; // Import this
import { CommonActions } from '@react-navigation/native';
import TrackPlayer, { isPlaying, Track } from 'react-native-track-player';
import Animated, { FadeInDown, FadeInUp, SlideInDown, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import { quizSelections } from '@/constants/quizSelections';
import { DimensionValue } from 'react-native';
import { setQueue } from 'react-native-track-player/lib/src/trackPlayer';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { LotusArticleModal } from '@/components/LotusModals/LotusArticleModal';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';
import LotusGap from '@/components/LotusGap';
export default function LinerNotes() {

  const [search, setSearch] = useState('');
  const router = useRouter();
  const handleClearSearch = () => {
    setSearch('')
    setSearch('')
  }
  const { linerNoteArticles } = useLotusUser()
  const { currentRouteName, setCurrentRouteName } = useLotusUtils()

  const filteredTracks = useMemo(() => {
    return linerNoteArticles.filter((track: any) => 
      trackTitleFilter(search)(track) || trackContentFilter(search)(track)
    )
  }, [search, linerNoteArticles])

  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
  const handlePressLibrary = () => {
    navigation.navigate("lib"); // <-- Using 'player' as screen name
  }
  const handleGoBack = () => {
    router.push('/(tabs)/(home)/home')
    // navigation.navigate("home"); 
  }

  


  return (
    <View 
    style={styles.container}>

    <ScrollView style={{ 
     width: '93%', 
     minHeight: '100%',
     alignSelf: 'center',
    //  paddingTop: 40,
      }}
      showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>
          <TouchableOpacity style={{display: 'flex', gap:  5, flexDirection: 'row', alignItems: 'center'}} onPress={handleGoBack}>
            <FontAwesome color={colors.readioWhite}  size={20} name='chevron-left'/>
            <Text allowFontScaling={false} style={[styles.option, { color: colors.readioWhite, fontFamily: readioRegularFont, width: '100%',}]}>
            Home
          </Text>
          </TouchableOpacity>
        </Animated.View>
        
        <View style={{ marginVertical: 10}}>

          <Animated.Text allowFontScaling={false} style={[styles.option, {opacity: 0.5, color: colors.readioWhite, fontFamily: readioRegularFont, width: '100%',}]}>
            Inspired by the lost tradition of album liner notes-those reflective, behind-the-scenes narratives that once accompanied and deepened our connection to music —our signature Liner Notes series offers insightful quick studies that serve as liner notes for living.
          </Animated.Text>
        
        </View>

        <LotusPageDisplayName title="LINER NOTES" paddingTop={10}/>

      <View style={{ 
        backgroundColor: "transparent",
        minHeight: Dimensions.get('window').height * 0.75,
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
    marginTop: 10,
    fontSize: 35,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: giantFont
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
