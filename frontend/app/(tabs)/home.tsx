// app/tabs/home.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";

// TypeScript type for transaction
type Transaction = {
  _id: string;
  type: "Income" | "Expense";
  amount: number;
  note: string;
  category: string;
  date: string;
  userEmail: string;
};

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editTransactionId, setEditTransactionId] = useState<string | null>(null);
  const [type, setType] = useState<"Income" | "Expense">("Expense");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("User");
  const [lastMonthIncome, setLastMonthIncome] = useState(0);
  const [lastMonthExpense, setLastMonthExpense] = useState(0);

  const incomeCategories = ["Salary", "Profit", "Other"];
  const expenseCategories = ["Grocery", "Rent", "Transport", "Shopping", "Other"];

  const baseURL = Platform.OS === "web" ? "http://localhost:5000" : "http://10.0.2.2:5000";

  // Load user info and transactions whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const email = await AsyncStorage.getItem("userEmail");
        if (!email) return;

        setUserEmail(email);
        fetchUserName(email);
        fetchTransactions(email);
        fetchLastMonthSummary(email);
      };
      loadData();
    }, [])
  );

  const fetchUserName = async (email: string) => {
    try {
      const response = await fetch(`${baseURL}/users?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error("Cannot fetch user");
      const data: { name?: string } = await response.json();
      setUserName(data.name || "User");
    } catch (err) {
      console.log(err);
      setUserName("User");
    }
  };

  const fetchTransactions = async (email: string) => {
    try {
      const response = await fetch(`${baseURL}/transactions/${email}`);
      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch (err) {
      console.log(err);
      alert("Cannot fetch transactions");
    }
  };

  const fetchLastMonthSummary = async (email: string) => {
    try {
      const response = await fetch(`${baseURL}/transactions/summary/lastmonth/${email}`);
      const data: { income: number; expense: number } = await response.json();
      setLastMonthIncome(data.income);
      setLastMonthExpense(data.expense);
    } catch (err) {
      console.log(err);
    }
  };

  const openModalForEdit = (transaction: Transaction) => {
    setEditTransactionId(transaction._id);
    setType(transaction.type);
    setAmount(transaction.amount.toString());
    setNote(transaction.note);
    setCategory(transaction.category);
    setModalVisible(true);
  };

const handleSaveTransaction = async () => {
  if (!amount || !note || !category) {
    alert("Please fill all fields");
    return;
  }

  const transactionData = {
    type,
    amount: parseFloat(amount),
    note,
    category,
    userEmail,
  };

  try {
    // Determine if we are adding a new transaction or updating an existing one
    const method = editTransactionId ? "PUT" : "POST";
    const url = editTransactionId
      ? `${baseURL}/transactions/${editTransactionId}`
      : `${baseURL}/transactions`;

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transactionData),
    });

    const data = (await response.json()) as Transaction | { message: string };

    if (!response.ok) {
      // TypeScript now knows 'data' might have 'message'
      alert("message" in data ? data.message : "Cannot save transaction");
      return;
    }

    if (editTransactionId) {
      // Update existing transaction in state
      setTransactions((prev) =>
        prev.map((t) => (t._id === editTransactionId ? (data as Transaction) : t))
      );
    } else {
      // Add new transaction at the top
      setTransactions((prev) => [data as Transaction, ...prev]);
    }

    // Reset modal and form
    setModalVisible(false);
    setAmount("");
    setNote("");
    setCategory("");
    setEditTransactionId(null);
    fetchLastMonthSummary(userEmail);
  } catch (err) {
    console.log(err);
    alert("Cannot save transaction");
  }
};


  // Totals
  const totalIncome = transactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Assalamu Alaikum, {userName}</Text>

      <View style={styles.lastMonthCard}>
        <Text style={styles.cardTitle}>Last Month</Text>
        <View style={styles.row}>
          <Text style={styles.incomeText}>Income: ৳{lastMonthIncome}</Text>
          <Text style={styles.expenseText}>Expense: ৳{lastMonthExpense}</Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.balanceText}>Balance: ৳{balance}</Text>
        <View style={styles.row}>
          <Text style={styles.incomeText}>Income: ৳{totalIncome}</Text>
          <Text style={styles.expenseText}>Expense: ৳{totalExpense}</Text>
        </View>
      </View>

      <Text style={styles.subHeader}>Recent Transactions</Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }: { item: Transaction }) => {
          const formattedDate = new Date(item.date).toLocaleString();
          const categoryText = item.category ? ` (${item.category})` : "";

          return (
            <TouchableOpacity
              onPress={() => openModalForEdit(item)}
              style={[
                styles.transactionItem,
                item.type === "Income" ? styles.incomeBg : styles.expenseBg,
              ]}
            >
              <View>
                <Text style={styles.note}>
                  {item.note}
                  {categoryText}
                </Text>
                <Text style={styles.dateText}>{formattedDate}</Text>
              </View>
              <Text style={styles.amount}>
                {item.type === "Income" ? "+" : "-"}৳{item.amount}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditTransactionId(null);
          setAmount("");
          setNote("");
          setCategory("");
          setType("Expense");
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+ Add Transaction</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editTransactionId ? "Edit Transaction" : "Add Transaction"}
            </Text>

            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeButton, type === "Income" && styles.activeType]}
                onPress={() => setType("Income")}
              >
                <Text style={styles.typeText}>Income</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, type === "Expense" && styles.activeType]}
                onPress={() => setType("Expense")}
              >
                <Text style={styles.typeText}>Expense</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <TextInput
              style={styles.input}
              placeholder="Note"
              value={note}
              onChangeText={setNote}
            />

            <View style={styles.categoryPicker}>
              <Text style={styles.typeText}>Category:</Text>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={{ flex: 1 }}
              >
                <Picker.Item label="Select category..." value="" />
                {(type === "Income" ? incomeCategories : expenseCategories).map((cat) => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveTransaction}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdfd", padding: 20 },
  greeting: { fontSize: 22, fontWeight: "600", marginBottom: 15 },
  lastMonthCard: { backgroundColor: "#b2f0e6", padding: 15, borderRadius: 12, marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  summaryContainer: { backgroundColor: "#008080", borderRadius: 20, padding: 20, marginBottom: 20 },
  balanceText: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  incomeText: { color: "#c8ffe0", fontSize: 16 },
  expenseText: { color: "#ffcccc", fontSize: 16 },
  subHeader: { fontSize: 18, fontWeight: "600", color: "#004c4c", marginBottom: 10 },
  transactionItem: { flexDirection: "row", justifyContent: "space-between", padding: 15, marginBottom: 8, borderRadius: 12 },
  incomeBg: { backgroundColor: "#e0f8f1" },
  expenseBg: { backgroundColor: "#ffeaea" },
  note: { fontSize: 16, color: "#333" },
  dateText: { fontSize: 12, color: "#666", marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "bold" },
  addButton: { backgroundColor: "#004c4c", padding: 15, borderRadius: 15, alignItems: "center", marginTop: 10 },
  addButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { backgroundColor: "#fff", width: "85%", borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 15 },
  input: { backgroundColor: "#f5f5f5", padding: 12, marginBottom: 10, borderRadius: 10 },
  typeToggle: { flexDirection: "row", justifyContent: "space-around", marginBottom: 15 },
  typeButton: { padding: 10, borderRadius: 10, backgroundColor: "#e0f7f7", width: "40%", alignItems: "center" },
  activeType: { backgroundColor: "#008080" },
  typeText: { color: "#004c4c", fontWeight: "bold" },
  categoryPicker: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  saveButton: { backgroundColor: "#008080", padding: 12, borderRadius: 10, alignItems: "center", marginBottom: 10 },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelButton: { alignItems: "center" },
  cancelButtonText: { color: "#008080", fontWeight: "bold" },
});
