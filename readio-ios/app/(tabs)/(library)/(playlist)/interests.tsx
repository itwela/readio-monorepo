import { StyleSheet, KeyboardAvoidingView, TouchableOpacity, Modal, Button, FlatList, Text, View } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Href, router } from 'expo-router';
import { Playlist } from '@/helpers/types';
import { useFetch } from '@/lib/fetch';
import { fetchAPI } from "@/lib/fetch";
import { useState, useEffect } from 'react';
import { RootNavigationProp, Station } from "@/types/type";
import { useNavigation } from "@react-navigation/native";
import InputField from '@/components/inputField';
import { Readio } from '@/types/type';
import { set } from 'ts-pattern/dist/patterns';
import FastImage from 'react-native-fast-image';
import { unknownTrackImageUri } from '@/constants/images';
import { useReadio } from '@/constants/readioContext';
import { MenuView } from '@react-native-menu/menu'
import { match } from 'ts-pattern'
import { retryWithBackoff } from "@/helpers/retryWithBackoff";
import { colors } from '@/constants/tokens';
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import sql from "@/helpers/neonClient";
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import TrackPlayer from 'react-native-track-player';

export default function Playlists() {

  const { user } = useReadio()


  const {readioSelectedPlaylistId, setReadioSelectedPlaylistId, needsToRefresh, setNeedsToRefresh} = useReadio()
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    let isMounted = true; // Flag to track whether the component is still mounted

    const fetchStations = async () => {
      try { 
        const data = await sql`
          SELECT stations.*
          FROM stations
          INNER JOIN station_clerks ON stations.id = station_clerks.station_id
          WHERE station_clerks.clerk_id = ${user?.clerk_id};
      `;
      console.log("stations: ", data)
      setStations(data);
      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };

    if ( !user ) {
      fetchStations();
    }

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };
  }, []);

  useEffect(() => {
    let isMounted = true; // Flag to track whether the component is still mounted

    const fetchStations = async () => {
      try { 
        const data = await sql`
          SELECT stations.*
          FROM stations
          INNER JOIN station_clerks ON stations.id = station_clerks.station_id
          WHERE station_clerks.clerk_id = ${user?.clerk_id};
      `;
      console.log("stations: ", data)
      setStations(data);
      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };

    fetchStations();

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };
  }, [user?.clerk_id]);



//   const handleShowPlaylist = (id: number) => {

//     const strId = id.toString()
//     const route = `/`
//     console.log(route)

//     setReadioSelectedPlaylistId?.(id)
//     setClickedFromLibrary?.(true); 
//     setClickedFromHome?.(false);

//     // router.push(route as Href)
//     router.push('/(library)/selected:playlistId')

//     // router.push(route)
//   }

  const handleGoToInterest = async (id: any)  => {
    TrackPlayer.reset()
    setReadioSelectedPlaylistId?.(id)
    setClickedFromHome?.(true); 
    setClickedFromLibrary?.(false);
    router.push('/(tabs)/(home)/:stationId')
  }
  
  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
  const handlePress = () => {
    navigation.navigate("lib"); // <-- Using 'player' as screen name
  }

const [createPlaylistSelections, setCreatePlaylistSelections] = useState<{ id: number, name: string }[]>([]);

const handleDeletePlaylist = async (playlistName?: string) => {

  const name = playlistName
  const id = user?.clerk_id

  console.log("uidu", id)
  console.log("name", name)

  try {
    await sql`
    DELETE FROM playlists WHERE name = ${name} AND clerk_id = ${id}
    `.then(() => {
      setNeedsToRefresh?.(true)
      setTimeout(() => {
        setNeedsToRefresh?.(true)
      }, 1000)
      console.log('Record deleted successfully');
    }).catch((error) => {
      console.error('Error deleting record:', error);
    });

    console.log('success')
  } catch (error) {
    console.log('fail', error)
  }
}

const handlePressAction = (id: string, playlistName?: string, readioName?: string) => {
  match(id)
    .with('add-to-favorites', async () => {
      console.log("add-t-f")
    })
    .with('remove-from-favorites', async () => {
      console.log("remove-f-f")
    })
    .with('add-to-playlist', () => {
      console.log("add-t-p")
    })
    .with('remove-from-playlist', () => {
      console.log('remove-f-p')
    })
    .with('delete', () => {
      handleDeletePlaylist(playlistName)
      console.log("delete")
    })

    .otherwise(() => console.warn(`Unknown menu action ${id}`))
}

const {clickedFromHome, setClickedFromHome} = useReadio()
const {clickedFromLibrary, setClickedFromLibrary} = useReadio()


  return (
    <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: colors.readioBrown,
    }}>

    <ScrollView style={{ 
      width: '90%', 
      minHeight: '100%' 
      }}
      showsVerticalScrollIndicator={false}
      >
          <Animated.View entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>
          <TouchableOpacity   style={styles.back} onPress={handlePress}>
            <FontAwesome color={colors.readioWhite}  size={20} name='chevron-left'/>
          </TouchableOpacity>
        </Animated.View>
            {/* <Animated.Text entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}   allowFontScaling={false} style={styles.back} onPress={handlePress}>Library</Animated.Text> */}
            <Animated.Text entering={FadeInUp.duration(100)} exiting={FadeInDown.duration(100)}   allowFontScaling={false} style={styles.heading}>Interests</Animated.Text>

        <View style={{ 
          paddingVertical: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          backgroundColor: 'transparent',
        }}>

            <View style={styles.playlistContainer}>
              <FlatList
                data={stations}
                scrollEnabled={false}
                keyExtractor={(station) => station?.id?.toString() || ''}
                renderItem={({ item: station, index }) => (
                  <Animated.View  entering={FadeIn.duration(300 + (index * 100))} exiting={FadeOut.duration(300 + (index * 100))}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 20,
                        width: '100%',
                        marginBottom: 20,
                        justifyContent:'space-between'
                      }}
                    >
                      <TouchableOpacity onPress={() => { handleGoToInterest(station?.id || 0) }} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20, width: '90%'}}>
                        <Text  allowFontScaling={false} style={styles.readioUserPlaylistTitle}>{station?.name}</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                 </Animated.View>
                )}
              />
            </View>

          </View>

        {/* <View style={styles.separator} lightColor="transparent" darkColor="rgba(255,255,255,0.1)" /> */}
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
  playlistContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    backgroundColor: "transparent",
  },
  playlistIcon: {
    backgroundColor: colors.readioWhite, 
    width: 60, 
    height: 60,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  readioPlaylistTitle: {
    color: colors.readioOrange,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: readioBoldFont
  },
  readioUserPlaylistTitle: {
    color: colors.readioWhite,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: readioBoldFont
  },
  heading: {
    fontSize: 50,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: readioBoldFont
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  option: {
    fontSize: 20,
    paddingVertical: 5
  },
  back: {
    // fontSize: 15,
    // textDecorationLine: 'underline',
    // color: colors.readioOrange,
    // fontFamily: readioRegularFont,
    opacity: 0.5
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '100%',
  },
  playlistSelections: {
  }
});
