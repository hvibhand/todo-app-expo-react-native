import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PurpleScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Purple Screen</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'purple',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default PurpleScreen;