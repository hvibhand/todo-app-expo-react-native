import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { changeUserRole } from "../store/actions/settingsActions";

const SettingsScreen = () => {

  const totalLikes = useSelector((state: RootState) => state.dataReducer.totalLikes)
  const userRole = useSelector((state: RootState) => state.settings.userRole)
  const dispatch = useDispatch()

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings Screen</Text>
      <Text style={styles.text}>Total Likes: {totalLikes}</Text>
      <Text style={styles.text}>Role: {userRole}</Text>
      <Button title="Change Role" onPress={() => dispatch(changeUserRole("Visitor"))}/>
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
