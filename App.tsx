import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Button, View } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {

  var [counter, setCounter] = useState(0);
  const handleCounterIncrease = () => {
    // Increase counter logic here
    setCounter(counter + 1);
  }
  const handleCounterDecrease = () => {
    // Decrease counter logic here
    setCounter(counter - 1);
  }
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Button title="Increase" onPress={handleCounterIncrease} />
      <Text style={{ fontSize: 50, padding: 20 }}>{counter}</Text>
      <Button title="Decrease" onPress={handleCounterDecrease} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
