
import { Alert, View, Button, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import React from 'react'
import Spinner from 'react-native-loading-spinner-overlay'
import  supabase  from '../lib/supabase'

import { useRouter } from 'expo-router'

const Login = () => {
    const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')

  // Create a new user
  const onSignUpPress = async () => {
    router.replace('./signUp')
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

  const createProfile = async () =>{
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

  return (
    <View style={styles.container}>
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

      <TouchableOpacity onPress={onSignUpPress} style={styles.button}>
        <Text >Sign Up</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
    padding: 20,
  },
  header: {
    fontSize: 30,
    textAlign: 'center',
    margin: 50,
  },
  inputField: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
  },
  button: {
    marginVertical: 15,
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
  },
})

export default Login
