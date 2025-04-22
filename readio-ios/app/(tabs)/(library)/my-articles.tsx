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
  
  const [readios, setReadios] = useState<LotusArticle[]>([]);
    

  useEffect(() => {
    let isMounted = true; // Flag to track whether the component is still mounted

    const getReadios = async () => {
      
      const data = await sql`
      SELECT * FROM readios WHERE user_db_id = ${user?.user_db_id}
      `;
    setReadios(data)

    }
  
    getReadios()
    console.log('re rendered: 🟨🟨🟨🟨', )

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };
  }, [])


  useEffect(() => {
    let isMounted = true; // Flag to track whether the component is still mounted

    const getReadios = async () => {
      
      const data = await sql`
      SELECT * FROM readios WHERE user_db_id = ${user?.user_db_id}
      `;
    setReadios(data)

    }
  
    if (needsToRefresh === true) {
      getReadios()
    }
    console.log('re rendered: 🟨🟨🟨🟨', )

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };
  }, [needsToRefresh])
  
  const tracks = readios
  
  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(track => 
      trackTitleFilter(search)(track) || trackContentFilter(search)(track)
    )
    }, [search, tracks])
  
  // const filteredTracks:Readio[] = []
  const handleClearSearch = () => {
    setSearch('')
    setSearch('')
    console.log("i was pressed")
  }
  
  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
  const handlePress = () => {
    navigation.navigate("lib"); // <-- Using 'player' as screen name
  }

  const handleCloseModal = () => {
		setModalMessage?.("");
		setModalVisible?.(false);
    console.log('he was pressed too')
	}

  
  return (
    <>
     <View style={styles.container}>
  
       <Animated.View style={{paddingHorizontal: 10}} entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>
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
         placeholderTextColor={colors.readioWhite}
         placeholder="Search for articles by title or content"
         value={search}
         onChangeText={setSearch}
       />
       {search.length > 0 && (
         <Text  allowFontScaling={false} onPress={handleClearSearch} style={{color: colors.readioOrange, zIndex: 10, fontSize: 15}}>Cancel</Text>
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
    marginTop: 120,
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
    opacity: 0.5
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
    fontFamily: readioRegularFont,
    fontSize: 20,
    opacity: 0.5,
  },
});
