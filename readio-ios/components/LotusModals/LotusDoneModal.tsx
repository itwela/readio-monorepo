import { getLocalImageUri } from "@/constants/imageAssets";
import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { useLotusGiantSteps } from "@/helpers/providers/lotusGiantStepsProvider";
import { useLotusHaptic } from "@/helpers/providers/lotusHapticProvider";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, KeyboardAvoidingView, Modal, Pressable, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import LotusGap from "../LotusGap";


// TODO
export function LotusDoneModal() {

    const { isDoneModalVisible, setIsDoneModalVisible } = useLotusGiantSteps()
    const {
        location, setLocation,
        elapsedTime, setElapsedTime,
        steps, setSteps,
        totalDistance, setTotalDistance,
        previousLocation, setPreviousLocation,
        selection, setSelection,
        appState, setAppState,
        search, setSearch,
        speed, setSpeed,
        fetchingLocation, setFetchingLocation,
        errorMsg, setErrorMsg,
        handleClearSearch,
        resetAudio,
        formatTime,
        requestPermissions,
        startTimer,
        stopTimer,
        intervalRef,
        locationSubscription,
        toggleModal,
        sessionSteps,
        sessionTime,
        sessionDistance
    } = useLotusGiantSteps();

    const formatSteps = (steps: number | undefined): string => {
        if (steps === undefined || steps === null) return '0'; // Handle undefined or null
        if (steps < 1000) {
          return steps.toString();
        } else if (steps < 1000000) {
          // For thousands, show one decimal place if not a whole number (e.g., 1.1k, 2k)
          return (steps % 1000 === 0 ? (steps / 1000) : (steps / 1000).toFixed(1)) + 'k';
        } else {
          // For millions, show one decimal place if not a whole number (e.g., 1.1m, 2m)
          return (steps % 1000000 === 0 ? (steps / 1000000) : (steps / 1000000).toFixed(1)) + 'm';
        }
    };


    return (
        <>
<Modal
  animationType="slide"
  transparent={true}
  visible={isDoneModalVisible}
  onRequestClose={toggleModal}
>
  <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
  <Pressable onPress={toggleModal} style={{ width: '100%', height: '100%', position: 'absolute', zIndex: -1, backgroundColor: `${colors.readioBlack}95` }}/>


  <View style={{ 
      width: '100%', 
      height: '70%', 
      backgroundColor: colors.readioBrown, 
      borderTopLeftRadius: 20, 
      borderTopRightRadius: 20,
    }}>
        {/* Logo at top */}
      <View style={{ 
        width: 150, 
        height: 150, 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderRadius: 500, 
        backgroundColor: colors.readioBrown, 
        position: 'absolute', 
        alignSelf: 'center',
        zIndex: 1,
        top: -50
      }}>
        <Image
          style={{ width: 80, height: 80 }}
          source={{ uri: getLocalImageUri('whiteLogo') }}
          resizeMode="contain"
        />
        <LotusGap gapNumber={25} backgroundColor={colors.readioBrown} />
      </View>

      {/* Close button */}
      <View style={{ 
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 10
      }}>
        <TouchableOpacity onPress={toggleModal}>
          <FontAwesome name="close" size={30} color={colors.readioWhite} />
        </TouchableOpacity>
      </View>

      {/* NOTE GIANT STEPS Content container */}
      <View style={{ 
        flex: 1, 
        paddingTop: 90,
        alignItems: 'center',
        zIndex: 2
      }}>
        {/* Date header */}
        <Text allowFontScaling={false} style={{ 
          color: colors.readioWhite, 
          fontSize: 16, 
          fontFamily: readioRegularFont,
          textTransform: 'uppercase',
          letterSpacing: 2,
          marginBottom: 10
        }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
        </Text>

        {/* Large steps count */}
        <Text allowFontScaling={false} style={{ 
          color: colors.readioWhite, 
          fontSize: 80, 
          fontFamily: readioBoldFont,
          lineHeight: 90
        }}>
          {formatSteps(sessionSteps)}
        </Text>

        {/* Steps subtitle */}
        <Text allowFontScaling={false} style={{ 
          color: colors.readioWhite, 
          fontSize: 20, 
          fontFamily: readioRegularFont,
          opacity: 0.8,
          marginBottom: 30
        }}>
          steps this session
        </Text>

        {/* Stats row */}
        <View style={{ 
          flexDirection: 'row', 
          width: '100%', 
          justifyContent: 'space-around',
          marginBottom: 30
        }}>
          {/* Time */}
          <View style={{ alignItems: 'center' }}>
            <Text allowFontScaling={false} style={{ 
              color: colors.readioWhite, 
              fontSize: 32, 
              fontFamily: readioBoldFont 
            }}>
              {formatTime(sessionTime)}
            </Text>
            <Text allowFontScaling={false} style={{ 
              color: colors.readioWhite, 
              fontSize: 16, 
              fontFamily: readioRegularFont,
              opacity: 0.8
            }}>
              TIME
            </Text>
          </View>

          {/* Distance */}
          <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <Text allowFontScaling={false} style={{ 
              color: colors.readioWhite, 
              fontSize: 32, 
              fontFamily: readioBoldFont 
            }}>
              {sessionDistance?.toFixed(2)}
            </Text>
            <Text allowFontScaling={false} style={{ 
              color: colors.readioWhite, 
              fontSize: 16, 
              fontFamily: readioRegularFont,
              top: 5,
              marginLeft: 2
            }}>
              MI
            </Text>
          </View>
        </View>

        {/* Achievement badge */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20
        }}>
          <FontAwesome name="trophy" size={24} color={colors.readioWhite} style={{ marginRight: 10 }} />
          <Text allowFontScaling={false} style={{ 
            color: colors.readioWhite, 
            fontSize: 18, 
            fontFamily: readioRegularFont
          }}>
            Great Job!
          </Text>
        </View>

        {/* Bottom section with fun message */}
        <View style={{
          width: '100%',
          height: 150,
          bottom: 0,
          flex: 1,
          overflow: 'hidden',
          position: 'absolute',
          zIndex: 10
        }}>
          {/* Linear gradient background */}
          <LinearGradient
            colors={[colors.readioOrange, colors.readioBrown]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
          />
          
          {/* Content container */}
          <View style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20
          }}>
            
            {/* <Text allowFontScaling={false} style={{ 
              color: colors.readioWhite, 
              fontSize: 48, 
              fontFamily: readioBoldFont,
              marginBottom: 10,
              textAlign: 'center'
            }}>
              WHOA!
            </Text>
            
            <Text allowFontScaling={false} style={{ 
              color: colors.readioWhite, 
              fontSize: 24, 
              fontFamily: readioRegularFont,
              textAlign: 'center',
              marginBottom: 30
            }}>
              You hoisted that baby like a boss today.
            </Text>

            <TouchableOpacity style={{
              backgroundColor: colors.readioWhite,
              paddingVertical: 15,
              paddingHorizontal: 40,
              borderRadius: 25
            }}>
              <Text allowFontScaling={false} style={{ 
                color: colors.readioBrown, 
                fontSize: 18, 
                fontFamily: readioBoldFont
              }}>
                Tell the World!
              </Text>
            </TouchableOpacity> */}
            
          </View>
        </View>

      </View>

  </View>

  </View>
</Modal>
        </>
    )
}