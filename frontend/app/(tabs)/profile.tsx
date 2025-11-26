import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Profile() {
  const [name, setName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const baseURL = Platform.OS === "web" ? "http://localhost:5000" : "http://10.0.2.2:5000";

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      if (!email) return setUserEmail("");
      setUserEmail(email);

      try {
        const res = await fetch(`${baseURL}/users?email=${email}`);
        const data = await res.json();
        if (data.name) setName(data.name);
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Failed to load profile");
      }
    };
    loadProfile();
  }, []);

  // Save user name
  const saveName = async () => {
    if (!name.trim()) return Alert.alert("Error", "Enter a name");
    if (!userEmail) return Alert.alert("Error", "User email not found");

    try {
      setLoading(true);
      const res = await fetch(`${baseURL}/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, name }),
      });

      const data = await res.json();

      if (res.status === 200) {
        await AsyncStorage.setItem(`userName_${userEmail}`, name);
        Alert.alert("Success", data.message);
      } else {
        Alert.alert("Error", data.message || "Failed to update name");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Error updating name");
    } finally {
      setLoading(false);
    }
  };

  // Change password with current password check
const changePassword = async () => {
  if (!currentPassword || !newPassword)
    return Alert.alert("Error", "Enter both current and new password");

  try {
    setLoading(true);

    const res = await fetch(`${baseURL}/users/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, currentPassword, newPassword }),
    });

    const data = await res.json(); // read JSON body first

    if (res.ok) {
      setCurrentPassword("");
      setNewPassword("");
      Alert.alert("Success", data.message || "Password updated successfully!");
    } else {
      // Handle errors including wrong current password
      Alert.alert("Error", data.message || "Failed to update password");
    }
  } catch (err) {
    console.log(err);
    Alert.alert("Error", "Network or server error");
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Text style={styles.label}>Email</Text>
      <Text style={styles.info}>{userEmail || "Loading..."}</Text>

      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={saveName}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Saving..." : "Save Name"}</Text>
      </TouchableOpacity>

      {/* Change Password */}
      <Text style={styles.label}>Change Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Current password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#FF6347" }]}
        onPress={changePassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Saving..." : "Update Password"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdfd", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 14, color: "#333", marginTop: 10, marginBottom: 5 },
  info: { fontSize: 16, marginBottom: 15, color: "#555" },
  input: { backgroundColor: "#e0f7f7", padding: 15, marginBottom: 15, borderRadius: 10 },
  button: { backgroundColor: "#008080", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
