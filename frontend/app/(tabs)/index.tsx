import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";

export default function Registration() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("All fields are required");
      return;
    }

    const baseURL =
      Platform.OS === "web"
        ? "http://localhost:5000"
        : "http://10.0.2.2:5000";

    try {
      const response = await fetch(`${baseURL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.status === 201) {
        alert(data.message);
        setName("");
        setEmail("");
        setPassword("");
        router.push("/login");
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
      <Text style={styles.title}>SmartSpent Registration</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#555"
      />
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

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <Text style={styles.switchText} onPress={() => router.push("/login")}>
        Already have an account? Login
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
