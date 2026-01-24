import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Button, TextInput } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {

  var [myName, setMyName] = useState("");
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <TextInput 
        placeholder="Enter your name here..." 
        style={{ 
            height: 40, 
            borderColor: 'gray', 
            borderWidth: 1, 
            width: '80%', 
            marginBottom: 20, 
            paddingHorizontal: 10 
          }}
        editable
        onChangeText={(text) => setMyName(text)}
        />
      <Text style={{ fontSize: 20, padding: 20 }}>My name is {myName}</Text>
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
});
