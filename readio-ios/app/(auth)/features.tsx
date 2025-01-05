import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { utilStyle } from '@/constants/tokens';
import { colors } from '@/constants/tokens';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import FastImage from 'react-native-fast-image';

export default function Features() {

  const topText = [
    "Organize Your Playlists",
    "Follow Your Curiosity",
    "Discover Lotus Liner Notes",
  ];

  const bottomText = [
    "Save Your Favs",
    "Prompt and Play",
    "Curated Features",
  ];

  const images = [
    "https://companystaticimages.s3.us-east-2.amazonaws.com/boy-sitting-on-chair-and-reaidng-book.png",
    "https://companystaticimages.s3.us-east-2.amazonaws.com/welcome-sign.png",
    "https://companystaticimages.s3.us-east-2.amazonaws.com/woman-listening-songs-on-earphones.png",
  ];

  const handleNextFeature = (index: number) => {
    if (page === topText.length - 1) return;
    setPage(page + 1);
  };

  const handlePreviousFeature = (index: number) => {
    if (page === 0) return;
    setPage(page - 1);
  };

  const [page, setPage] = useState(0);
  const [showQuizButton, setShowQuizButton] = useState(false); // State for Quiz Button

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (page === topText.length - 1) {
        return;
      } else {
        setPage((prevPage) => prevPage + 1);
      }
    }, 2618); // Every 5 seconds (5000 milliseconds)

    return () => clearInterval(intervalId);
  }, [page]); // Dependency on page to update button visibility

  return (
    <>
      <SafeAreaView style={[utilStyle.safeAreaContainer, { backgroundColor: colors.readioWhite, width: "100%", height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }, utilStyle.padding]}>
        <View style={styles.page}>
          <Text  allowFontScaling={false} style={{ fontSize: 40, fontWeight: 'bold', textAlign: 'center' }}>{topText[page]}</Text>
          <Text  allowFontScaling={false} style={{ fontSize: 15, fontWeight: 'bold', textAlign: 'center', marginTop: 10 }}>{bottomText[page]}</Text>
        </View>
        <View style={styles.page}>
          <FastImage source={{ uri: images[page] }} style={{ width: 400, height: 400, marginBottom: 40 }} resizeMode="contain" />
        </View>
        <View style={styles.page}>
          {page === topText.length - 1 && (
            <TouchableOpacity style={{ padding: 10, backgroundColor: colors.readioOrange, borderRadius: 100, width: "100%" }} activeOpacity={0.90} onPress={() => { router.push('/(auth)/quiz') }}>
              <Text  allowFontScaling={false} style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: colors.readioWhite }}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </>
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
});