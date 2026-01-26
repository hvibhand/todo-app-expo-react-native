import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import HomeScreen from "../screens/HomeScreen";
import DataScreen from "../screens/DataScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "dodgerblue",
        tabBarInactiveTintColor: "#A7CCF6",
        tabBarStyle: {
          backgroundColor: "#fff",
        },
        tabBarLabelStyle: {
          fontSize: 15,
          fontWeight: "bold",
        },
      }}
    >
      <Tab.Screen
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={24} color={color} />
          ),
        }}
        name="HomeScreen"
        component={HomeScreen}
      />
      <Tab.Screen
        options={{
          title: "Data",
          tabBarIcon: ({ color }) => (
            <AntDesign name="profile" size={24} color={color} />
          ),
        }}
        name="DataScreen"
        component={DataScreen}
      />
      <Tab.Screen
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Feather name="settings" size={24} color={color} />
          ),
        }}
        name="SettingsScreen"
        component={SettingsScreen}
      />
    </Tab.Navigator>
  );
}
