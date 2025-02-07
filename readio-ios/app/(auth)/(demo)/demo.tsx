import { SafeAreaView } from 'react-native-safe-area-context'; 
import { utilStyle, buttonStyle } from "@/constants/tokens";
import { Text, ScrollView, View, Button, TouchableOpacity, StyleSheet, Animated as ReactNativeAnimated, Pressable, ActivityIndicator } from "react-native";
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
import { bookshelfImg, filter, croplogowhite } from '@/constants/images';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { set } from 'ts-pattern/dist/patterns';
import  Animated, { FadeInDown, FadeInUp, FadeOut, FadeOutDown, FadeOutUp } from "react-native-reanimated";
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
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
  const [featureArticleName, setFeatureArticleName] = useState('')
  const [featureArticleImage, setFeatureArticleImage] = useState('')

  useEffect(() => {
    const getFeatureArticleName =  async () => {
      const articleId = 0
      const data = await sql`SELECT * FROM readios WHERE id = ${articleId} ORDER BY id DESC LIMIT 1`;
      setFeatureArticleName(data[0]?.title)
      setFeatureArticleImage(data[0]?.image)
    }

    getFeatureArticleName()
  }, [])
  
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



  const {wantsToGetStarted, setWantsToGetStarted} = useReadio()
  const {setReadioSelectedPlaylistId, linerNoteTopic, setLinerNoteTopic, setClickedFromHome, setClickedFromLibrary} = useReadio()


  const handleGoToLinerNotes = async (id: any)  => {
    TrackPlayer.reset()
    setLinerNoteTopic?.("Lotus Liner Notes")
    router.push('/(auth)/:demoInterestId')
  }

  const [imagesLoaded, setImagesLoaded] = useState(0)
  const [screenIsReady, setScreenIsReady] = useState(false)

  useEffect(() => {
    if (imagesLoaded > 1) {
        setTimeout(()=> {
            setScreenIsReady(true)
        }, 1000)
    }
  }, [imagesLoaded, screenIsReady, setScreenIsReady])



    return (
        <>

            {screenIsReady === false && (
                <>
                <Animated.View  exiting={FadeOut.duration(1500)} style={{position: 'absolute', bottom: 0, zIndex: 1, width: '100%', height: '100%', justifyContent: 'center', gap: 10, backgroundColor: colors.readioBrown}}>
                    
                    <View style={{position: 'absolute', top: 0, left: 0, padding: 30, paddingTop: 60}}>
                      <Animated.Text  entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)}  allowFontScaling={false} style={styles.heading}>Lotus</Animated.Text>
                      <Animated.Text  entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)}  allowFontScaling={false} style={{color: colors.readioWhite, textAlign: "center", fontWeight: "bold"}}>Always Growing</Animated.Text>
                    </View>
                    
                    <Animated.Text  exiting={FadeOutUp.duration(100)} style={{alignSelf: 'center', color: colors.readioWhite, fontFamily: readioRegularFont, fontSize: 13}}>Were loading your experience...</Animated.Text>
                    <ActivityIndicator size="large" color={colors.readioWhite} />
                </Animated.View>
                </>
            )}

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
                  
                  <TouchableOpacity onPress={() => {TrackPlayer.reset(); navigation.navigate("welcome");}} style={{backgroundColor: 'transparent', borderRadius: 100, padding: 6, width: 80, display: "flex", justifyContent: "center", alignItems: "center"}} activeOpacity={0.9}>
                    <FastImage source={{uri: croplogowhite}} style={{width: 60, height: 60, alignSelf: "flex-start", backgroundColor: "transparent"}} resizeMode="cover" />
                  </TouchableOpacity>
                  <View style={{display: "flex", flexDirection: "column",}}>

                    <TouchableOpacity style={[styles.heading]} activeOpacity={0.99}>
                      <Text  allowFontScaling={false} style={{color: colors.readioWhite, textAlign: 'center'}}>Demo</Text>
                      <Text  allowFontScaling={false} style={styles.heading}>Lotus</Text>
                      <Text  allowFontScaling={false} style={{color: colors.readioWhite, textAlign: "center", fontWeight: "bold"}}>Always Growing</Text>
                    </TouchableOpacity>

                  </View>
                  <TouchableOpacity onPress={() => { setWantsToGetStarted?.(true); TrackPlayer.reset(); navigation.navigate("welcome")} } style={{backgroundColor: colors.readioOrange, marginRight: 20, borderRadius: 100, padding: 6, width: 80, display: "flex", justifyContent: "center", alignItems: "center"}} activeOpacity={0.9}>
                      <Text  allowFontScaling={false} style={{color: colors.readioWhite, fontWeight: "bold"}}>Sign up</Text>
                  </TouchableOpacity>                 
                
                </Animated.View>

                <ScrollView style={{height: "100%", width: "100%"}} showsVerticalScrollIndicator={false}>

                  <View style={{width: "100%"}}>
                    

                  {/* NOTE AD CAROUSEL */}
                    <ScrollView showsHorizontalScrollIndicator={false} horizontal style={{width: "100%", backgroundColor: "transparent", paddingHorizontal: 20, marginVertical: 20, overflow: "hidden"}}>
                        {[1,2,3].map((item, index) => (
                        <Animated.View  entering={FadeInUp.duration(300 + (index * 200))} exiting={FadeOutDown.duration(100 + (index * 200))} key={index} style={{width: 300, height: 300, marginRight: 10, backgroundColor: colors.readioBlack, borderRadius: 10, }}>
                          <FastImage source={{uri: croplogowhite}} style={{width: 60, height: 60, backgroundColor: "transparent", alignSelf: "flex-end"}} resizeMode="cover" />
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
                    <View>
                          
                          <View style={{width: "90%", alignSelf: "center", marginTop: 10}}>
                            <Text allowFontScaling={false} style={[styles.announcmentSmallText, {opacity: 0.5}]}>Featured Articles</Text>
                            <Text allowFontScaling={false} style={[styles.announcmentBigText, {fontSize: 20}]}>{featureArticleName.trim()}</Text>
                            <Text allowFontScaling={false} style={[styles.announcmentSmallText, {opacity: 0.5, fontSize: 20}]}>Check out this article and more!</Text>
                          </View>
                        
                          <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(200)}  style={{width: "90%", alignSelf: "center", paddingVertical: 20, borderRadius: 10,  shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 18.84, elevation: 5}}>

                        <Pressable onPress={handleGoToLinerNotes} style={{display: "flex", height: 200, width: "100%", flexDirection: "row", alignItems: "center",  justifyContent: "space-between"}}>
                        <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={{uri: featureArticleImage}} resizeMode='cover' style={{position: 'absolute', zIndex: -2, borderRadius: 10, width: "100%",  height: "100%"}}/>
                            <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={{uri: filter}} resizeMode='center' style={{position: 'absolute', borderRadius: 10, zIndex: -2, width: "100%", height: "100%", opacity: 0.4}}/>
                            <LinearGradient
                                colors={[colors.readioBrown,'transparent']}
                                style={{
                                    zIndex: -1,
                                    bottom: 0,
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    transform: [{rotate: '-180deg'}]
                                }}
                                start={{ x: 0.5, y: 0 }}
                                end={{ x: 0.5, y: 1 }}
                            /> 
                            <View style={{display: "flex", padding: 10, alignSelf: 'flex-end', width: "95%", flexDirection: "column"}}>
                              <Text  allowFontScaling={false} style={styles.announcmentSmallText}>Lotus Liner Notes is our featured smart audio article series rubricated by Stic of dead prez for instant insights and inspiration.</Text>
                            </View>
                            <Pressable style={{top: 10, position: "absolute", right: 10, display: 'flex', alignItems: 'flex-end',  flexDirection: 'row', gap: 10}}>
                              <Text  allowFontScaling={false} style={styles.announcmentBigText}>Listen</Text>
                              <FontAwesome name="chevron-right" style={{color: colors.readioWhite, fontWeight: "bold", fontSize: 18}}/>
                            </Pressable>

                          </Pressable>

                        </Animated.View>

                        </View>
                        
                        <View style={{height: 100}}/>

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