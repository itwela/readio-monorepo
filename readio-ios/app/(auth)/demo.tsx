import { SafeAreaView } from 'react-native-safe-area-context'; 
import { utilStyle, buttonStyle } from "@/constants/tokens";
import { Text, ScrollView, View, Button, TouchableOpacity, StyleSheet, Animated as ReactNativeAnimated } from "react-native";
import { colors } from '@/constants/tokens';
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { useColorScheme } from '@/hooks/useColorScheme';
import FastImage from "react-native-fast-image";
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
import { bookshelfImg, filter, whitelogo } from '@/constants/images';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { set } from 'ts-pattern/dist/patterns';
import  Animated, { FadeInDown, FadeInUp, FadeOutDown } from "react-native-reanimated";
import { LinearGradient } from 'expo-linear-gradient';
export default function Demo() {

  const [stations, setStations] = useState<Station[]>([
    {
      id: 6,
      name: "Move",  
      imageurl: "https://live.staticflickr.com/2755/4429752169_edd4a2c066_b.jpg",
    },
    {
      id: 7,
      name: "Thrive", 
      imageurl: "https://images.squarespace-cdn.com/content/v1/632adddce05653425133b186/1670503445084-JQLTMCBDAV8H5HBBVEGG/image-from-rawpixel-id-6918285-original.jpg",
    },
    {
      id: 8,
      name: "Create",
      imageurl: "https://miro.medium.com/v2/resize:fit:1400/1*4nvu_uucT3D8X4JSZco1iQ.jpeg",
    },
    {
      id: 9,
      name: "Care", 
      imageurl: "https://acupuncturehealth.com/images/content/heart_shape_hands.jpg",
    },
    {
      id: 10,
      name: "Discover",
      imageurl: "https://pix4free.org/assets/library/2021-08-01/originals/innovation.jpg",
    },
    {
      id: 11,
      name: "Imagine",  
      imageurl: "https://live.staticflickr.com/3191/2732095462_6f865e6f5e_b.jpg",
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
  
  const handleLotusStationPress = async () => {
    
    TrackPlayer.reset()
    setSelectedReadios?.([])
    // try {
      //   await TrackPlayer.reset()
      // } catch (error) {
        //   console.log(error)
        // }
    const topic = "Lotus"
    const tag = "public"
    const response = await sql`
    SELECT * FROM readios WHERE artist = ${topic} and tag = ${tag}
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


  const sutt = "Sign up to try all features"
  const [stationClicked, setStationClicked] = useState(false)
  const [selectedStationId, setSelectedStationId] = useState()

  const handleStationPress = (id : any) => {
    setStationClicked(true)
    setSelectedStationId(id)
  }

  const {wantsToGetStarted, setWantsToGetStarted} = useReadio()
  const {setReadioSelectedPlaylistId, setClickedFromHome, setClickedFromLibrary} = useReadio()
  const handleGoToPlaylist = async (id: any)  => {
    setReadioSelectedPlaylistId?.(id)
    setClickedFromHome?.(true); 
    setClickedFromLibrary?.(false);
    router.push('/(auth)/:stationId')
    // router.push('/(tabs)/(library)/(playlist)/:playlistId')
  }




    return (
        <>
              <FastImage source={{uri: bookshelfImg}} style={[{zIndex: -2, opacity: 1, position: 'absolute', width: '100%', height: '40%'}]} resizeMode='cover'/>
              <LinearGradient
                  colors={[colors.readioBrown,'transparent']}
                  style={{
                      zIndex: -1,
                      bottom: '60%',
                      position: 'absolute',
                      width: '150%',
                      height: 450,
                      transform: [{rotate: '-180deg'}]
                  }}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
              /> 
              <View style={{width: "100%", height: "100%", zIndex: -3, position: "absolute", backgroundColor: colors.readioBrown }} />   
              <SafeAreaView style={[utilStyle.safeAreaContainer, { width: "100%", minHeight: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }]}>
                
                {/* NOTE HEADER */}
                <Animated.View  entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)}  style={{display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center", alignContent: "center", marginBottom: 20}}>
                  
                  <TouchableOpacity onPress={() => navigation.navigate("welcome")} style={{backgroundColor: 'transparent', borderRadius: 100, padding: 6, width: 80, display: "flex", justifyContent: "center", alignItems: "center"}} activeOpacity={0.9}>
                    <FastImage source={{uri: whitelogo}} style={{width: 60, height: 60, alignSelf: "flex-start", backgroundColor: "transparent"}} resizeMode="cover" />
                  </TouchableOpacity>
                  <View style={{display: "flex", flexDirection: "column",}}>

                    <TouchableOpacity style={[styles.heading]} activeOpacity={0.99}>
                      <Text  allowFontScaling={false} style={{color: colors.readioWhite, textAlign: 'center'}}>Demo</Text>
                      <Text  allowFontScaling={false} style={styles.heading}>Lotus</Text>
                      <Text  allowFontScaling={false} style={{color: colors.readioWhite, textAlign: "center", fontWeight: "bold"}}>Always Growing</Text>
                    </TouchableOpacity>

                  </View>
                  <TouchableOpacity onPress={() => { setWantsToGetStarted?.(true); navigation.navigate("welcome")} } style={{backgroundColor: colors.readioOrange, marginRight: 20, borderRadius: 100, padding: 6, width: 80, display: "flex", justifyContent: "center", alignItems: "center"}} activeOpacity={0.9}>
                      <Text  allowFontScaling={false} style={{color: colors.readioWhite, fontWeight: "bold"}}>Sign up</Text>
                  </TouchableOpacity>                 
                
                </Animated.View>

                <ScrollView style={{height: "100%", width: "100%"}} showsVerticalScrollIndicator={false}>

                  <View style={{width: "100%", height: 460,}}>
                    

                  {/* NOTE AD CAROUSEL */}
                    <ScrollView showsHorizontalScrollIndicator={false} horizontal style={{width: "100%", backgroundColor: "transparent", paddingHorizontal: 20, marginVertical: 20, overflow: "hidden"}}>
                        {[1,2,3].map((item, index) => (
                        <Animated.View  entering={FadeInUp.duration(300 + (index * 200))} exiting={FadeOutDown.duration(100 + (index * 200))} key={index} style={{width: 300, height: 300, marginRight: 10, backgroundColor: colors.readioBlack, borderRadius: 10, }}>
                          <FastImage source={{uri: whitelogo}} style={{width: 60, height: 60, backgroundColor: "transparent", alignSelf: "flex-end"}} resizeMode="cover" />
                          <LinearGradient
                              colors={[colors.readioBrown,'transparent']}
                              style={{
                                  zIndex: -1,
                                  position: 'absolute',
                                  width: '100%',
                                  height: "100%",
                                  transform: [{rotate: '-180deg'}]
                              }}
                              start={{ x: 0.5, y: 0 }}
                              end={{ x: 0.5, y: 1 }}
                          /> 
                        </Animated.View>
                        ))}
                        <View style={{width: 30, height: 300}}></View>
                    </ScrollView>

                    {/* NOTE ANNOUNCEMENT */}
                    <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(200)} style={{width: "90%", alignSelf: "center", marginTop: 10, padding: 20, borderRadius: 10, backgroundColor: colors.readioBlack,  shadowColor: "#000", shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.35, shadowRadius: 18.84, elevation: 5}}>
                        <View style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                          {/* <Text style={styles.title}>Yo</Text> */}
                          <View style={{display: "flex", width: "80%", flexDirection: "column"}}>
                            <Text  allowFontScaling={false} style={styles.announcmentBigText}>Listen Now</Text>
                            <Text  allowFontScaling={false} style={styles.announcmentSmallText}>Don’t know where to start? Try our very own  curated Lotus station!</Text>
                          </View>

                        <TouchableOpacity activeOpacity={0.90} onPress={handleLotusStationPress}>
                          <View style={{backgroundColor: colors.readioOrange, display: "flex", alignItems: "center", justifyContent: "center", width: 50, height: 50, borderRadius: 600}}>
                              <FontAwesome size={20} color={colors.readioWhite} name="play"/>
                          </View>          
                        </TouchableOpacity>

                        </View>
                      </Animated.View>

                  </View>

                    {/* NOTE EXPLORE BY CATEGORY */}
                  <Animated.View  entering={FadeInDown.duration(200)}  exiting={FadeOutDown.duration(200)}style={{marginTop: 15, paddingHorizontal: 20, paddingVertical: 15, paddingTop: 20,  width: "100%", alignItems: "flex-start"}}>
                    <Text   allowFontScaling={false} style={[styles.title, {fontWeight: "bold", marginBottom: 0, fontSize: 18}]}>Explore by Category</Text>
                  </Animated.View>

                  {/* NOTE STATIONS */}
                  <View style={[styles.stationContainer, {display: "flex", alignItems: "center", alignContent: "center", backgroundColor: 'transparent', paddingBottom: 10, maxHeight: "65%"}]} >
                        <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, width: '100%', backgroundColor: "transparent"}}>
                            {stations?.filter(station => station.name !== "Lotus").map((station, index) => (
                            <Animated.View entering={FadeInDown.duration(200 + (index * 100))} exiting={FadeOutDown.duration(200)}  key={station.id} style={[styles.readioRadioContainer, { marginRight: 12, }]}>
                              
                              <TouchableOpacity onPress={() => handleGoToPlaylist(station?.id)}  activeOpacity={0.9} style={{ width: 140, height: 140, marginBottom: 18, position: 'relative'}}>
                                {/* {stationClicked === true && selectedStationId === station.id && (
                                  <>
                                  <View style={{ width: 170, height: 160, overflow: 'hidden', borderRadius: 10, position: 'absolute', zIndex: 1, backgroundColor: colors.readioOrange}}>
                                  <TouchableOpacity style={{padding: 5}} onPress={() => router.push('/(auth)/features')}>
                                    <FontAwesome name="chevron-right" size={20} color={colors.readioWhite} style={[{zIndex: 2, position: 'absolute',  top: 10, right: 10}]} />
                                  </TouchableOpacity>
                                  </View>
                                  </>
                                )} */}


                                <FastImage source={{uri: filter}} style={[styles.stationImage, {zIndex: 1, opacity: 0.4, position: 'absolute'}]} resizeMode='cover'/>
                          

                                <FastImage source={{uri: station.imageurl}} style={styles.stationImage} resizeMode='cover'/>
                                <View style={{ borderRadius: 100, backgroundColor: colors.readioOrange, position: 'absolute', bottom: 0, left: 10, zIndex: 2, padding: 5, paddingHorizontal: 10 }}>
                                  <Text  allowFontScaling={false} style={styles.stationName} numberOfLines={2}>{stationClicked === true && selectedStationId === station.id ? sutt : station.name}</Text>
                                </View>
                              </TouchableOpacity> 
                            </Animated.View>
                            ))}

                            {stations?.length % 2 !== 0 && (
                              <>
                              <TouchableOpacity activeOpacity={0.9} style={{ width: 140, height: 140, marginBottom: 18}}>

                                <FastImage source={{uri: filter}} style={[styles.stationImage, {zIndex: 1, opacity: 0.4, position: 'absolute'}]} resizeMode='cover'/>
                                <Text  allowFontScaling={false} style={styles.stationName} numberOfLines={2}></Text>
                              </TouchableOpacity>
                              </>
                            )}
                        </View>
                  </View>

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
  fontSize: 45,
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
  fontSize: 20,
  // fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 10,
  color: colors.readioWhite,
  fontFamily: readioRegularFont
},
announcmentBigText: {
  fontSize: 18,
  color: colors.readioWhite,
  fontFamily: readioBoldFont
},
announcmentSmallText: {
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
  // height: 410,
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
  // marginVertical: 5,
  // width: '80%',
  color: colors.readioWhite,
  // position: 'absolute',
  zIndex: 1,
  // bottom: 0,
  // left: 0,
  // transform: [{ translateX: 10 }, { translateY: 10 }],
  fontFamily: readioRegularFont,
  fontSize: 20,
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