import { StyleSheet } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';

export default function TabTwoScreen() {
  const search = useNavigationSearch({
    searchBarOptions: {
      placeholder: 'Find in songs',
    },
  })

  const tracks = useTracks()

  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])

  return (
    <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
    }}>

    <ScrollView style={{ 
      width: '90%' 
      }}>
      <Text style={styles.title}>Library</Text>
      <Text style={styles.title}>Playlist</Text>
      <Text style={styles.title}>All Readios</Text>
      <Text style={styles.title}>Recently Saved Readios</Text>
      <ReadioTracksList id='8hcsdhkj' tracks={filteredTracks} scrollEnabled={false}/>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      {/* <EditScreenInfo path="app/(tabs)/two.tsx" /> */}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
