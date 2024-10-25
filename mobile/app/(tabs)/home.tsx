import { StyleSheet, TouchableOpacity, TouchableOpacityBase, Image } from 'react-native';
import { Text } from '@/components/Themed';
import { ScrollView, SafeAreaView, View } from 'react-native';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { router } from 'expo-router';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { buttonStyle } from "@/constants/tokens";
import NotSignedIn from '@/constants/notSignedIn';
import { useFetch } from "@/lib/fetch";
import { Readio, Station } from '@/types/type';

export default function TabOneScreen() {

  const { user } = useUser()

  const { data: stations, loading, error } = useFetch<Station[]>(`/(api)/${user?.id}`);   
  // const getReadios = async () => {
  //   const userId = user?.id
  //   try {
  //     console.log(readios)
  //   } catch (error) {
  //     console.log("there was anerror: ", error)
  //   }
  // }


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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>

        <SignedIn>

          <Text style={styles.option} onPress={() => router.push('/(auth)/welcome')}>Back To Welcome</Text>
          <Text style={styles.heading}>Home</Text>
          <View style={styles.gap}/>
          <Text style={styles.title}>Readio Stations</Text>
          <View style={styles.stationContainer}>
            {stations?.map((station) => (
              <View key={station.id} style={styles.readioRadioContainer}>
                <TouchableOpacity activeOpacity={0.9} style={styles.station}>
                  <Image source={{uri: station.imageurl}} style={styles.stationImage} resizeMode='cover'/>
                  <Text style={styles.stationName}>{station.name}</Text>
                </TouchableOpacity>
              </View>
            ))}
              {/* <View style={styles.station}></View> */}
              {/* <View style={styles.station}></View> */}
              {/* <View style={styles.station}></View> */}
          </View>
          <View style={styles.gap}/>
          <Text style={styles.title}>Listen now</Text>
          <View style={styles.nowPlaying}>
            <View style={styles.nowPlayingOverlay}>
              <Text style={styles.nowPlayingText}>{stations?.[0]?.name}</Text>
            </View>
            <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/>
          </View>

        </SignedIn>


        <SignedOut>

          <NotSignedIn/>

        </SignedOut>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scrollView: { 
    width: '90%',
    minHeight: '100%' ,
  },
  readioRadioContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 50,
    alignItems: 'center',
  },
  heading: {
    fontSize: 60,
    fontWeight: 'bold',
  },
  option: {
    fontSize: 20,
    paddingVertical: 10
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
    gap: 20,
  },
  station: {
    borderRadius: 100,
    width: 80,
    height: 80,
    marginVertical: 10,
  },
  stationImage: {
    width: 80, 
    height: 80, 
    borderRadius: 100, 
    overflow: 'hidden'
  },
  stationName: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  nowPlaying: {
    borderRadius: 10,
    width: '95%',
    height: 300,
    marginVertical: 10,
    alignSelf: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nowPlayingOverlay: {
    position: 'absolute', 
    zIndex: 1, 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: 300, 
    borderRadius: 10, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  nowPlayingText: {
    color: 'white', 
    zIndex: 1, 
    fontWeight: 'bold', 
    fontSize: 20, 
    padding: 10
  },
  nowPlayingImage: {
    width: '100%', 
    height: 300, 
    overflow: 'hidden', 
    position: 'absolute', 
    right: 0, 
    top: 0, 
    borderRadius: 10
  }
});
