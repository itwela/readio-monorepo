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
import { Readio } from '@/types/type';
import { fetchAPI } from '@/lib/fetch';
import { RootNavigationProp } from "@/types/type";
import { useNavigation } from "@react-navigation/native";
// import { retryWithBackoff } from "@/helpers/retryWithBackoff";
import { colors } from '@/constants/tokens';
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import NotSignedIn from '@/constants/notSignedIn';
import sql from "@/helpers/neonClient";
import { useReadio } from '@/constants/readioContext';
import AnimatedModal from '@/components/AnimatedModal';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';

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
  
  const { user, modalMessage, setModalMessage, modalVisible, setModalVisible, needsToRefresh, setNeedsToRefresh } = useReadio()
  
  const [readios, setReadios] = useState<Readio[]>([]);
    

  useEffect(() => {
    let isMounted = true; // Flag to track whether the component is still mounted

    const getReadios = async () => {
      
      const data = await sql`
      SELECT * FROM readios WHERE clerk_id = ${user?.clerk_id}
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
      SELECT * FROM readios WHERE clerk_id = ${user?.clerk_id}
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
     <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: colors.readioBrown,
    }}>
  
    <ScrollView style={{ 
      width: '90%', 
      minHeight: '100%', 
      }}
      showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>
          <TouchableOpacity   style={styles.back} onPress={handlePress}>
            <FontAwesome color={colors.readioWhite}  size={20} name='chevron-left'/>
          </TouchableOpacity>
        </Animated.View>
      {/* <Text  allowFontScaling={false} style={styles.back} onPress={handlePress}>Library</Text> */}
      <Text  allowFontScaling={false} style={styles.heading}>All Articles</Text>
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
      <ReadioTracksList id={generateTracksListId('ssongs', search)} tracks={filteredTracks} scrollEnabled={false}/>
    
      <AnimatedModal
              visible={modalVisible}
              onClose={() => handleCloseModal()}
              text={modalMessage}
      />
    </ScrollView>
    
    </SafeAreaView>
    </>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 60,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: readioBoldFont
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
