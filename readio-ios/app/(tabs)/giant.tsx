import LotusGap from "@/components/LotusGap";
import { ReadioTracksList } from "@/components/ReadioTrackList";
import { getLocalImageUri } from "@/constants/imageAssets";
import { colors, giantFont, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { trackTitleFilter } from '@/helpers/filter';
import { generateTracksListId } from "@/helpers/misc";
import { useLotusGiantSteps } from "@/helpers/providers/lotusGiantStepsProvider";
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function GiantScreen() {
  const { 
    selection, 
    search, setSearch,
    handleClearSearch,
    handleStartWalk,
    numberToDigits,
    totalSteps
  } = useLotusGiantSteps();
  const { userArticles } = useLotusUser();
  const filteredTracks = useMemo(() => (search ? userArticles.filter(trackTitleFilter(search)) : userArticles), [search, userArticles]);

  return (
    <>
      <Image
        source={{
          uri: getLocalImageUri("walkingGif"),
        }}
        style={{ zIndex: -2, position: 'absolute', width: '100%', height: '40%' }}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[colors.readioBrown, 'transparent']}
        style={{
          zIndex: -1,
          bottom: '60%',
          position: 'absolute',
          width: '150%',
          height: 450,
          transform: [{ rotate: '-180deg' }],
        }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={{ width: "100%", minHeight: "600%", zIndex: -3, position: "absolute", backgroundColor: colors.readioBrown }} />
      {selection ? (
        <>
          <SafeAreaView style={[styles.safeAreaContainer]}>
            <Animated.View style={styles.container}>
              
              {/* STUB */}
              <StartedWalking
                filteredTracks={filteredTracks}
                search={search}
                setSearch={setSearch}
                handleClearSearch={handleClearSearch}
              />

            </Animated.View>
          </SafeAreaView>
        </>
      ) : (
        <>
          <SafeAreaView style={{ width: '100%', justifyContent: "space-between", height: '100%', alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 2}}>

            {/* REVIEW COUNTER */}
            <View style={{ paddingTop: 40}}>
              
                <Image source={{ uri: getLocalImageUri('whiteLogo') }} style={{  width: 60, height: 60, alignSelf: "center", backgroundColor: "transparent" }} resizeMode="contain" />
                <Text allowFontScaling={false} style={[styles.link, { textAlign: 'center', fontSize: 18 }]}>Lotus</Text>
                <Text allowFontScaling={false} style={[styles.text, { fontFamily: giantFont, fontSize: 35 }]}>GIANT STEPS</Text>

                <View style={[{ display: 'flex', overflow: 'hidden', flexDirection: 'row', gap: 8, justifyContent: 'space-between', marginVertical: 15, paddingHorizontal: 20 }]}>
                  {numberToDigits(totalSteps as number).map((digit: string, index: number) => {
                    return (
                      <View key={index} style={{ borderRadius: 3, borderTopLeftRadius: 10, borderTopRightRadius: 10, opacity: 0.8, width: 32, height: 60, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.readioWhite }}>
                        <Animated.Text allowFontScaling={false} style={[{ color: colors.readioWhite, fontSize: 30, fontFamily: readioBoldFont, fontWeight: 'bold' }]}>
                          {digit}
                        </Animated.Text>
                      </View>
                    );
                  })}
                </View>
                <Text allowFontScaling={false} style={[styles.link, { textAlign: 'center', opacity: 0.5, fontSize: 18 }]}>Every Step Counts.</Text>
                
                <View style={{ width: "100%", backgroundColor: 'transparent', padding: 20, alignItems: 'center' }}>
                
                  <Text allowFontScaling={false} style={[styles.link, { fontSize: 18, textAlign: 'center', marginBottom: 10 }]}>
                    The Giant Steps Campaign is our collective journey to clock 100 million steps, one step at a time.
                  </Text>
                  <Text allowFontScaling={false} style={[styles.link, { fontSize: 18, textAlign: 'center', marginBottom: 20 }]}>
                    Start tracking your steps below to unlock surprises, prizes and access to exclusive rewards.
                  </Text>

                  <LotusGap backgroundColor="transparent" gapNumber={80}/>
              
                </View>

            </View>

            <View style={{paddingHorizontal: 20, alignSelf: 'center', position: 'absolute', bottom: 150, width: '100%'}}>
              <Pressable 
                style={{
                  backgroundColor: colors.readioOrange,
                  borderRadius: 100,
                  width: '100%',
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: colors.readioOrange,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                }} 
                onPress={() => { handleStartWalk() }}
              >
                <Text allowFontScaling={false} style={{
                      color: colors.readioWhite,
                      fontSize: 16,
                      fontFamily: readioBoldFont,
                      letterSpacing: 0.3,
                }}>Start</Text>
              </Pressable>
            </View>

          </SafeAreaView>
        </>

      )}
    </>
  );
}

function StartedWalking({filteredTracks, search, setSearch, handleClearSearch,
}: {
  filteredTracks: any; search: any; setSearch: any; handleClearSearch: any;
}) {

  const { user } = useLotusUser();
  const { 
    formatTime, currentStepCount, elapsedTime,
  } = useLotusGiantSteps();


  return (
    <>
      <View style={{ width: '100%', height: '100%' }}>
        <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'flex-start' }}>
          <LotusGap backgroundColor="'transparent" gapNumber={50} />

          {/* STUB */}
          <Animated.View
            entering={FadeInUp.duration(400)}
            style={{
              display: 'flex',
              flexDirection: 'row',
              opacity: search.length > 0 ? 1 : 0.618,
              backgroundColor: 'transparent',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <TextInput
              allowFontScaling={false}
              style={[
                styles.searchBar,
                { width: search.length > 0 ? '84%' : '99%', color: colors.readioWhite },
              ]}
              placeholder="Listen to your articles while you walk:"
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={colors.readioWhite}
            />
            {search.length > 0 && (
              <Pressable onPress={handleClearSearch}>
                <Text allowFontScaling={false} style={{ color: colors.readioWhite }}>Clear</Text>
              </Pressable>
            )}
          </Animated.View>
          <View style={{ height: 240, width: '100%' }}>
            <ScrollView style={{ height: 240, width: '100%', overflow: 'hidden' }}>
              <ReadioTracksList hideQueueControls id={generateTracksListId('ssongs', search)} tracks={filteredTracks} scrollEnabled={false} />
            </ScrollView>
          </View>
          {/* TODO */}
          <View style={{ width: '100%', position: 'absolute', bottom: '15%', }}>

            <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont }}>Steps</Text>
            <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 60, fontFamily: readioBoldFont }}>{currentStepCount}</Text>
            <Text allowFontScaling={false} style={{ color: 'transparent', fontFamily: readioRegularFont }}>.</Text>

            <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont }}>You've been walking for:</Text>
            <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontSize: 60, fontFamily: readioBoldFont }}>{formatTime(elapsedTime)}</Text>
            <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontFamily: readioRegularFont }}>Your'e taking giant steps!</Text>

          </View>

        </View>

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 20,
  },
  container: {
    padding: 20,
  },
  text: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.readioWhite,
    textAlign: 'center'
  },
  link: {
    color: colors.readioWhite,
    marginBottom: 10,
    fontFamily: readioRegularFont
  },
  blackStat: {
    color: colors.readioWhite,
    fontSize: 56,
    marginVertical: 5,
    fontFamily: readioBoldFont
  },
  stat: {
    color: colors.readioWhite,
    fontSize: 16,
    marginVertical: 5,
    fontFamily: readioRegularFont,
  },
  timeStat: {
    color: colors.readioWhite,
    fontSize: 100,
    marginVertical: 5,
    fontFamily: readioRegularFont,
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginVertical: 10,
  },
  cancel: {
    color: colors.readioWhite,
    fontFamily: readioRegularFont,
  },
  cancelButton: {
    backgroundColor: colors.readioOrange,
    borderRadius: 5,
    padding: 5,
  }
});

