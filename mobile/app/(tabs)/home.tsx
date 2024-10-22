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
  console.log("stations: ", stations)
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
    <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fff',
    }}>
      <ScrollView style={{ 
        width: '90%',
        minHeight: '100%' ,
      }}>

        <SignedIn>

          <Text style={styles.option} onPress={() => router.push('/(auth)/welcome')}>Back To Welcome</Text>
          <Text style={styles.heading}>Home</Text>
          <View style={styles.gap}/>
          <Text style={styles.title}>Readio Stations</Text>
          <View style={styles.stationContainer}>
            {stations?.map((station) => (
              <View key={station.id} style={[styles.readioRadioContainer]}>
                <TouchableOpacity activeOpacity={0.9} style={[styles.station, {position: 'relative'}]}>
                  <Image source={{uri: station.imgeUrl}} style={{width: 80, height: 80, borderRadius: 10, overflow: 'hidden'}} resizeMode='contain'/>
                  <Text style={{fontWeight: 'bold'}}>{station.name}</Text>
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
            <Text style={styles.title}>{stations?.[0].name}</Text>
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
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  readioRadioContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
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
    gap: 10,
  },
  station: {
    borderRadius: 100,
    width: 80,
    height: 80,
    // backgroundColor: '#ccc',
    marginVertical: 10,
  },
  nowPlaying: {
    borderRadius: 10,
    width: '95%',
    height: 300,
    backgroundColor: '#ccc',
    marginVertical: 10,
    alignSelf: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
