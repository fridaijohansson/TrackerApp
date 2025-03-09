import { Alert, View, Button, TextInput, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useState } from 'react'
import React from 'react'
import Spinner from 'react-native-loading-spinner-overlay'
import supabase from '../lib/supabase'

import { useRouter } from 'expo-router'

const Login = () => {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')

    // Create a new user
    const onSignUpPress = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
        })

        createProfile()

        if (error) {
            Alert.alert(error.message)
        }
        setLoading(false)
    }

    const createProfile = async () => {
        const { error } = await supabase
            .from('profiles')
            .insert(
                {
                    name: name,
                    current_streak: 0,
                    longest_streak: 0,
                },
            );
        if (error) {
            Alert.alert(error.message)
        }
    }

    const onSignInPress = () => {
        router.replace('/');
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Spinner visible={loading} />

                <Text style={styles.header}>Sketch IT - Sign Up</Text>
                <TextInput
                    autoCapitalize="none"
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.inputField}
                />
                <TextInput
                    autoCapitalize="none"
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.inputField}
                />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.inputField}
                />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={onSignInPress} style={[styles.button, styles.secondaryButton]}>
                        <Text style={styles.secondaryButtonText}>Sign In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onSignUpPress} style={[styles.button, styles.primaryButton]}>
                        <Text style={styles.primaryButtonText}>Create Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        fontSize: 30,
        textAlign: 'center',
        marginBottom: 40,
    },
    inputField: {
        marginVertical: 4,
        height: 50,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        borderColor: '#ccc',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: '#C0A9BD',
    },
    primaryButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#C0A9BD',
    },
    secondaryButtonText: {
        color: '#C0A9BD',
        fontWeight: '600',
    },
})

export default Login