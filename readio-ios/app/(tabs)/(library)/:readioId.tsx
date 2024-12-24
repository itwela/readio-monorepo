import { StyleSheet, TouchableOpacity, Modal, Button, FlatList, Text, View } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Playlist } from '@/helpers/types';
import { useFetch } from '@/lib/fetch';
import { useUser } from '@clerk/clerk-expo'
import { fetchAPI } from "@/lib/fetch";
import { useState, useEffect } from 'react';
import { Readio } from '@/types/type';
import { useReadio } from '@/constants/readioContext';
import { Image } from 'react-native';
import { generateTracksListId } from '@/helpers/misc'
import { filter, unknownTrackImageUri } from '@/constants/images';
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import FastImage from 'react-native-fast-image';
import { FontAwesome } from '@expo/vector-icons';
// import { activeTrack } from 'react-native-track-player';
import { PlaylistRelationship } from '@/helpers/types';
import { set } from 'ts-pattern/dist/patterns';
import { retryWithBackoff } from "@/helpers/retryWithBackoff";
import { colors } from '@/constants/tokens';

export default function SelectedReadio() {
  const [readios, setReadios] = useState<{ data: Readio[] }>({ data: [] })
  console.log("readios: ", readios)
  const {readioSelectedReadioId, setReadioSelectedReadioId} = useReadio()
  const [selectedReadio, setSelectedReadio] = useState<Readio | undefined>()
  const [isFavorite, setIsFavorite] = useState<boolean | undefined>()
  const [isInPlaylist, setIsInPlaylist] = useState<boolean>(false)
  const [playlistRelationships, setPlaylistRelationships] = useState<{ data: PlaylistRelationship[] }>({ data: [] })
  const { user } = useUser()

  useEffect(() => {
    const getSelectedReadio = async () => {

      retryWithBackoff(async () => {

      const response = await fetchAPI(`/(api)/getReadios`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
          topic: "",
          tag: 'default',
        }),
      });
      setReadios(response)

      }, 1, 1000)

    }

    getSelectedReadio()
    

    const getPlaylists = async () => {

      retryWithBackoff(async () => {
			const response = await fetchAPI(`/(api)/getPlaylists`, {
			  method: "POST",
			  body: JSON.stringify({
				clerkId: user?.id as string,
			  }),
			});
      setPlaylists(response)
    }, 3, 1000)

		}
		getPlaylists()

    const getPlaylistsRelationships = async () => {
      
      retryWithBackoff(async () => {
        const response = await fetchAPI(`/(api)/getPlaylistRelationships`, {
          method: "POST",
          body: JSON.stringify({
          clerkId: user?.id as string,
          }),
        });
        setPlaylistRelationships(response)
    }, 3, 1000)


		}

		getPlaylistsRelationships()

  }, [])

  useEffect(() => {

    if (playlistRelationships.data.map(playlistRelationship => playlistRelationship.readioId).includes(selectedReadio?.id as number)) {
      setIsInPlaylist(true);
    }

    if (!playlistRelationships.data.map(playlistRelationship => playlistRelationship.readioId).includes(selectedReadio?.id as number)) {
      setIsInPlaylist(false);
    }

  }, [playlistRelationships])


  useEffect(() => {
    const foundReadio = readios?.data?.find(track => track.id === readioSelectedReadioId);
    setSelectedReadio(foundReadio);
    setIsFavorite(foundReadio?.favorited);
    console.log("foundReadio: ", foundReadio)
    console.log("isFavorite: ", isFavorite)

  }, [readios, readioSelectedReadioId])


  const tracks = readios.data

  const filteredTracks = useMemo(() => {
    // if (!search) return tracks
    return tracks?.filter?.(track => track.id === readioSelectedReadioId)
  }, [tracks, readioSelectedReadioId])

  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
  const handlePress = () => {
    navigation.navigate("lib"); // <-- Using 'player' as screen name
  }

const toggleFavorite = async () => {
  let wantsToBeFavorite = null

  if(isFavorite === true) {
      wantsToBeFavorite = false
  } 

  if(isFavorite === false) {
      wantsToBeFavorite = true
  }
  
// starting client api call
  if (wantsToBeFavorite === true) {
    console.log("fovoriting readio: ", wantsToBeFavorite)
  }

  if (wantsToBeFavorite === false) {
    console.log("unfovoriting readio: ", wantsToBeFavorite)
  }

  console.log("username: ", user)

  retryWithBackoff(async () => {

    const response = await fetchAPI(`/(api)/handleFavoriteSelection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: readioSelectedReadioId,  
          clerkId: user?.id as string,
          selection: wantsToBeFavorite
        }),
    });
    
    // NOTE: this is the data from the resoponse variable
    const data = await response;
    console.log("data: ", data)
    setIsFavorite(!isFavorite)

  }, 3, 1000)




}

const handleDeleteReadio = (id: number) => {

  retryWithBackoff(async () => {

    const response = await fetchAPI(`/(api)/del/deleteReadio`, {
      method: "POST",
      body: JSON.stringify({
        readioId: id,
        clerkId: user?.id
      }),
    });
    const data = await response;

  }, 3, 1000)

  console.log("readio deleted")
  navigation.navigate("lib"); 
}

const [isModalVisible, setIsModalVisible] = useState(false);
const toggleModal = () => {
  setIsModalVisible(!isModalVisible);
};

const [playlists, setPlaylists] = useState<{ data: Playlist[] }>({ data: [] })
const [createPlaylistSelections, setCreatePlaylistSelections] = useState<{ id: number, name: string }[]>([]);
function toggleSelection(selectionId: number, selectionName: string) {
  // Check if the item with this id is already in the selections
  const isSelected = createPlaylistSelections.some(item => item.id === selectionId);
  
  if (isSelected) {
    // Remove the item if it exists
    setCreatePlaylistSelections(createPlaylistSelections.filter(item => item.id !== selectionId));
  } else {
    // Add the item if it does not exist
    setCreatePlaylistSelections([...createPlaylistSelections, { id: selectionId, name: selectionName }]);
  }
}
const handleAddToPlaylist = async () => {

    retryWithBackoff(async () => {

      const response = await fetchAPI(`/(api)/addReadioToPlaylist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          readioId: selectedReadio?.id as number,  
          readioName: selectedReadio?.title,
          playlistInfo: createPlaylistSelections,
          clerkId: user?.id as string
        }),
        });

    }, 3, 1000)

    console.log("added to playlist")
    setIsInPlaylist(true)
    toggleModal()
}

const removeReadioFromPlaylist = async () => {

      retryWithBackoff(async () => {

        const response = await fetchAPI(`/(api)/removeReadioFromPlaylist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            readioId: selectedReadio?.id as number,  
            clerkId: user?.id as string
          }),
          });

      }, 3, 1000)


    console.log("removed from playlist")
    setIsInPlaylist(false)
}


  return (

    <>
    <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: colors.readioBrown,
    }}>

    <ScrollView style={{ 
      width: '90%', 
      minHeight: '100%', 
      backgroundColor: "transparent",
      }}>
        <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', backgroundColor: "transparent"}}>
        <Text style={styles.back} onPress={handlePress}>Library</Text>
        <View style={{display: 'flex', flexDirection: 'row', gap: 20, backgroundColor: "transparent"}}>
        {isInPlaylist == false && (
          <FontAwesome onPress={toggleModal} name={"plus"} size={20} color={colors.readioOrange} />
        )}
        {isInPlaylist == true && (
          <FontAwesome onPress={removeReadioFromPlaylist} name={"minus"} size={20} color={colors.readioOrange} />
        )}
        <FontAwesome onPress={toggleFavorite} name={isFavorite === true ? "heart" : "heart-o"} size={20} color={colors.readioOrange} />
        </View>
        </View>
        {/* <TouchableOpacity onPress={() => handleDeleteReadio(readioSelectedReadioId as number)}>
          <Text style={styles.option}>Delete Readio</Text>
        </TouchableOpacity> */}
        <View style={{ 
          paddingVertical: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          width: '100%',
          backgroundColor: "transparent",
        }}>
          {readios?.data?.filter(readio => readio.id === readioSelectedReadioId).map((readio: Readio) => (
            <View key={readio.id} style={{display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', width: '100%', backgroundColor: "transparent"}}>
              <View style={{display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', width: '100%', justifyContent: 'center', backgroundColor: "transparent"}}>
              <FastImage source={{uri: filter}} style={[{zIndex: 1, width: "70%", height: "100%", borderRadius: 10, opacity: 0.4, position: 'absolute'}]} resizeMode='cover'/>
              <FastImage source={{uri: readio.image ?? unknownTrackImageUri}} style={styles.nowPlayingImage} resizeMode='cover'/>
              </View>
              <Text style={styles.title}>{readio.title}</Text>
              <Text style={styles.option}>{readio.topic}</Text>
            </View>
            
          ))}
          
          <ReadioTracksList id={ generateTracksListId('songs', readios?.data?.filter(readio => readio.id === readioSelectedReadioId).map((readio: Readio) => readio.title).filter(Boolean).join(','))} tracks={filteredTracks} scrollEnabled={false}/>
        </View>


        {/* <View style={styles.separator} lightColor={colors.readioOrange} darkColor={colors.readioWhite} /> */}
        {/* <EditScreenInfo path="app/(tabs)/two.tsx" /> */}
    
    </ScrollView>
    

    </SafeAreaView>

    <Modal
            animationType="slide" 
            transparent={true} 
            visible={isModalVisible}
            onRequestClose={toggleModal}
          >
            <SafeAreaView style={{height: '100%'}}>
              <View style={{padding: 20, backgroundColor: '#fff', width: '100%', display: 'flex', flexDirection: 'column', height: '100%'}}>
                
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <Button title="Close" color="#fc3c44" onPress={toggleModal} />
                </View>
        
				<View style={{display:'flex', flexDirection: 'row', width: '100%'}}>
					<Text style={{}}>Adding to Playlist:</Text>
				</View>
				<View style={{display:'flex', flexDirection: 'column', width: '100%', maxHeight: 'auto'}}>
					<Text numberOfLines={2} style={{fontSize: 46, fontWeight: 'bold'}}>{selectedReadio?.title}</Text>
					{playlists?.data && playlists?.data.length > 0 && (
							<>

							<Text style={{fontSize: 16, marginVertical: 10, fontWeight: 'bold'}}>Choose Playlist(s) to add to:</Text>
							<FlatList
								data={playlists?.data}
								renderItem={({ item }) =>

								<TouchableOpacity onPress={() => toggleSelection(item.id ? item.id : -1, item.name ? item.name : '')} activeOpacity={0.9} style={{ backgroundColor: createPlaylistSelections.some(selection => selection.id === item.id) ? '#fc3c44' : 'transparent', display: 'flex', flexDirection: 'row', alignItems: 'center', height: 40, borderRadius: 5, marginVertical: 3}}>
									{/* <FastImage source={{uri: item?.image ? item.image : unknownTrackImageUri}} style={{width: 40, height: 40, borderRadius: 5, marginRight: 10}} /> */}
									<Text numberOfLines={1} style={{fontSize: 16, maxHeight: 20, marginHorizontal: 10, color: createPlaylistSelections.some(selection => selection.id === item.id) ? '#fff' : 'black', fontWeight: createPlaylistSelections.some(selection => selection.id === item.id) ? 'bold' : 'normal'}}>{item?.name}</Text>
								</TouchableOpacity>}
								// keyExtractor={(item) => item?.id ? item.id.toString() : ''}
							/>
						</>
					)}
					<Text style={{color: '#fc3c44', marginTop: 10}} onPress={handleAddToPlaylist}>Add to Playlist</Text>
				</View>

              </View>

            </SafeAreaView>
        </Modal>
    </>

    
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
    alignItems: 'center'
  },
  playlistIcon: {
    backgroundColor: '#ccc', 
    width: 60, 
    height: 60,
    borderRadius: 8,
  },
  readioPlaylistTitle: {
    color: colors.readioOrange,
    fontSize: 20,
    fontWeight: 'bold',
  },
  readioUserPlaylistTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nowPlayingImage: {
    width: '70%', 
    height: 250, 
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
    color: colors.readioWhite,
  },
  option: {
    fontSize: 20,
    paddingVertical: 5,
    color: colors.readioWhite,
  },
  back: {
    fontSize: 15,
    textDecorationLine: 'underline',
    color: colors.readioOrange,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '100%',
  },
});
