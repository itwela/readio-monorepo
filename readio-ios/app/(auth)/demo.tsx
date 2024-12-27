import { SafeAreaView } from 'react-native-safe-area-context'; 
import { utilStyle, buttonStyle } from "@/constants/tokens";
import { Text, ScrollView, View, Button, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { colors } from '@/constants/tokens';
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { useColorScheme } from '@/hooks/useColorScheme';
import FastImage from "react-native-fast-image";
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import TrackPlayer from "react-native-track-player";
import { Buffer } from "buffer";
import sql from "@/helpers/neonClient";
import { Readio, Station } from '@/types/type';
import { useRef, useState, useEffect } from 'react'
import { useReadio } from '@/constants/readioContext';
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import { useQueue } from '@/store/queue'
import { geminiPexals, geminiReadio, geminiTitle } from "@/helpers/geminiClient";
import { createClient } from "pexels";
import { s3 } from '@/helpers/s3Client';
import ReactNativeBlobUtil from 'react-native-blob-util'
import { fetchAPI } from '@/lib/fetch';
import circ from "../../assets/images/fadedOrangeCircle.png"
import { bookshelfImg, filter } from '@/constants/images';

export default function Demo() {

  const { user } = useUser()
  const [stations, setStations] = useState<Station[]>([
    {
      id: 1,
      name: "Your First Station",  
      imageurl: "",
    },
    {
      id: 2,
      name: "Your Second Station",  
      imageurl: "",
    },
    {
      id: 3,
      name: "Your Third Station", 
      imageurl: "",
    },
    {
      id: 4,
      name: "Your Fourth Station",
      imageurl: "",
    },
    {
      id: 5,
      name: "Your Fifth Station", 
      imageurl: "",
    },
    {
      id: 6,
      name: "Your Sixth Station",
      imageurl: "",
    },
    {
      id: 7,
      name: "Your Seventh Station",  
      imageurl: "",
    },
    {
      id: 8,
      name: "Your Eighth Station",
      imageurl: "",
    },
  ]);
  const {selectedReadios, setSelectedReadios} = useReadio()
  const {selectedLotusReadios, setSelectedLotusReadios} = useReadio()

  useEffect(() => {
    // const fetchStations = async () => {
    //   const data = await sql`
    //     SELECT stations.*
    //     FROM stations
    //     INNER JOIN station_clerks ON stations.id = station_clerks.station_id
    //     WHERE station_clerks.clerk_id = ${user?.id};
    //   `;
    //   setStations(data);
    // };

    // fetchStations();
  }, []);
  
  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation  
  const queueOffset = useRef(0)
  const { activeQueueId, setActiveQueueId } = useQueue() 
  const topic = "Lotus"

  const handleLotusStationPress = async () => {
   
    setSelectedReadios?.([])
    // try {
    //   await TrackPlayer.reset()
    // } catch (error) {
    //   console.log(error)
    // }

    const response = await sql`
    SELECT * FROM readios WHERE topic = ${topic}
    `;

    console.log("unPackingNewReadio: ", response);
    setSelectedLotusReadios?.(response)

    console.log("selectedReadio: ", selectedReadios)

    navigation.navigate("player"); // <-- Using 'player' as screen name

    console.log("hello")

  }

  const showPLayer = () => {
    navigation.navigate("player"); // <-- Using 'player' as screen name
  }

    return (
        <>
              <SafeAreaView style={[utilStyle.safeAreaContainer, { backgroundColor: colors.readioBrown, width: "100%", height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }, utilStyle.padding]}>
                <ScrollView style={{ 
                  width: '100%', 
                  height: '100%',
                  }}
                  showsVerticalScrollIndicator={false}
                  >


                  <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center", alignContent: "center", marginBottom: 20}}>
                    
                    <TouchableOpacity onPress={() => navigation.navigate("welcome")} style={{backgroundColor: 'transparent', borderRadius: 100, padding: 6, width: 80, display: "flex", justifyContent: "center", alignItems: "center"}} activeOpacity={0.9}>
                      <Text style={{color: colors.readioWhite, fontWeight: "bold"}}>Home</Text>
                    </TouchableOpacity>
                    
                    <View style={{backgroundColor: "transparent", width: 80, height: 20, display: "flex", justifyContent: "center", alignItems: "center"}}>
                      <Text style={{color: colors.readioWhite}}>Demo</Text>
                    </View>
                    
                    <TouchableOpacity onPress={() => navigation.navigate("features")} style={{backgroundColor: colors.readioOrange, borderRadius: 100, padding: 6, width: 80, display: "flex", justifyContent: "center", alignItems: "center"}} activeOpacity={0.9}>
                        <Text style={{color: colors.readioWhite, fontWeight: "bold"}}>Sign up</Text>
                    </TouchableOpacity>
                  
                  </View>
                  <TouchableOpacity style={styles.heading} activeOpacity={0.9}>
                    <Text style={styles.heading}>Lotus</Text>
                  </TouchableOpacity>
                  <View style={{position: "relative", width: "100%"}}>
                    <FastImage source={circ} style={[{zIndex: -1, width: 250, height: 300, position: "absolute", alignSelf: "center", top: -70, opacity: 0.7}]} resizeMode='contain'/>
                  </View>

                  <Text style={styles.title}>Stations</Text>
                  <Text style={styles.option}>Dive into some of your favorite interests!</Text>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stationContainer}>
                    <View style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 10, width: '100%', backgroundColor: "transparent"}}>
                    {stations?.map((station) => (
                      <View key={station.id} style={[styles.readioRadioContainer, { marginRight: 12 }]}>
                        <TouchableOpacity activeOpacity={0.9} style={styles.station}>
                          <FastImage source={{uri: filter}} style={[styles.stationImage, {zIndex: 1, opacity: 0.4, position: 'absolute'}]} resizeMode='cover'/>
                          <FastImage source={{uri: station.imageurl}} style={styles.stationImage} resizeMode='cover'/>
                          <Text style={styles.stationName} numberOfLines={2}>{station.name}</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    </View>
                  </ScrollView>
                  <View style={styles.gap}/>
                  
                  <TouchableOpacity activeOpacity={0.9}>
                    <Text style={styles.title}>Listen now</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.option}>Don’t know where to start? Try our very own, curated Lotus station!</Text>
                  <TouchableOpacity activeOpacity={0.95} onPress={handleLotusStationPress} style={styles.nowPlaying}>
                    <View style={[styles.nowPlayingOverlay, {zIndex: 2}]}>
                      <Text style={[styles.nowPlayingText]} numberOfLines={1}>Lotus</Text>
                    </View>
                    {/* <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
                    <FastImage source={{uri: filter}} style={[styles.nowPlayingImage, {zIndex: 1, opacity: 0.4}]} resizeMode='cover'/>
                    <FastImage source={{uri: bookshelfImg}} style={styles.nowPlayingImage} resizeMode='cover'/>
                  </TouchableOpacity>

                </ScrollView>  
              </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    pagerView: {
      flex: 1,
    },
    page: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
  },
  text: {
      fontSize: 60,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
      color: colors.readioWhite
  },
  subtext: {
    fontSize: 15,
    opacity: 0.5,
    textAlign: 'center',
    fontFamily: readioRegularFont,
    color: colors.readioWhite
},
animatedBorder: {
  // position: 'absolute',
  // top: 0,
  // left: 0,
  // right: 0,
  // bottom: 0,
  borderWidth: 2,
  borderRadius: 10,
  borderStyle: 'solid',
  zIndex: 5,
  borderColor: colors.readioOrange
},
toast: {
  position: 'absolute',
  top: 20,
  left: 0,
  right: 0,
  alignItems: 'center',
  justifyContent: 'center',
  marginHorizontal: 16,
  zIndex: 10,
  backgroundColor: '#fff',
  maxWidth: '100%',
  height: 50,
  display: 'flex'
},
scrollView: { 
  width: '90%',
  minHeight: '100%' ,
},
heading: {
  fontSize: 90,
  fontWeight: 'bold',
  textAlign: 'center',
  color: colors.readioWhite,
  zIndex: 1,
  fontFamily: readioBoldFont
},
option: {
  fontSize: 12,
  paddingBottom: 10,
  color: colors.readioWhite,
  width: "80%",
  alignSelf: 'center',
  textAlign: 'center',
  fontFamily: readioRegularFont
},
title: {
  fontSize: 30,
  // fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 10,
  color: colors.readioWhite,
  fontFamily: readioRegularFont
},
gap: {
  marginVertical: 20,
},
readioRadioContainer: {
  // display: 'flex',
  // flexDirection: 'row',
  // flexWrap: 'wrap',
  // gap: 50,
  // alignItems: 'center',
  // justifyContent: 'space-between',
  width: 160,
  // backgroundColor: colors.readioOrange
},
stationContainer: {
  width: '100%',
  height: 410,
  // flexWrap: 'wrap',
  // gap: 10,
},
station: {
  width: 140,
  height: 140,
  marginVertical: 15,
},
stationImage: {
  width: 170,
  height: 160, 
  overflow: 'hidden',
  borderRadius: 10, 
  position: 'relative',
  // borderWidth: 5,
  // borderStyle: 'solid',
  // borderColor: colors.readioOrange,
},
stationName: {
  fontWeight: 'bold',
  textAlign: 'left',
  marginVertical: 5,
  width: '80%',
  color: colors.readioWhite,
  position: 'absolute',
  zIndex: 1,
  bottom: 0,
  left: 0,
  transform: [{ translateX: 10 }, { translateY: 10 }],
  fontFamily: readioRegularFont
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
  backgroundColor: 'transparent'
},
nowPlayingText: {
  color: colors.readioWhite, 
  zIndex: 1, 
  fontWeight: 'bold', 
  fontSize: 20, 
  padding: 10,
  fontFamily: readioRegularFont
},
nowPlayingImage: {
  width: '100%', 
  height: 300, 
  overflow: 'hidden', 
  position: 'absolute', 
  right: 0, 
  top: 0, 
  borderRadius: 10
},
  });