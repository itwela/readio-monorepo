import FastImage from "react-native-fast-image";
import { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { Asset } from 'expo-asset';
import { colors, systemPromptReadio } from "@/constants/tokens";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
import { StyleSheet, View, KeyboardAvoidingView, Modal, Button, TouchableOpacity, ScrollView, Animated as ReactNativeAnimated, RefreshControl, Pressable, ActivityIndicator, LayoutChangeEvent, Keyboard } from "react-native";
import Animated from "react-native-reanimated";

export default function LotuslogoHeader() {
    return (
        <View style={{ display: "flex", flexDirection: "column", }}>

        <TouchableOpacity style={[styles.heading, {backgroundColor: 'transparent', }]} activeOpacity={0.99}>
          {/* <Text style={{color: colors.readioWhite, textAlign: 'center'}}>Demo</Text> */}
          <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center',  justifyContent: 'flex-start'}}>
            <FastImage source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))} style={{ width: 50, height: 50, position: "absolute",  zIndex: 2,   left: -10, top: '-50%', }} resizeMode="cover" />
            <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={{ paddingLeft: 35, fontSize: 20, color: colors.readioWhite, textAlign: "center", fontWeight: "bold" }}>Lotus</Animated.Text>
          </View>
        </TouchableOpacity>

        <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={{ color: colors.readioWhite, opacity: 0.61, textAlign: "center", fontWeight: "bold" }}>Always Growing</Animated.Text>

      </View>
    );
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
      minHeight: '100%',
    },
    heading: {
      fontSize: 40,
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
      paddingHorizontal: 10,
      // position: 'absolute',
      // zIndex: 1,
      // bottom: 0,
      // left: 0,
      // transform: [{ translateX: 10 }, { translateY: 10 }],
      fontFamily: readioRegularFont,
      fontSize: 20
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