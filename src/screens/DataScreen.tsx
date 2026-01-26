import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const DataScreen = () => {

  const totalLikes = useSelector((state: RootState) => state.dataReducer.totalLikes)

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Data Screen</Text>
      <Text style={styles.text}>Total Likes: {totalLikes}</Text>
    </View>
  );
};

export default DataScreen;

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
