import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FontAwesome, Feather, AntDesign, FontAwesome5} from "@expo/vector-icons"
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,} from 'react-native';
import GoogleIcon from '../icons/GoogleIcon';
import AppleIcon from '../icons/AppleIcon';
import FacebookIcon from '../icons/FacebookIcon';
import { s, vs } from 'react-native-size-matters'

const LoginScreen = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);

return (
    <ScrollView style={styles.container}>
        <Text style={styles.header}>Welcome Back!</Text>

        {/* Email Field */}
        <View style={styles.inputContainer}>
            <FontAwesome5 name="user-alt" size={16} color="#666" style={styles.icon}/>
            <TextInput
                style={styles.input}
                placeholder="Username or Email"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#999"
            />
        </View>

        {/* Password Field */}
        <View style={styles.inputContainer}>
            <FontAwesome5 name="lock" size={16} color="#666" style={styles.icon}/>
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <FontAwesome5 
                    name={showPassword ? 'eye' : 'eye-slash'} 
                    size={16} color="#666" 
                    style={styles.icon}
                />
            </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* Divider */}
        <Text style={styles.divider}>- OR Continue with -</Text>

        {/* Social Login Icons */}
        <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialIcon}>
                <GoogleIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
                <AppleIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
                <FacebookIcon />
            </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Create An Account - </Text>
            <TouchableOpacity>
                <Text style={styles.signupLink}>SignUp</Text>
            </TouchableOpacity>
        </View>
    </ScrollView>
);
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    padding: s(20),
    backgroundColor: '#fff',
},
header: {
    fontSize: s(28),
    fontWeight: 'bold',
    marginBottom: vs(30),
    marginTop: vs(20),
    color: '#000',
},
inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: s(1),
    borderColor: '#A8A8A9',
    borderRadius: s(10),
    paddingHorizontal: s(15),
    marginBottom: vs(15)    ,
    backgroundColor: '#f9f9f9',
},
icon: {
    marginRight: s(10),
},
input: {
    flex: 1,
    paddingVertical: vs(12),
    fontSize: s(16),
    color: '#000',
},
forgotPassword: {
    color: '#F83758',
    textAlign: 'right',
    marginBottom: vs(20),
    fontSize: s(14),
},
loginButton: {
    backgroundColor: '#F83758',
    paddingVertical: vs(15),
    borderRadius: s(10),
    alignItems: 'center',
    marginVertical: vs(25),
},
loginButtonText: {
    color: '#fff',
    fontSize: s(20),
    fontWeight: '600',
},
divider: {
    textAlign: 'center',
    color: '#575757',
    marginVertical: vs(20),
    fontSize: s(14),
},
socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: vs(30),
    gap: s(20),
},
socialIcon: {
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    borderWidth: s(1),
    borderColor: '#F83758',
    alignItems: 'center',
    justifyContent: 'center',
},
signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: vs(30),
},
signupText: {
    color: '#575757',
    fontSize: s(14),
},
signupLink: {
    color: '#F83758',
    fontSize: s(14),
    fontWeight: '600',
    textDecorationLine: 'underline',
},
});

export default LoginScreen;
