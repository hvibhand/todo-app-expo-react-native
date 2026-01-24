import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GoldScreen from '../screens/GoldScreen';
import TomatoScreen from '../screens/TomatoScreen';
import PurpleScreen from '../screens/PurpleScreen';

const Stack = createStackNavigator();

export const MainStackNavigator = () => {
    return (
        <Stack.Navigator
            /*screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#f4511e',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}*/
        >
            <Stack.Screen
                name="Tomato"
                component={TomatoScreen}
                options={{ title: 'Tomato' }}
            />
            <Stack.Screen
                name="Gold"
                component={GoldScreen}
                options={{ title: 'Gold' }}
            />
            <Stack.Screen
                name="Purple"
                component={PurpleScreen}
                options={{ title: 'Purple' }}
            />
        </Stack.Navigator>
    );
};