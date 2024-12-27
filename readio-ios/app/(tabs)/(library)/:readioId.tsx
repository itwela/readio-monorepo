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
import sql from "@/helpers/neonClient";

export default function SelectedReadio() {
  const [readios, setReadios] = useState<Readio[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [playlistRelationships, setPlaylistRelationships] = useState<any>([]);
  const [createPlaylistSelections, setCreatePlaylistSelections] = useState<{ id: number, name: string }[]>([]);
  const {readioSelectedReadioId, setReadioSelectedReadioId} = useReadio()
  const {selectedReadios, setSelectedReadios} = useReadio()
	const { isFavorite, setIsFavorite} = useReadio()
  const [isInPlaylist, setIsInPlaylist] = useState<boolean>(false)
  const { user } = useUser()
  const {wantsToUpdateFavoriteStatus, setWantsToUpdateFavoriteStatus} = useReadio()

  useEffect(() => {
    const getReadios = async () => {

      const data = await sql`
      SELECT * FROM readios WHERE clerk_id = ${user?.id}
      `;

      setReadios(data)

    }

    getReadios()
    

    const getPlaylists = async () => {

      const response = await sql`
      SELECT * FROM playlists WHERE clerk_id = ${user?.id}
     `;
      setPlaylists(response)

		}
		getPlaylists()

    const getPlaylistsRelationships = async () => {
      
      const response = await sql`
      SELECT * FROM playlist_readios WHERE clerk_id = ${user?.id}
      `;

      setPlaylistRelationships(response)


		}

		getPlaylistsRelationships()

  }, [])
  
  useEffect(() => {
    
    if (playlistRelationships?.map((playlistRelationship: any) => playlistRelationship.readioId).includes(selectedReadios?.[0]?.id as number)) {
      setIsInPlaylist(true);
    }
    
    if (!playlistRelationships?.map((playlistRelationship: any) => playlistRelationship.readioId).includes(selectedReadios?.[0]?.id as number)) {
      setIsInPlaylist(false);
    }
    
  }, [playlistRelationships])
  
  useEffect(() => {

    if (wantsToUpdateFavoriteStatus === true) {
      const updateFavorite = async () => {
        const response = await sql`
          UPDATE readios
          SET favorited = ${isFavorite}
          WHERE id = ${readioSelectedReadioId} AND clerk_id = ${user?.id}
          RETURNING *;
        `;
      }
      updateFavorite();
    }

    setWantsToUpdateFavoriteStatus?.(false)
    console.log("updated favorite status")
    
  }, [isFavorite, wantsToUpdateFavoriteStatus, readioSelectedReadioId, user?.id])
  
  useEffect(() => {
    const foundReadio = readios?.find(track => track.id === readioSelectedReadioId);
    setSelectedReadios?.(foundReadio as Readio[]);
    setIsFavorite?.(foundReadio?.favorited as boolean);
    console.log("isFavorite: ", isFavorite)
    
  }, [readios, readioSelectedReadioId])
  
  const tracks = readios
  
  const filteredTracks = useMemo(() => {
    // if (!search) return tracks
    return tracks?.filter?.(track => track.id === readioSelectedReadioId)
  }, [tracks, readioSelectedReadioId])
  
  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
  const handlePress = () => {
    navigation.navigate("lib"); // <-- Using 'player' as screen name
  }

  // ANCHOR -----------------------
  
  const toggleFavorite = async () => {
    let wantsToBeFavorite = null
    
    if(isFavorite === true) {
      setWantsToUpdateFavoriteStatus?.(true)
      wantsToBeFavorite = false
      setIsFavorite?.(false)
    } 
    
    if(isFavorite === false) {
      setWantsToUpdateFavoriteStatus?.(true)
      wantsToBeFavorite = true
      setIsFavorite?.(true)
    }   
    
  }
  
  const handleAddToPlaylist = async () => {
  
    const insertPromises = createPlaylistSelections.map((playlist: { id: number, name: string }) =>
      sql`
        INSERT INTO playlist_readios (playlist_id, readio_id, playlist, readio, clerk_id)
        VALUES (${playlist.id}, ${selectedReadios?.[0]?.id as number}, ${playlist.name}, ${selectedReadios?.[0]?.title}, ${user?.id as string})
        ON CONFLICT DO NOTHING
      `
    );
      
    setIsInPlaylist(true)
    toggleModal()

  }
  
  const removeReadioFromPlaylist = async () => {

    const response = await sql`
      DELETE FROM playlist_readios
      WHERE readio_id = ${selectedReadios?.[0]?.id} AND clerk_id = ${user?.id}
    `;  

    setIsInPlaylist(false)

  }

  const handleDeleteReadio = async (id: number) => {
    
    const response = await sql`
      DELETE FROM readios
      WHERE id = ${id} AND clerk_id = ${user?.id}
      RETURNING *;
  `;

  if (response.length === 0) {
      console.log("Readio not found")
      return new Response(JSON.stringify({error: 'Readio not found'}), {status: 404});
  }

  navigation.navigate("lib"); 
  }

  // ANCHOR -----------------------

const [isModalVisible, setIsModalVisible] = useState(false);
const toggleModal = () => {
  setIsModalVisible(!isModalVisible);
};

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
      }}
      showsVerticalScrollIndicator={false}
      >
        <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', backgroundColor: "transparent"}}>
        <Text style={styles.back} onPress={handlePress}>Library</Text>
        <View style={{display: 'flex', flexDirection: 'row', gap: 20, backgroundColor: "transparent"}}>
        {isInPlaylist == false && (
          <FontAwesome onPress={toggleModal} name={"plus"} size={20} color={colors.readioOrange} />
        )}
        {isInPlaylist == true && (
          <FontAwesome onPress={removeReadioFromPlaylist} name={"minus"} size={20} color={colors.readioOrange} />
        )}

        {isFavorite === true && (
          <FontAwesome onPress={toggleFavorite} name={"heart"} size={20} color={colors.readioOrange} />
        )}

        {isFavorite === false && (
          <FontAwesome onPress={toggleFavorite} name={"heart-o"} size={20} color={colors.readioOrange} />
        )}
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
          {readios?.filter(readio => readio.id === readioSelectedReadioId).map((readio: Readio) => (
            <View key={readio.id} style={{display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', width: '100%', backgroundColor: "transparent"}}>
              <View style={{display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', width: '100%', justifyContent: 'center', backgroundColor: "transparent"}}>
              <FastImage source={{uri: filter}} style={[{zIndex: 1, width: "70%", height: "100%", borderRadius: 10, opacity: 0.4, position: 'absolute'}]} resizeMode='cover'/>
              <FastImage source={{uri: readio.image ?? unknownTrackImageUri}} style={styles.nowPlayingImage} resizeMode='cover'/>
              </View>
              <Text style={styles.title}>{readio.title}</Text>
              <Text style={styles.option}>{readio.topic}</Text>
            </View>
            
          ))}
          
          <ReadioTracksList id={ generateTracksListId('songs', readios?.filter(readio => readio.id === readioSelectedReadioId).map((readio: Readio) => readio.title).filter(Boolean).join(','))} tracks={filteredTracks} scrollEnabled={false}/>
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
              <View style={{padding: 20, backgroundColor: colors.readioBrown, width: '100%', display: 'flex', flexDirection: 'column', height: '100%'}}>
                
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <Button title="Close" color={colors.readioOrange} onPress={toggleModal} />
                </View>
        
				        <View style={{display:'flex', flexDirection: 'row', width: '100%'}}>
                    {playlists && playlists?.length === 0 && (
                      <>
                      <View style={{display:'flex', flexDirection: 'column', gap: 10}}>
                        <Text style={styles.heading}>We couldn't find any playlists.</Text>
                        <Text style={{color: colors.readioWhite, marginTop: 10}}>Create a playlist by going back and pressing:</Text>
                        <Text style={{color: colors.readioWhite, fontWeight: 'bold'}}>(New Playlist)</Text>
                      </View>
                      </>
                    )}
                    {playlists && playlists?.length > 0 && (
                        <>
                          <Text style={styles.heading}>Adding to Playlist:</Text>
                          <View style={{display:'flex', flexDirection: 'column', width: '100%', maxHeight: 'auto'}}>
                            <Text numberOfLines={2} style={{fontSize: 46, fontWeight: 'bold'}}>{selectedReadios?.[0]?.title}</Text>
                            


                                <Text style={{fontSize: 16, marginVertical: 10, fontWeight: 'bold'}}>Choose Playlist(s) to add to:</Text>
                                <FlatList
                                  data={playlists}
                                  renderItem={({ item }) =>

                                  <TouchableOpacity onPress={() => toggleSelection(item.id ? item.id : -1, item.name ? item.name : '')} activeOpacity={0.9} style={{ backgroundColor: createPlaylistSelections.some(selection => selection.id === item.id) ? '#fc3c44' : 'transparent', display: 'flex', flexDirection: 'row', alignItems: 'center', height: 40, borderRadius: 5, marginVertical: 3}}>
                                    {/* <FastImage source={{uri: item?.image ? item.image : unknownTrackImageUri}} style={{width: 40, height: 40, borderRadius: 5, marginRight: 10}} /> */}
                                    <Text numberOfLines={1} style={{fontSize: 16, maxHeight: 20, marginHorizontal: 10, color: createPlaylistSelections.some(selection => selection.id === item.id) ? '#fff' : 'black', fontWeight: createPlaylistSelections.some(selection => selection.id === item.id) ? 'bold' : 'normal'}}>{item?.name}</Text>
                                  </TouchableOpacity>}
                                  // keyExtractor={(item) => item?.id ? item.id.toString() : ''}
                                />
                              <TouchableOpacity style={{backgroundColor: colors.readioOrange, padding: 10, marginVertical: 10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'}} activeOpacity={0.9} onPress={handleAddToPlaylist}>
                                <Text style={{color: colors.readioWhite, fontWeight: 'bold', fontSize: 20}} >Add to Playlist</Text>
                              </TouchableOpacity>
                            {/* <Text style={{color: colors.readioOrange, marginTop: 10}} onPress={handleAddToPlaylist}>Add to Playlist</Text> */}
                          </View>
                        </>
                    )}
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
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.readioWhite,
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
