import { StyleSheet, TextInput, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
// import { useTracks } from '@/store/library';
import { useMemo, useState, useEffect } from 'react';
import { trackContentFilter, trackTitleFilter } from '@/helpers/filter'
// import { useNavigationSearch } from '@/hooks/useNavigationSearch'
// import { ScrollView } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context'; 
// import { router } from 'expo-router';
import { generateTracksListId } from '@/helpers/misc'
import { LotusArticle } from '@/types/type';
import { fetchAPI } from '@/lib/fetch';
import { RootNavigationProp } from "@/types/type";
import { useNavigation } from "@react-navigation/native";
// import { retryWithBackoff } from "@/helpers/retryWithBackoff";
import { colors, giantFont } from '@/constants/tokens';
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import NotSignedIn from '@/constants/notSignedIn';
import sql from "@/helpers/neonClient";
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import AnimatedModal from '@/components/AnimatedModal';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';
import LotusGap from '@/components/LotusGap';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';
import { Href, router } from 'expo-router';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AllReadios() {

  return (
    <>

    {/* <SignedIn> */}
        <SignedInAllReadios />
    {/* </SignedIn> */}

    {/* <SignedOut>
        <NotSignedIn />
    </SignedOut> */}
    
    </>
  )
}

export const SignedInAllReadios = () => {
  
  const [search, setSearch] = useState('');
  
  const { user, needsToRefresh, setNeedsToRefresh } = useLotusUser()
  const { modalMessage, floatingPlayerIsVisible, setModalMessage, modalVisible, setModalVisible} = useLotusUtils()
  
  // 🎯 PAGINATION STATE
  const [cursor, setCursor] = useState<string | null>(null);
  const [allUserArticles, setAllUserArticles] = useState<LotusArticle[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const {lightFeedback, mediumFeedback, successFeedback} = useLotusHaptic();

  // 🎯 PAGINATED QUERY
  const userArticlesResult = useQuery(
    api.articles.getArticlesByUserLight, 
    user?.user_db_id ? { 
      user_db_id: user.user_db_id, 
      limit: 20,
      ...(cursor && { cursor }) // Only include cursor if it's not null
    } : "skip"
  );

  // 🎯 HANDLE PAGINATION RESULTS
  useEffect(() => {
    if (userArticlesResult?.articles) {
      if (cursor === null) {
        // First load - replace all articles
        setAllUserArticles(userArticlesResult.articles as LotusArticle[]);
      } else {
        // Load more - append to existing articles
        setAllUserArticles(prev => [...prev, ...userArticlesResult.articles as LotusArticle[]]);
      }
      setIsLoadingMore(false);
    }
  }, [userArticlesResult, cursor]);

  // Use all loaded articles for display
  const tracks = allUserArticles || []
  
  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter((track: any) => 
      trackTitleFilter(search)(track) || trackContentFilter(search)(track)
    )
    }, [search, tracks])
  
  // 🎯 LOAD MORE FUNCTION
  const loadMoreArticles = () => {
    if (userArticlesResult?.hasMore && userArticlesResult?.nextCursor && !isLoadingMore) {
      setIsLoadingMore(true);
      setCursor(userArticlesResult.nextCursor);
    }
  };
  
  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
  const handlePress = () => {
    lightFeedback();
    router.back();
  }

  const handleCloseModal = () => {
		setModalMessage?.("");
		setModalVisible?.(false);
    // console.log('he was pressed too')
	}

  

  
  return (
    <>
     <View style={styles.container}>
  
       <Animated.View style={{paddingHorizontal: 20}} entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>
         <TouchableOpacity   style={styles.back} onPress={handlePress}>
           <FontAwesome color={colors.readioWhite}  size={20} name='chevron-left'/>
         </TouchableOpacity>
       </Animated.View>
     {/* <Text  allowFontScaling={false} style={styles.back} onPress={handlePress}>Library</Text> */}
     <LotusPageDisplayName title="MY ARTICLES" paddingTop={0} />
    
     <View style={{ 
       display: 'flex',
       flexDirection: 'row',
       gap: 10,
       alignItems: 'center',
       alignContent: 'center',
       justifyContent: 'space-between',
       backgroundColor: "transparent",
       marginHorizontal: 10,
       marginBottom: 10,
     }}>
       <TextInput
        allowFontScaling={false}
         style={[
           styles.searchBar,
           { width: search.length > 0 ? '82%' : '99%', color: colors.readioWhite },
         ]}
         placeholderTextColor={`${colors.readioWhite}80`}
         placeholder="Search for articles by title or content"
         value={search}
         onChangeText={setSearch}
       />
       {search.length > 0 && (
        <Animated.View entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)} style={{display: 'flex', flexDirection: 'row', backgroundColor: "transparent", paddingRight: 15, alignItems: "center", justifyContent: 'center', width: 70, gap: 10}}>
         <Text allowFontScaling={false} onPress={() => {
           setSearch('');
           mediumFeedback();
         }} style={styles.back}>Cancel</Text>
       </Animated.View>
       )}
     </View>

    <ScrollView style={{ 
     width: '93%', 
     minHeight: '100%',
     alignSelf: 'center',
      }}
      showsVerticalScrollIndicator={false}
      >
      <ReadioTracksList id={generateTracksListId('ssongs', search)} tracks={filteredTracks} scrollEnabled={false}/>
      
      {/* 🎯 LOAD MORE BUTTON */}
      {userArticlesResult?.hasMore && !search && (
        <TouchableOpacity 
          onPress={loadMoreArticles}
          disabled={isLoadingMore}
          style={{
            backgroundColor: colors.readioOrange,
            padding: 15,
            margin: 20,
            borderRadius: 10,
            alignItems: 'center',
            opacity: isLoadingMore ? 0.5 : 1
          }}
        >
          <Text allowFontScaling={false} style={{
            color: colors.readioWhite,
            fontFamily: readioBoldFont,
            fontSize: 16
          }}>
            {isLoadingMore ? 'Loading...' : 'Load More Articles'}
          </Text>
        </TouchableOpacity>
      )}
      
      <LotusGap backgroundColor="transparent" gapNumber={floatingPlayerIsVisible ? 130 : 100}/>
    
      <AnimatedModal
              visible={modalVisible}
              onClose={() => handleCloseModal()}
              text={modalMessage}
      />
    </ScrollView>
    
    </View>
    </>
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
