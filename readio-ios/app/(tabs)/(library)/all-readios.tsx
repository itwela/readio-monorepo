import { StyleSheet, TextInput, Text, View, ScrollView } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
// import { useTracks } from '@/store/library';
import { useMemo, useState, useEffect } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
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

export default function AllReadios() {

  return (
    <>

    <SignedIn>
        <SignedInAllReadios />
    </SignedIn>

    <SignedOut>
        <NotSignedIn />
    </SignedOut>
    
    </>
  )
}

export const SignedInAllReadios = () => {
  
  const [search, setSearch] = useState('');
  
  const { user } = useReadio()
  
  const [readios, setReadios] = useState<Readio[]>([]);
    
  useEffect(() => {
    const getReadios = async () => {
      const data = await sql`
      SELECT * FROM readios WHERE clerk_id = ${user?.clerk_id}
      `;
    setReadios(data)

    }
  
    getReadios()
  }, [])
  
  const tracks = readios
  
  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])
  
  // const filteredTracks:Readio[] = []
  const handleClearSearch = () => {
    setSearch('')
    setSearch('')
  }
  
  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
  const handlePress = () => {
    navigation.navigate("lib"); // <-- Using 'player' as screen name
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
      <Text  allowFontScaling={false} style={styles.back} onPress={handlePress}>Library</Text>
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
            { width: search.length > 0 ? '84%' : '99%', color: colors.readioWhite },
          ]}
          placeholderTextColor={colors.readioWhite}
          placeholder="Search by title"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Text  allowFontScaling={false} onPress={handleClearSearch} style={styles.back}>Cancel</Text>
        )}
      </View>
      <ReadioTracksList id={generateTracksListId('ssongs', search)} tracks={filteredTracks} scrollEnabled={false}/>
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
    fontSize: 20,
    textDecorationLine: 'underline',
    color: colors.readioOrange,
    fontFamily: readioRegularFont
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
  },
});
