import { getLocalImageUri, ImageAssets } from "@/constants/imageAssets";
import { colors, readioBoldFont } from "@/constants/tokens";
import { setStateAsync } from "@/constants/utilityFunctions";
import { useProgressQueue } from "@/handleArticleGenerations/processingQueue";
import { useLotusModal } from "@/helpers/providers/lotusModalContext";
import { useLotusSettings } from "@/helpers/providers/lotusSetingsProvider";
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import { FontAwesome } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { default as React, useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View, Image, FlexStyle } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { AnnouncementPopup } from "./LotusAnnouncement";
import { IconSymbol } from "./ui/IconSymbol";
import { useLotusUtils } from "@/helpers/providers/lotusUtilsContext";
import MaskedView from '@react-native-masked-view/masked-view';

interface LotusHeaderProps {
  backgroundColor: string,
  isArticleGenerating?: boolean,
}

  // TODO
  // The header needs to know that we are in demo or not because I need to hide a certain things and add certain functionality to it based on it being in the demo versus the actual web so I'll just add something in the details for like isInDemo or something
export default function LotusHeader({
  backgroundColor,
}: LotusHeaderProps) {


  const { isArticleGenerating, setIsArticleGenerating, isArticleModalVisible, setIsArticleModalVisible, setArticleGenerationStatus, setWantsToMakeAnArticle, wantsToMakeAnArticle, articleGenerationStatus } = useLotusModal()
  const { user } = useLotusUser()
  const { setSettingsOpen, settingsOpen } = useLotusSettings()
  const { currentRouteName } = useLotusUtils()


  // TODO THIS WILL EVENTUALLY PLAY THE NEWLY MADE ARTICLE AND OPEN THE PLAYER
  const [play, setPlay] = React.useState(true)

  const [currentHeaderText, setCurrentHeaderText] = React.useState<string>('Lotus')

  // const [currentVideoUri, setCurrentVideoUri] = React.useState<string>(ImageAssets.brownGradientVid)
  const [currentOpacityValue_Video, setCurrentOpacityValue_Video] = React.useState<number>(0)
  const [firstVideoZIndex, setFirstVideoZIndex] = React.useState<number>(-2)
  const [secondVideoZIndex, setSecondVideoZIndex] = React.useState<number>(-3)

  const [currentOpacityValue_BorderBottom, setCurrentOpacityValue_BorderBottom] = React.useState<number>(0.5)
  const [currentHeightValue_BorderBottom, setCurrentHeightValue_BorderBottom] = React.useState<number>(1)
  const [currentBackgroundColorValue_BorderBottom, setCurrentBackgroundColorValue_BorderBottom] = React.useState<string>(`${colors.readioWhite}`)
  const [stepKey, setStepKey] = React.useState(10)
  const [isArticleDoneNow, setIsArticleDoneNow] = React.useState(false)
  const router = useRouter();

  const [testStateSwitch, setTestStateSwitch] = React.useState(true)


  // NOTE How I am consistently chaining many things together to animate layouts:
  /*
  The Challenge:
  In React Native, managing sequential state updates and animations is complex due to the lack of a DOM. Unlike web applications, we can't rely on DOM mutations to track changes.

  The Solution:
  I've implemented a Promise-based state management approach that:
  1. Ensures predictable order of state updates
  2. Provides guaranteed completion of each step
  3. Maintains readable and maintainable code

  Key Benefits:
  - Synchronous-like behavior using async/await
  - Guaranteed order of visual updates
  - Better control over animation sequences
  - Simplified debugging and state tracking

  Implementation:
  Using setStateAsync wrapper, each state update returns a Promise, allowing us to:
  1. Chain state updates sequentially
  2. Wait for each update to complete
  3. Handle complex animation sequences reliably
  */
  useEffect(() => {

    const handleDynamicStyleValues = async () => {

      if (isArticleGenerating === true) {
        setStepKey(20)
        await setStateAsync(setCurrentHeaderText, "Your article is on the way!", 'affectsSomethingVisual')
        await setStateAsync(setCurrentBackgroundColorValue_BorderBottom, '#DB581A', 'affectsSomethingVisual')
        await setStateAsync(setCurrentHeightValue_BorderBottom, 5, 'affectsSomethingVisual')

        await setStateAsync(setCurrentOpacityValue_Video, 1, 'affectsSomethingVisual')

        return
      }

      if (articleGenerationStatus === 'done') {
        setStepKey(30)

        await setStateAsync(setCurrentHeaderText, "Done! Tap to play!", 'affectsSomethingVisual')
        await setStateAsync(setCurrentOpacityValue_BorderBottom, 1, 'affectsSomethingVisual')
        await setStateAsync(setCurrentBackgroundColorValue_BorderBottom, '#DB581A', 'affectsSomethingVisual')
        await setStateAsync(setCurrentHeightValue_BorderBottom, 5, 'affectsSomethingVisual')
        await setStateAsync(setIsArticleDoneNow, true, 'affectsSomethingVisual')

        return
      } 
      
    }

    handleDynamicStyleValues()

  }, [isArticleGenerating, articleGenerationStatus])

  useEffect(() => {
    const handleRestHeader = async () => {
      if (isArticleDoneNow === true) {
        // Set a timeout to reset header after 1 minute
        setTimeout(async () => {
          await setStateAsync(setCurrentHeaderText, "Lotus", 'affectsSomethingVisual')
          // await setStateAsync(setCurrentVideoUri, '', 'affectsSomethingVisual')
          await setStateAsync(setCurrentOpacityValue_Video, 0, 'affectsSomethingVisual')
          await setStateAsync(setCurrentOpacityValue_BorderBottom, 0.5, 'affectsSomethingVisual')
          await setStateAsync(setCurrentHeightValue_BorderBottom, 1, 'affectsSomethingVisual')
          await setStateAsync(setCurrentBackgroundColorValue_BorderBottom, '#E9E0C1', 'affectsSomethingVisual')

          await setStateAsync(setIsArticleDoneNow, false, 'affectsSomethingVisual')
          await setStateAsync(setArticleGenerationStatus, '', 'affectsSomethingVisual')
  
        }, 60000) // 60000ms = 1 minute
      }
    }

    handleRestHeader()

  }, [isArticleDoneNow])

  const handleGoHome = async () => {
    await setStateAsync(setSettingsOpen, false, 'affectsSomethingVisual')
    router.push("/(tabs)/(home)/home")
  }


  const handlePlayNewArticle = () => {
    
  }

  const handlePress = async () => {

    await handleGoHome()

  }



  return (
    <>
    <View style={{ 
      display: "flex", 
      backgroundColor: currentRouteName === "giant" ? 'transparent' : backgroundColor, 
      height: 120,
      width: "100%",
      position: 'relative',
    }}>

      {/* Video layer - only rendered if there's a video source */}
        <Animated.View 
          key={stepKey}
          entering={FadeInUp.duration(300)}
          exiting={FadeOutDown.duration(300)}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        >

        <View style={{position: 'relative', overflow: 'hidden', width: '100%', height: '95%', display: 'flex', flexDirection: 'column'}}>  
          
          {/* TODO Video --- soon to be depreciated migrate to expo-video */}

            <Video
              source={ImageAssets.lotusPondVid}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted
              style={{ 
                width: '100%', height: '100%',
                position: 'absolute',
                top: 0,
              
                opacity: currentRouteName === 'giant' ? 0 : currentOpacityValue_Video,
                zIndex: -2,
              }}
          />
      

        <LinearGradient
          colors={[
            'rgba(0,0,0,0)',
            'rgba(0,0,0,0.7)',
            colors.readioBrown,
          ]}
          locations={[0, 0.5, 1]}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            opacity: currentRouteName === 'giant' ? 0 : isArticleGenerating ? 1 : articleGenerationStatus === 'done' ? 1 : 0,
            zIndex: 1,
          }}
        />

        </View>

        

        {/* Border */}
        <View style={{
          position: 'absolute', 
          width: '100%', 
          height: currentHeightValue_BorderBottom, 
          backgroundColor: currentBackgroundColorValue_BorderBottom,
          opacity: currentRouteName === 'giant' ? 0 : currentOpacityValue_BorderBottom,
          bottom: 0,
          zIndex: 2,
        }}/>

        </Animated.View>
      {/* Gradient overlay - always present but opacity controlled by state */}
    


      {/* Content layer - consistent structure */}
      <Animated.View 
        entering={FadeInUp.duration(300)}
        exiting={FadeOutDown.duration(300)}
        style={{ 
          flex: 1,
          justifyContent: 'flex-end',
          paddingBottom: 20,
          paddingHorizontal: 20
        }}
      >
        <View 
          style={{flexDirection: 'row', gap: 10, alignItems: 'center', width: '100%', justifyContent: 'space-between'}}
        >

          <Pressable onPress={handlePress} style={{backgroundColor: 'transparent', flexDirection: 'row', width: '75%', gap: 10, alignItems: 'center'}}>

              {/* Icon/Logo section */}
              {isArticleGenerating ? (
                <ActivityIndicator color={colors.readioWhite}/>
              ) : articleGenerationStatus === 'done' ? (
                <FontAwesome name={play ? 'play' : 'pause'} size={20} color={colors.readioWhite}/>
              ) : (
                <Image
                  source={ImageAssets.whiteLogo}
                  style={{ width: 30, height: 30 }}
                  resizeMode='contain'
                />
              )}

              {/* Text section */}
              <Text allowFontScaling={false} style={{ 
                color: colors.readioWhite, 
                opacity: 0.91, 
                fontSize: 18, 
                fontWeight: "bold"
              }}>
                {currentHeaderText}
              </Text>

          </Pressable>

          <View style={{backgroundColor: 'transparent', flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-end'}}>

              {/* <Pressable
                onPress={() => {
                  testHeaderStates()
                }}
              >
                <View style={{backgroundColor: 'transparent', position: 'absolute', alignSelf:'center', top: 0, padding: 5, alignContent: 'center', alignItems: 'center'}}>
                      <IconSymbol
                      name="bell.fill"
                      color={colors.readioWhite}
                      size={24}
                    />
                </View>
              </Pressable> */}

            {/* TODO HOME + UPDATE ALL CONDITIONS CORRECTLY */}
            <Pressable onPress={() => {handleGoHome()}} style={{backgroundColor: 'transparent', flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-end'}}>
                <View style={{backgroundColor: 'transparent', padding: 5, alignContent: 'center', alignItems: 'center'}}>
                      <IconSymbol 
                      name="house.fill"
                      color={currentRouteName === '(home)' ? colors.readioOrange : colors.readioWhite}
                      size={24}
                    />
                </View>
            </Pressable>

            {/* TODO PROFILE + SETTINGS WILL GO BACK TO BEING A ROUTE AGAIN + UPDATE ALL CONDITIONS CORRECTLY */}
            <Pressable onPress={() => {setSettingsOpen(!settingsOpen)}} style={{backgroundColor: 'transparent', flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-end'}}>
                <View style={{backgroundColor: 'transparent', padding: 5, alignContent: 'center', alignItems: 'center'}}>
                      <IconSymbol 
                      name="person.fill"
                      color={settingsOpen ? colors.readioOrange : colors.readioWhite}
                      size={24}
                      style={{transform: [{scale: 0.9}]}}
                    />
                </View>
            </Pressable>
       
          </View>


        </View>

      </Animated.View>


    </View>
      <AnnouncementPopup/>
    </>
  )
}

