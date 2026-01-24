import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainStackNavigator } from './src/nacigation/MainStackNavigator';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {

  var [myName, setMyName] = useState("");
  return (
    <NavigationContainer>
      <MainStackNavigator />
    </NavigationContainer>
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
