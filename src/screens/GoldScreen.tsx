import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const GoldScreen = () => {
    
    const navigation = useNavigation();
    
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Gold Screen</Text>
            <Button 
                title="Go to Purple Screen" 
                onPress={() => navigation.navigate("Purple")} 
            />
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
    text: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default GoldScreen;