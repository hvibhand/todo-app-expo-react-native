import { Button, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { increaseTotalLikesByAmount, increaseTotalLikesByOne } from "../store/reducers/dataReducer";

const HomeScreen = () => {
  const totalLikes = useSelector(state => state.dataReducer.totalLikes)
  const dispatch = useDispatch()

  console.log('====================================');
  console.log(totalLikes); 
  console.log('====================================');
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Total Likes: {totalLikes}</Text>
      <Button title="Increase By One" onPress={() => dispatch(increaseTotalLikesByOne())}/>
      <Button title="Increase By Amount" onPress={() => dispatch(increaseTotalLikesByAmount(8)) }/>
    </View>
  );
};

export default HomeScreen;

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
