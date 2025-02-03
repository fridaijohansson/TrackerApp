
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

  // Sign in with email and password
  const onSignInPress = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
        Alert.alert(error.message)
      } 
    setLoading(false)
  }

  // Create a new user
  const onSignUpPress = async () => {
    router.replace('/signUp')
    // setLoading(true)
    // const { error } = await supabase.auth.signUp({
    //   email: email,
    //   password: password,
    // })

    // if (error) {
    //     Alert.alert(error.message)
    //   } 
    // setLoading(false)
  }

  return (
    <View style={styles.container}>
      <Spinner visible={loading} />

      <Text style={styles.header}>Sketch IT</Text>

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

      <TouchableOpacity onPress={onSignInPress} style={styles.button}>
        <Text >Sign in</Text>
      </TouchableOpacity>
      <Button onPress={onSignUpPress} title="Create Account" ></Button>
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
