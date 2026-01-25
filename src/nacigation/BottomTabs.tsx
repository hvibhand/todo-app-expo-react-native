import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TomatoScreen from '../screens/TomatoScreen';
import GoldScreen from '../screens/GoldScreen';
import PurpleScreen from '../screens/PurpleScreen';
import Entypo from '@expo/vector-icons/Entypo';

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ 
        headerShown: true,
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen options={{ title: "Tomato", tabBarIcon: ({ color, size }) => <Entypo name="home" size={size} color={color} /> }} name="Tomato" component={TomatoScreen} />
      <Tab.Screen options={{ title: "Gold", tabBarIcon: ({ color, size }) => <Entypo name="star" size={size} color={color} /> }} name="Gold" component={GoldScreen} />
      <Tab.Screen options={{ title: "Purple", tabBarIcon: ({ color, size }) => <Entypo name="heart" size={size} color={color} /> }} name="Purple" component={PurpleScreen} />
    </Tab.Navigator>
  );
}

export default MyTabs;