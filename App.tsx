import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ 
      flex: 1, 
      flexDirection: 'row', 
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <View style={{ width: 100, height: 100, backgroundColor: 'tomato' }}/>
      <View style={{ width: 100, height: 100, backgroundColor: 'blue' }}/>
      <View style={{ width: 100, height: 100, backgroundColor: 'gold' }}/>
    </View>
  );
}
