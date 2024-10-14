import { StyleSheet, TextInput } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useTracks } from '@/store/library';
import { useMemo, useState } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { generateTracksListId } from '@/helpers/misc'

export default function AllReadios() {
  const [search, setSearch] = useState('');
  const tracks = useTracks()

  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])

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
      <Text style={styles.back} onPress={() => router.push('/(library)')}>Library</Text>
      <Text style={styles.heading}>All Readios</Text>
      <View style={{ 
        paddingVertical: 5
      }}>
        <TextInput
          style={styles.searchBar}
          placeholder="Find in songs"
          value={search}
          onChangeText={setSearch}
        />
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
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});
