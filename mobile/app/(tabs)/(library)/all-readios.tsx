import { StyleSheet, TextInput } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { Text, View } from '@/components/Themed';
import { useTracks } from '@/store/library';
import { useMemo, useState } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { generateTracksListId } from '@/helpers/misc'
import { Readio } from '@/types/type';
import { fetchAPI } from '@/lib/fetch';
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { RootNavigationProp } from "@/types/type";
import { useNavigation } from "@react-navigation/native";
import { retryWithBackoff } from "@/helpers/retrywithBackoff";

export default function AllReadios() {
  const [search, setSearch] = useState('');

  const { user } = useUser()

  const [readios, setReadios] = useState<{ data: Readio[] }>({ data: [] })

  useEffect(() => {
    const getPlaylists = async () => {

      retryWithBackoff(async () => {


      const response = await fetchAPI(`/(api)/getReadios`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
          topic: "",
        }),
      });

      setReadios(response)
      
    }, 3, 1000)


      console.log("readios", readios.data)

    }

    getPlaylists()
  }, [])

  // useEffect(() => {
  //   const getPlaylists = async () => {
  //     const response = await fetchAPI(`/(api)/getReadios`, {
  //       method: "POST",
  //       body: JSON.stringify({
  //         clerkId: user?.id as string,
  //       }),
  //     });

  //     setReadios(response)

  //   }

  //   getPlaylists()
  // }, [readios.data])

  const tracks = readios.data

  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])

  const handleClearSearch = () => {
    setSearch('')
    setSearch('')
  }

  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
  const handlePress = () => {
    navigation.navigate("lib"); // <-- Using 'player' as screen name
}

  return (
    <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fff'
    }}>

    <ScrollView style={{ 
      width: '90%', 
      minHeight: '100%', 
      }}>
      {/* <Text style={styles.back} onPress={() => router.push('/(library)')}>Library</Text> */}
      <Text style={styles.back} onPress={handlePress}>Library</Text>
      <Text style={styles.heading}>All Readios</Text>
      <View style={{ 
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'space-between'
      }}>
        <TextInput
          style={[
            styles.searchBar,
            { width: search.length > 0 ? '84%' : '99%' }
          ]}
          placeholder="Find in songs"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Text onPress={handleClearSearch} style={styles.back}>Cancel</Text>
        )}
      </View>
      <ReadioTracksList id={generateTracksListId('songs', search)} tracks={filteredTracks} scrollEnabled={false}/>
    </ScrollView>
    
    </SafeAreaView>
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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  back: {
    fontSize: 15,
    textDecorationLine: 'underline',
    color: '#fc3c44',
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
    paddingHorizontal: 5,
  },
});
