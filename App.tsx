import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Image, Button } from 'react-native';
import { TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {

  const handlePressablePress = () => {
    alert('Pressable Pressed!');
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Pressable onPress={handlePressablePress}>
        <Image
          source={require('./assets/icon.png')}
          style={styles.image1}
        />
      </Pressable>
      <TouchableOpacity onPress={() => alert('TouchableOpacity Pressed!')}>
        <Image
          source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
          style={styles.image2}
        />
      </TouchableOpacity>
      <Button
        title="Press Me"
        onPress={() => alert('Button Pressed!')}
      />
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
    marginTop: 20
  },
  image2: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 100
  },
});
