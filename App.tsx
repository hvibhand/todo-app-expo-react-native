import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.view1}>
        <Text style={styles.text1}>Hello,</Text>
        <Text style={styles.text1}>World!</Text>
      </View>
      <View style={styles.view2}>
        <View  style={styles.childView}>
          <Text style={styles.text1}>Hello,</Text>
          <Text style={styles.text1}>World!</Text>
        </View>
      </View>
      <View style={styles.view3}>
        <Text style={styles.text1}>Hello,</Text>
        <Text style={styles.text1}>World!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  view1: {
    width: 200,
    height: 200,
    backgroundColor: '#ff6347',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  view2: {
    width: 150,
    height: 150,
    backgroundColor: '#4682b4',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  view3: {
    width: 150,
    height: 150,
    backgroundColor: '#32cd32',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  childView: {
    backgroundColor: '#ffa500',
    padding: 10,  
  },
  text1: {
    fontSize: 30,
    color: 'darkblue',
  },
});
