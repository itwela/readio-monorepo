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
import { colors, readioBoldFont } from '@/constants/tokens';
import sql from '@/helpers/neonClient';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';
import { Pressable } from 'react-native-gesture-handler';

export default function Favorites() {
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<LotusArticle[]>([]);

  const { user, userFavoriteArticles } = useLotusUser();

  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation

  // Filter favorites based on search query
  const filteredFavorites = useMemo(() => {
    if (!userFavoriteArticles) return [];
    
    if (!search) return userFavoriteArticles;
    
    const searchLower = search.toLowerCase();
    return userFavoriteArticles.filter((article: any) => 
      article.title?.toLowerCase().includes(searchLower) ||
      article.topic?.toLowerCase().includes(searchLower) ||
      article.artist?.toLowerCase().includes(searchLower) ||
      article.contentType?.toLowerCase().includes(searchLower)
    );
  }, [userFavoriteArticles, search]);

  // Get content type statistics
  const contentStats = useMemo(() => {
    if (!userFavoriteArticles) return {};
    
    const stats: Record<string, number> = {};
    userFavoriteArticles.forEach((article: any) => {
      const type = article.contentType || 'article';
      stats[type] = (stats[type] || 0) + 1;
    });
    
    return stats;
  }, [userFavoriteArticles]);

  const handleShowPlaylist = (id: number) => {

    const strId = id.toString()
    const route = `/(library)/${strId}`
    // console.log(route)

    router.push(route as Href)

    // router.push(route)
  }

  const handleClearSearch = () => {
    setSearch('')
    setSearch('')
  }

  const handlePress = () => {
    router.back();
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
          <Pressable   style={styles.back} onPress={handlePress}>
            <FontAwesome color={colors.readioWhite}  size={20} name='chevron-left'/>
          </Pressable>
        </Animated.View>
        <LotusPageDisplayName title='FAVORITES' paddingTop={0}/>
        
        {/* Content Type Stats */}
        {Object.keys(contentStats).length > 0 && (
          <Animated.View entering={FadeInUp.duration(500)} style={{ marginBottom: 15 }}>
            {/* <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 14, opacity: 0.7, marginBottom: 8 }}>
              Your Collection: {userFavoriteArticles?.length || 0} favorites
            </Text> */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(contentStats).map(([type, count]) => (
                <View key={type} style={{ 
                  backgroundColor: colors.readioBlack, 
                  paddingHorizontal: 10, 
                  paddingVertical: 4, 
                  borderRadius: 12,
                  opacity: 0.8
                }}>
                  <Text allowFontScaling={false} style={{ color: colors.readioOrange, fontSize: 12 }}>
                    {type === 'article' ? 'Articles' : 
                     type === 'liner_notes' ? 'Liner Notes' :
                     type === 'music' ? 'Music' :
                     type === 'audiobook' ? 'Audiobooks' :
                     type === 'meditation_intro' ? 'Meditations' :
                     type} ({count})
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
        
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
                      { width: search.length > 0 ? '82%' : '99%', color: colors.readioWhite },
                    ]}
                    placeholderTextColor={`${colors.readioWhite}80`}
                    placeholder="Search favorites by title, topic, artist, or type"
                    value={search}
                    onChangeText={setSearch}
                  />
                  {search.length > 0 && (
              <Animated.View entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)} style={{display: 'flex', flexDirection: 'row', backgroundColor: "transparent", paddingRight: 15, alignItems: "center", justifyContent: 'center', width: 70, gap: 10}}>
              <Text allowFontScaling={false} onPress={handleClearSearch} style={styles.back}>Cancel</Text>
            </Animated.View>
                  )}
                  
          </Animated.View>

        </View>
        
        {filteredFavorites.length > 0 ? (
          <ReadioTracksList id={generateTracksListId('songs', search)} tracks={filteredFavorites} scrollEnabled={false}/>
        ) : (
          <Animated.View entering={FadeInUp.duration(600)} style={{ paddingHorizontal: 20, paddingTop: 40, alignItems: 'center' }}>
            <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 18, opacity: 0.7, textAlign: 'center' }}>
              {search ? 
                `No favorites found matching "${search}"` : 
                userFavoriteArticles?.length === 0 ?
                  "No favorites yet.\nStart exploring and tap the heart icon to save your favorites!" :
                  "Loading your favorites..."
              }
            </Text>
          </Animated.View>
        )}


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
    color: `${colors.readioWhite}80`,
    fontFamily: readioBoldFont,
    fontSize: 12,
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
