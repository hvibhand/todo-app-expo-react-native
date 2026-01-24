import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WelcomeText: React.FC = () => {
    return (
        <View>
            <Text style={styles.welcomeText}>
                Welcome to
            </Text>
            <Text style={styles.myAppText}>
                My App
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    welcomeText: {
        fontSize: 40,
        textAlign: 'center',
        marginTop: 20,
        color: '#333',
        fontWeight: '500',
    },
    myAppText: {
        fontSize: 40,
        textAlign: 'center',
        color: 'tomato',
        fontWeight: '500',
    },
});

export default WelcomeText;