import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const GoldScreen = () => {
    
    const navigation = useNavigation();
    const {name, params} = useRoute();
    
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Gold Screen</Text>
            <View style={styles.button}>
                <Button 
                    title="Go to Purple Screen" 
                    onPress={() => navigation.navigate("Purple")} 
                />
            </View>
            <Text style={styles.description}>Name passed: {params?.name}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'gold',
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

export default GoldScreen;