import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import DataScreen from "../screens/DataScreen";

const Stack = createStackNavigator();

function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="HomeScreen"
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Purple",
        }}
        name="DataScreen"
        component={DataScreen}
      />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
    </Stack.Navigator>
  );
}

export default MainStackNavigator;
