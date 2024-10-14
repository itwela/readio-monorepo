import { StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { ScrollView, SafeAreaView, View } from 'react-native';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'

export default function TabOneScreen() {
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
      backgroundColor: '#fff'
    }}>
      <ScrollView style={{ 
        width: '90%',
        minHeight: '100%' 
      }}>
        <Text style={styles.heading}>Home</Text>
        <View style={styles.gap}/>
        <Text style={styles.title}>Readio Stations</Text>
        <View style={styles.stationContainer}>
            <View style={styles.station}></View>
        </View>
        <View style={styles.gap}/>
        <Text style={styles.title}>Listen now</Text>
        <View style={styles.nowPlaying}></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  heading: {
    fontSize: 60,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  gap: {
    marginVertical: 20,
  },
  stationContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  station: {
    borderRadius: 100,
    width: 80,
    height: 80,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  nowPlaying: {
    borderRadius: 10,
    width: '95%',
    height: 300,
    backgroundColor: '#ccc',
    marginVertical: 10,
    alignSelf: 'center'
  }
});
