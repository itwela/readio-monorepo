import { StyleSheet } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { Text, View } from '@/components/Themed';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import NotSignedIn from '@/constants/notSignedIn';


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
      backgroundColor: '#fff'
    }}>

    <ScrollView style={{ 
      width: '90%', 
      minHeight: '100%' 
      }}>

      <SignedIn>

        <Text style={styles.heading}>Library</Text>
        <View style={{ 
          paddingVertical: 5
        }}>
          <Text style={styles.option} onPress={() => router.push('/playlist')}>Playlist</Text>
          <Text style={styles.option} onPress={() => router.push('/all-readios')}>All Readios</Text>
        </View>
        <View style={{marginVertical: 15}}/>
        <Text style={styles.title}>Recently Saved Readios</Text>
        <View style={styles.recentlySavedContainer}>
        
          <View style={styles.recentlySavedItems}>
            <View style={styles.recentlySavedImg}></View>
            <Text style={styles.recentlySavedTItle}>Test Title</Text>
            <Text style={styles.recentlySavedSubheading}>Test Subheading</Text>
          </View>

        </View>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        {/* <EditScreenInfo path="app/(tabs)/two.tsx" /> */}

      </SignedIn>

      <SignedOut>

        <NotSignedIn />

      </SignedOut>

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
  recentlySavedContainer: {
    display: 'flex',
    gap: 10,
    flexDirection: 'row',
    width: '100%',
    height: 'auto',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  recentlySavedItems: {
    display: 'flex',
    width: '48%',
    height: 'auto',
    gap: 5,
  },
  recentlySavedImg: {
    width: '100%',
    height: 150,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  recentlySavedTItle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  recentlySavedSubheading: {
    fontSize: 15,
  },
  heading: {
    fontSize: 60,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  option: {
    fontSize: 20,
    paddingVertical: 10
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
