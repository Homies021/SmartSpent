import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Email and Password are required");
      return;
    }

    const baseURL = Platform.OS === "web" ? "http://localhost:5000" : "http://10.0.2.2:5000";

    try {
      const response = await fetch(`${baseURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        alert(data.message);

        // ✅ Store logged-in email in AsyncStorage
        await AsyncStorage.setItem("userEmail", email);

        // Clear inputs
        setEmail("");
        setPassword("");

        // Navigate to home
        router.push("/home");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Cannot connect to server");
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#555"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#555"
      />
      
    

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.switchText} onPress={() => router.push("/")}>
        Don't have an account? Register
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#008080", justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 30, textAlign: "center" },
  input: { backgroundColor: "#e0f7f7", padding: 15, marginBottom: 20, borderRadius: 15, fontSize: 16 },
  button: { backgroundColor: "#004c4c", padding: 15, borderRadius: 15, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  switchText: { color: "#fff", textAlign: "center", marginTop: 15, textDecorationLine: "underline" },
});
