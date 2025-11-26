// app/tabs/wallet.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type WalletType = {
  _id: string;
  name: string;
  balance: number;
  userEmail: string;
};

const baseURL = Platform.OS === "web" ? "http://localhost:5000" : "http://10.0.2.2:5000";

export default function Wallet() {
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWalletName, setNewWalletName] = useState("");

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const email = await AsyncStorage.getItem("userEmail");
      if (!email) return;

      const res = await fetch(`${baseURL}/wallets/${email}`);
      const data: WalletType[] = await res.json();
      setWallets(data);
    } catch (err) {
      console.log("Error fetching wallets:", err);
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async () => {
    if (!newWalletName.trim()) return alert("Enter wallet name");

    try {
      const email = await AsyncStorage.getItem("userEmail");
      if (!email) return;

      const res = await fetch(`${baseURL}/wallets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newWalletName.trim(), userEmail: email }),
      });

      if (res.ok) {
        setNewWalletName("");
        fetchWallets();
      } else {
        const data = await res.json();
        alert(data.message || "Error creating wallet");
      }
    } catch (err) {
      console.log(err);
      alert("Cannot connect to server");
    }
  };

  const deleteWallet = async (id: string) => {
    Alert.alert("Delete Wallet", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`${baseURL}/wallets/${id}`, { method: "DELETE" });
            if (res.ok) fetchWallets();
          } catch (err) {
            console.log(err);
            alert("Error deleting wallet");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0088FE" />
        <Text style={{ marginTop: 10 }}>Loading wallets...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Create Wallet */}
      <View style={styles.createContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Wallet Name"
          value={newWalletName}
          onChangeText={setNewWalletName}
        />
        <TouchableOpacity style={styles.button} onPress={createWallet}>
          <Text style={styles.buttonText}>Create Wallet</Text>
        </TouchableOpacity>
      </View>

      {/* Wallet List */}
      <Text style={styles.sectionTitle}>Your Wallets</Text>
      {wallets.length === 0 ? (
        <Text style={styles.placeholderText}>No wallets found. Add one above.</Text>
      ) : (
        wallets.map((wallet) => (
          <View key={wallet._id} style={styles.walletCard}>
            <View>
              <Text style={styles.walletName}>{wallet.name}</Text>
              <Text style={styles.walletBalance}>৳{wallet.balance}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteWallet(wallet._id)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdfd", padding: 20 },
  createContainer: { flexDirection: "row", marginBottom: 20 },
  input: {
    flex: 1,
    backgroundColor: "#e0f7f7",
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#0088FE",
    padding: 12,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#004c4c", marginBottom: 10 },
  placeholderText: { textAlign: "center", color: "#666", fontStyle: "italic", marginVertical: 20 },
  walletCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#00C49F",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  walletName: { fontSize: 16, color: "#fff", fontWeight: "600" },
  walletBalance: { fontSize: 18, color: "#fff", fontWeight: "bold" },
  deleteButton: { backgroundColor: "#FF8042", padding: 10, borderRadius: 12 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
});
