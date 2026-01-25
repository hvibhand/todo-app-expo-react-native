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
            <View style={styles.button}>
                <Button 
                    title="Go to Gold Screen" 
                    onPress={() => navigation.navigate("Gold")} 
                />
            </View>
            
            <Text 
                style={styles.description}
                onPress={() => navigation.navigate("Gold", {name: "Harshal Vibhandik"})} 
            >Name: Harshal Vibhandik</Text>
            
            <Text 
                style={styles.description}
                onPress={() => navigation.navigate("Gold", {name: "Priyanka Vibhandik"})} 
            >Name: Priyanka Vibhandik</Text>
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
    button: {
        marginTop: 20,
    },
    text: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
    },
    description: {
        fontSize: 20,
        color: '#000',
        marginTop: 20,
    },
});

export default TomatoScreen;