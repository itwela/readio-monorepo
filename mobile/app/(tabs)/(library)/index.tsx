import { StyleSheet, Touchable, TouchableOpacity } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { Text, View } from '@/components/Themed';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Href, router } from 'expo-router';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import NotSignedIn from '@/constants/notSignedIn';
import { Readio } from '@/types/type';
import { fetchAPI } from '@/lib/fetch';
import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { useReadio } from '@/constants/readioContext';


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
  const { user } = useUser()
  const [readios, setReadios] = useState<{ data: Readio[] }>({ data: [] })
  const {readioSelectedReadioId, setReadioSelectedReadioId} = useReadio()

  const handleGoToSelectedReadio = (readioId: number) => {
    setReadioSelectedReadioId?.(readioId)
    router.push(`/(tabs)/(library)/${readioId}` as Href)
  }

  useEffect(() => {
    const getPlaylists = async () => {
      const response = await fetchAPI(`/(api)/getReadios`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
        }),
      });

      setReadios(response)

    }

    getPlaylists()
  }, [user?.id])
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
          <Text style={styles.option} onPress={() => router.push('/(tabs)/(library)/(playlist)')}>Playlist</Text>
          <Text style={styles.option} onPress={() => router.push('/all-readios')}>All Readios</Text>
        </View>
        <View style={{marginVertical: 15}}/>
        <Text style={styles.title}>Recently Saved Readios</Text>
        <View style={styles.recentlySavedContainer}>
        
          {readios.data.map((readio: Readio) => (
            <TouchableOpacity onPress={() => handleGoToSelectedReadio(readio?.id as number)} key={readio.id} style={styles.recentlySavedItems}>
              <View style={styles.recentlySavedImg}>
                <Image source={{uri: readio.image}} style={styles.nowPlayingImage} resizeMode='cover'/>
                {/* <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
              </View>
              <Text style={styles.recentlySavedTItle}>{readio.title}</Text>
              <Text style={styles.recentlySavedSubheading}>{readio.topic}</Text>
            </TouchableOpacity>
          ))}

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
  nowPlayingImage: {
    width: '100%', 
    height: 150, 
    overflow: 'hidden', 
    position: 'absolute', 
    right: 0, 
    top: 0, 
    borderRadius: 10
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
