import { StyleSheet, TextInput, Text, View, TouchableOpacity } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { Href, router } from 'expo-router';
import { generateTracksListId } from '@/helpers/misc'
import { LotusArticle } from '@/types/type';
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import { colors, readioBoldFont } from '@/constants/tokens';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';
import { Pressable } from 'react-native-gesture-handler';

export default function Bookmarked() {
  const [search, setSearch] = useState('');

  const { user, continueReadingPlaylist } = useLotusUser();
  const navigation = useNavigation<RootNavigationProp>();

  // Get articles from Continue Reading playlist
  const continueReadingArticles = useMemo(() => {
    return continueReadingPlaylist?.articles || [];
  }, [continueReadingPlaylist]);

  // Filter articles based on search query
  const filteredArticles = useMemo(() => {
    if (!continueReadingArticles) return [];
    
    if (!search) return continueReadingArticles;
    
    const searchLower = search.toLowerCase();
    return continueReadingArticles.filter((article: any) => 
      article.title?.toLowerCase().includes(searchLower) ||
      article.topic?.toLowerCase().includes(searchLower) ||
      article.artist?.toLowerCase().includes(searchLower)
    );
  }, [continueReadingArticles, search]);

  // Get progress statistics
  const progressStats = useMemo(() => {
    if (!continueReadingArticles) return { total: 0, withProgress: 0 };
    
    const withProgress = continueReadingArticles.filter((article: any) => 
      article.progress && article.progress.progress_percentage > 0
    ).length;
    
    return {
      total: continueReadingArticles.length,
      withProgress
    };
  }, [continueReadingArticles]);

  const handleClearSearch = () => {
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
          <Pressable style={styles.back} onPress={handlePress}>
            <FontAwesome color={colors.readioWhite} size={20} name='chevron-left'/>
          </Pressable>
        </Animated.View>
        
        <LotusPageDisplayName title='BOOKMARKED' paddingTop={0}/>
        
        {/* Progress Stats */}
        {progressStats.total > 0 && (
          <Animated.View entering={FadeInUp.duration(500)} style={{ marginVertical: 5 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <View style={{ 
                backgroundColor: colors.readioBlack, 
                paddingHorizontal: 10, 
                paddingVertical: 4, 
                borderRadius: 12,
                opacity: 0.8
              }}>
                <Text allowFontScaling={false} style={{ color: colors.readioOrange, fontSize: 12 }}>
                  {progressStats.total} Bookmarked
                </Text>
              </View>
              
              {progressStats.withProgress > 0 && (
                <View style={{ 
                  backgroundColor: colors.readioOrange, 
                  paddingHorizontal: 10, 
                  paddingVertical: 4, 
                  borderRadius: 12,
                  opacity: 0.9
                }}>
                  <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 12 }}>
                    {progressStats.withProgress} In Progress
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}
        
        <View style={{ 
          display: 'flex',
          flexDirection: 'row',
          marginVertical: 10,
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'space-between',
          backgroundColor: "transparent",
        }}>
          <Animated.View entering={FadeInUp.duration(400)} exiting={FadeInDown.duration(400)} style={{
            display: "flex", 
            flexDirection: "row", 
            backgroundColor: "transparent", 
            alignItems: "center", 
            gap: 10
          }}>
            <TextInput
              allowFontScaling={false}
              style={[
                styles.searchBar,
                { width: search.length > 0 ? '82%' : '99%', color: colors.readioWhite },
              ]}
              placeholderTextColor={`${colors.readioWhite}80`}
              placeholder="Search bookmarked articles..."
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
        
        {filteredArticles.length > 0 ? (
          <ReadioTracksList 
            id={generateTracksListId('continue-reading', search)} 
            tracks={filteredArticles} 
            scrollEnabled={false}
            isOnPlaylistRoute={true} // This enables the "remove from playlist" option
          />
        ) : (
          <Animated.View entering={FadeInUp.duration(600)} style={{ paddingHorizontal: 20, paddingTop: 40, alignItems: 'center' }}>
            <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 18, opacity: 0.7, textAlign: 'center' }}>
              {search ? 
                `No bookmarked articles found matching "${search}"` : 
                continueReadingArticles?.length === 0 ?
                  "No bookmarked articles yet.\nStart listening to articles and tap the bookmark button to save your progress!" :
                  "Loading your bookmarked articles..."
              }
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.readioBrown,
    width: "100%",
    justifyContent: "space-between",
    flex: 1,
    marginTop: 110,
    paddingTop: 10,
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
  back: {
    opacity: 0.5,
    color: `${colors.readioWhite}80`,
    fontFamily: readioBoldFont,
    fontSize: 12,

  },
}); 