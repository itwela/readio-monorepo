import { StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { ScrollView } from 'react-native';
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Readio</Text>
      <Text style={styles.title}>Readio Stations</Text>
      <Text style={styles.title}>Listen now</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
