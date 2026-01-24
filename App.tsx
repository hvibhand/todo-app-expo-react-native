import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import GetStartedScreen from './src/screens/GetStartedScreen';
import DashboardScreen from './src/screens/DashboardScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Swiper
        loop={false}
        showsPagination={false}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
      >
        <View style={styles.slide}>
          <SplashScreen />
        </View>
        <View style={styles.slide}>
          <LoginScreen />
        </View>
        <View style={styles.slide}>
          <GetStartedScreen />
        </View>
        <View style={styles.slide}>
          <DashboardScreen />
        </View>
      </Swiper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
  },
  dot: {
    backgroundColor: 'rgba(0,0,0,.2)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  activeDot: {
    backgroundColor: '#000',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
});
