import { Button, StyleSheet, Text, View } from "react-native";
import {useSelector, useDispatch} from "react-redux"
import { increaseTotalLikes, increaseTotalLikesByAmount } from "../store/actions/dataActions";
import { RootState } from "../store/store";

const HomeScreen = () => {

  const totalLikes = useSelector((state: RootState) => state.dataReducer.totalLikes)
  const userName = useSelector((state: RootState) => state.dataReducer.userName)

  const dispatch = useDispatch()


  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
      <Text style={styles.text}>Total Likes: {totalLikes}</Text>
      <Text style={styles.text}>User Name: {userName}</Text>
      <Button title="+" onPress={() => dispatch(increaseTotalLikes())}/>

      <Button title="Increase Likes By Amount" 
              onPress={() => dispatch(increaseTotalLikesByAmount(80))}
              
              />
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
