import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type RootStackParamList = {
    Tomato: "Tomato";
    Gold: "Gold";
    Purple: "Purple";
};

const TomatoScreen = () => {

    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Tomato Screen</Text>
            <Button 
                title="Go to Gold Screen" 
                onPress={() => navigation.navigate("Gold")} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'tomato',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default TomatoScreen;