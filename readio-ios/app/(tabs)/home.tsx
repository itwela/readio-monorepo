import { colors } from "@/constants/tokens";
import { StyleSheet } from "react-native";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
import { Text, View } from "react-native";

export default function HomeTabOne() {
  return (
    <>
      <View style={styles.container}>
        <View style={styles.animatedBorder} />
        <View style={styles.toast}>
          <Text style={styles.heading}>Readio</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: colors.readioBrown,
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
  }
});
