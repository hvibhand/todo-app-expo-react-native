import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, } from 'react-native';
import { s, vs } from 'react-native-size-matters'

const GetStartedScreen = () => {
return (
    <ImageBackground
        source={require('../../assets/Get_Started_Screen_Background.jpg')}
        style={styles.container}
    >
        {/* Black Gradient Overlay */}
        <View style={styles.overlay} />

        {/* Bottom Content */}
        <View style={styles.contentContainer}>
            <Text style={styles.headerText}>You want Authentic, here you go!</Text>
            <Text style={styles.descriptionText}>Find it here, buy it now!</Text>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
        </View>
    </ImageBackground>
);
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    justifyContent: 'flex-end',
},
overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
},
contentContainer: {
    paddingHorizontal: s(20),
    paddingBottom: s(40),
    zIndex: 1,
},
headerText: {
    fontSize: s(34),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: vs(10),
    textAlign: 'center',
},
descriptionText: {
    fontSize: s(16),
    color: '#fff',
    marginBottom: vs(30),
    textAlign: 'center',
},
button: {
    backgroundColor: '#F83758',
    paddingVertical: vs(14),
    paddingHorizontal: s(40),
    borderRadius: 8,
    alignItems: 'center',
},
buttonText: {
    color: '#fff',
    fontSize: s(23),
    fontWeight: '600',
},
});

export default GetStartedScreen;
