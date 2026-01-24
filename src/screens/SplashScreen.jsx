import React from 'react';
import { View, StyleSheet } from 'react-native';
import SplashLogo from '../components/SplashLogo';

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <SplashLogo />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
});
