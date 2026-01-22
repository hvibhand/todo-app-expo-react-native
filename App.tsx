import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform} from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>This is {Platform.OS === "android" ? "Android" : "iOS"} Device</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Platform.OS === "android" ? "#f0f8ff" : "#fff",
    alignItems: 'center',
    justifyContent: 'center',
  },
});
