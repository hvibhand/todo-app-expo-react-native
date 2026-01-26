import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useDispatch, useSelector } from "react-redux";


const SettingsScreen = () => {


  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings Screen</Text>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 30,
  },
});
