import PagerView from 'react-native-pager-view';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function Features() {
    return (
        <>
        <PagerView style={styles.pagerView} initialPage={0}>
        <View style={styles.page} key="1">
          <Text>First page</Text>
          <Text>Swipe ➡️</Text>
        </View>
        <View style={styles.page} key="2">
          <Text>Second page</Text>
        </View>
        <View style={styles.page} key="3">
            <Text>Second page</Text>
            <Text onPress={() => router.push('/(auth)/quiz')}> Take the quiz</Text>
        </View>
        </PagerView>
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
      },
});