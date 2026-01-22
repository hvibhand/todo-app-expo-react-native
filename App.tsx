import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titleText} >Title</Text>
      <Text
        style={styles.textStyle}
      >
        <Text
          style={styles.linkText}
          numberOfLines={3}
          onPress={() => alert('Text Pressed!')}
        >
          Press Here
        </Text>
        consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Text>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginTop: 20,
  },
  textStyle: {
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'justify',
    color: '#333',
    marginTop: 20,
  },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
