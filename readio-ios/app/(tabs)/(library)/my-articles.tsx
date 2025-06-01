import { StyleSheet, TextInput, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { useMemo, useState } from 'react';
import { generateTracksListId } from '@/helpers/misc'
import { LotusArticle } from '@/types/type';
import { RootNavigationProp } from "@/types/type";
import { useNavigation } from "@react-navigation/native";
import { colors, giantFont } from '@/constants/tokens';
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import NotSignedIn from '@/constants/notSignedIn';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import AnimatedModal from '@/components/AnimatedModal';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';
import LotusGap from '@/components/LotusGap';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';
import { Href, router } from 'expo-router';

export default function AllReadios() {

  return (
    <>

    {/* <SignedIn> */}
        <SignedInAllReadios />
    {/* </SignedIn> */}

    {/* <SignedOut>
        <NotSignedIn />
    </SignedOut> */}
    
    </>
  )
}

export const SignedInAllReadios = () => {
  
  const [search, setSearch] = useState('');
  
  const { user, needsToRefresh, setNeedsToRefresh } = useLotusUser()
  const { modalMessage, floatingPlayerIsVisible, setModalMessage, modalVisible, setModalVisible} = useLotusUtils()
  
  const {lightFeedback, mediumFeedback, successFeedback} = useLotusHaptic();

  // Use all loaded articles for display - now handled by ReadioTracksList
  const tracks: LotusArticle[] = []
  
  const filteredTracks = useMemo(() => {
    // Filtering is now handled by search prop in ReadioTracksList
    return tracks
    }, [tracks])
  

  
  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
  const handlePress = () => {
    lightFeedback();
    router.back();
  }

  const handleCloseModal = () => {
		setModalMessage?.("");
		setModalVisible?.(false);
    // console.log('he was pressed too')
	}

  

  
  return (
    <>
     <View style={styles.container}>
  
       <Animated.View style={{paddingHorizontal: 20}} entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>
         <TouchableOpacity   style={styles.back} onPress={handlePress}>
           <FontAwesome color={colors.readioWhite}  size={20} name='chevron-left'/>
         </TouchableOpacity>
       </Animated.View>
     {/* <Text  allowFontScaling={false} style={styles.back} onPress={handlePress}>Library</Text> */}
     <LotusPageDisplayName title="MY ARTICLES" paddingTop={0} />
    
     <View style={{ 
       display: 'flex',
       flexDirection: 'row',
       gap: 10,
       alignItems: 'center',
       alignContent: 'center',
       justifyContent: 'space-between',
       backgroundColor: "transparent",
       marginHorizontal: 10,
       marginBottom: 10,
     }}>
       <TextInput
        allowFontScaling={false}
         style={[
           styles.searchBar,
           { width: search.length > 0 ? '82%' : '99%', color: colors.readioWhite },
         ]}
         placeholderTextColor={`${colors.readioWhite}80`}
         placeholder="Search for articles by title or content"
         value={search}
         onChangeText={setSearch}
       />
       {search.length > 0 && (
        <Animated.View entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)} style={{display: 'flex', flexDirection: 'row', backgroundColor: "transparent", paddingRight: 15, alignItems: "center", justifyContent: 'center', width: 70, gap: 10}}>
         <Text allowFontScaling={false} onPress={() => {
           setSearch('');
           mediumFeedback();
         }} style={styles.back}>Cancel</Text>
       </Animated.View>
       )}
     </View>

    <ScrollView style={{ 
      width: '93%', 
      minHeight: '100%',
      alignSelf: 'center',
    }} 
      showsVerticalScrollIndicator={false}
    >
      <ReadioTracksList 
        enablePagination={true}
        search={search}
        id={generateTracksListId('ssongs', search)} 
        scrollEnabled={false}
      />
      
      
      <LotusGap backgroundColor="transparent" gapNumber={floatingPlayerIsVisible ? 130 : 100}/>
    
      <AnimatedModal
              visible={modalVisible}
              onClose={() => handleCloseModal()}
              text={modalMessage}
      />
    </ScrollView>
    
    </View>
    </>
  );

}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'center',
    backgroundColor: colors.readioBrown,
    width: "100%",
    justifyContent: "space-between",
    flex: 1,
    marginTop: 110,
    paddingTop: 10,
  },
  heading: {
    marginTop: 10,
    fontSize: 35,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: giantFont
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  back: {
    opacity: 0.5,
    color: `${colors.readioWhite}80`,
    fontFamily: readioBoldFont,
    fontSize: 12,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  searchBar: {
    backgroundColor: `${colors.readioBlack}90`,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: `${colors.readioOrange}30`,
    fontFamily: readioBoldFont,
  },
});
