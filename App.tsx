import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {

  const handlePressablePress = () => {
    alert('Pressable Pressed!');
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{alignItems: 'center'}}
      >
        <Image
          source={require('./assets/icon.png')}
          style={styles.image1}
        />
        <Image
          source={require('./assets/icon.png')}
          style={styles.image1}
        />
        <Image
          source={require('./assets/icon.png')}
          style={styles.image1}
        />
        <Image
          source={require('./assets/icon.png')}
          style={styles.image1}
        />
        <Image
          source={require('./assets/icon.png')}
          style={styles.image1}
        />
        <Image
          source={require('./assets/icon.png')}
          style={styles.image1}
        />
        <Image
          source={require('./assets/icon.png')}
          style={styles.image1}
        />
        <Image
          source={require('./assets/icon.png')}
          style={styles.image1}
        />
        <Image
          source={require('./assets/icon.png')}
          style={styles.image1}
        />
        <Image
          source={require('./assets/icon.png')}
          style={styles.image1}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image1: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    margin: 20
  },
  image2: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 100
  },
});
