import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    // Flex
    /*
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 2, backgroundColor: 'tomato' }}/>
      <View style={{ flex: 1, backgroundColor: 'blue' }}/>
      <View style={{ flex: 1, backgroundColor: 'gold' }}/>
    </View>
    */
    
    // Flex Direction - space evenly
    /*
    <View style={{ 
      flex: 1, 
      flexDirection: 'column', 
      backgroundColor: 'white',
      justifyContent: 'space-evenly',
      alignItems: 'center'
    }}>
      <View style={{ width: 100, height: 100, backgroundColor: 'tomato' }}/>
      <View style={{ width: 100, height: 100, backgroundColor: 'blue' }}/>
      <View style={{ width: 100, height: 100, backgroundColor: 'gold' }}/>
    </View>
    */

    // Flex Direction - row center
    /*
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
    */

    // Flex Wrap
    <View style={{ 
      flex: 1, 
      flexDirection: 'row', 
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      <View style={{ width: 100, height: 100, backgroundColor: 'tomato' }}/>
      <View style={{ width: 100, height: 100, backgroundColor: 'gray' }}/>
      <View style={{ width: 100, height: 100, backgroundColor: 'blue' }}/>
      <View style={{ width: 100, height: 100, backgroundColor: 'green' }}/>
      <View style={{ width: 100, height: 100, backgroundColor: 'gold' }}/>
    </View>
  );
}
