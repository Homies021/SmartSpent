// app/tabs/statistics.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Platform } from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Transaction = {
  _id: string;
  type: "Income" | "Expense";
  amount: number;
  note: string;
  category: string;
  date: string;
  userEmail: string;
};

const screenWidth = Dimensions.get("window").width - 40;

export default function Statistics() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const baseURL = Platform.OS === "web" ? "http://localhost:5000" : "http://10.0.2.2:5000";

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        if (!email) return;

        const res = await fetch(`${baseURL}/transactions/${email}`);
        const data: Transaction[] = await res.json();

        setTransactions(data);

        const income = data.filter(t => t.type === "Income").reduce((sum, t) => sum + t.amount, 0);
        const expense = data.filter(t => t.type === "Expense").reduce((sum, t) => sum + t.amount, 0);

        setTotalIncome(income);
        setTotalExpense(expense);
      } catch (err) {
        console.log("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Pie Chart Data
  const pieData = () => {
    if (!transactions || transactions.length === 0) return [];
    const categories: Record<string, number> = {};
    transactions.forEach(t => {
      const key = `${t.type}-${t.category}`;
      categories[key] = (categories[key] || 0) + t.amount;
    });
    const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#9933FF"];
    return Object.entries(categories).map(([key, value], index) => {
      const [type, category] = key.split("-");
      return {
        name: `${category} (${type})`,
        amount: value,
        color: colors[index % colors.length] || "#000000",
        legendFontColor: "#333",
        legendFontSize: 12,
      };
    });
  };

  // Bar Chart: last 6 months
  const barData = () => {
    const months: string[] = [];
    const incomeByMonth: number[] = [];
    const expenseByMonth: number[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleString("default", { month: "short" }));
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === d.getFullYear() && tDate.getMonth() === d.getMonth();
      });
      incomeByMonth.push(monthTransactions.filter(t => t.type === "Income").reduce((sum, t) => sum + t.amount, 0));
      expenseByMonth.push(monthTransactions.filter(t => t.type === "Expense").reduce((sum, t) => sum + t.amount, 0));
    }

    return { labels: months, incomeByMonth, expenseByMonth };
  };

  const last6MonthsData = barData();

  // Top 5 Categories
  const topCategories = (type: "Income" | "Expense") => {
    const catTotals: Record<string, number> = {};
    transactions
      .filter(t => t.type === type)
      .forEach(t => (catTotals[t.category] = (catTotals[t.category] || 0) + t.amount));
    return Object.entries(catTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  // Average Income/Expense
  const avgIncome = (transactions.length ? totalIncome / 6 : 0).toFixed(2);
  const avgExpense = (transactions.length ? totalExpense / 6 : 0).toFixed(2);

  // Expense % of Income
  const expensePercent = totalIncome ? ((totalExpense / totalIncome) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0088FE" />
        <Text style={{ marginTop: 10 }}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.card, { backgroundColor: "#00C49F" }]}>
          <Text style={styles.cardTitle}>Total Income</Text>
          <Text style={styles.cardAmount}>৳{totalIncome}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: "#FF8042" }]}>
          <Text style={styles.cardTitle}>Total Expense</Text>
          <Text style={styles.cardAmount}>৳{totalExpense}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: "#0088FE" }]}>
          <Text style={styles.cardTitle}>Balance</Text>
          <Text style={styles.cardAmount}>৳{totalIncome - totalExpense}</Text>
        </View>
      </View>

      {/* Average Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.card, { backgroundColor: "#FFAA00" }]}>
          <Text style={styles.cardTitle}>Avg Income (Last 6 months)</Text>
          <Text style={styles.cardAmount}>৳{avgIncome}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: "#FF3333" }]}>
          <Text style={styles.cardTitle}>Avg Expense (Last 6 months)</Text>
          <Text style={styles.cardAmount}>৳{avgExpense}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: "#9933FF" }]}>
          <Text style={styles.cardTitle}>Expense % of Income</Text>
          <Text style={styles.cardAmount}>{expensePercent}%</Text>
        </View>
      </View>

      {/* Pie Chart */}
      <Text style={styles.sectionTitle}>Category Breakdown</Text>
      {transactions.length > 0 && Platform.OS !== "web" && pieData().length > 0 ? (
        <PieChart
          data={pieData()}
          width={screenWidth}
          height={220}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      ) : (
        <Text style={styles.placeholderText}>
          {transactions.length === 0 ? "No transactions yet" : "PieChart not supported on web"}
        </Text>
      )}

      {/* Bar Chart */}
      <Text style={styles.sectionTitle}>Last 6 Months</Text>
      {transactions.length > 0 ? (
        <BarChart
          data={{
            labels: last6MonthsData.labels,
            datasets: [
              { data: last6MonthsData.incomeByMonth, color: () => "#00C49F" },
              { data: last6MonthsData.expenseByMonth, color: () => "#FF8042" },
            ],
          }}
          width={screenWidth}
          height={240}
          fromZero
          showValuesOnTopOfBars
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundGradientFrom: "#f0fdfd",
            backgroundGradientTo: "#f0fdfd",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            labelColor: () => "#333",
            barPercentage: 0.5,
          }}
          style={{ marginVertical: 10, borderRadius: 16 }}
        />
      ) : (
        <Text style={styles.placeholderText}>No transactions yet</Text>
      )}

      {/* Top Categories */}
      <Text style={styles.sectionTitle}>Top Expense Categories</Text>
      {topCategories("Expense").length > 0 ? (
        topCategories("Expense").map(([cat, amt]) => (
          <Text key={cat} style={styles.listItem}>
            {cat}: ৳{amt}
          </Text>
        ))
      ) : (
        <Text style={styles.placeholderText}>No expense categories yet</Text>
      )}

      <Text style={styles.sectionTitle}>Top Income Categories</Text>
      {topCategories("Income").length > 0 ? (
        topCategories("Income").map(([cat, amt]) => (
          <Text key={cat} style={styles.listItem}>
            {cat}: ৳{amt}
          </Text>
        ))
      ) : (
        <Text style={styles.placeholderText}>No income categories yet</Text>
      )}

      {/* Recent Transactions */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {transactions.length > 0 ? (
        transactions.slice(0, 5).map(t => (
          <View key={t._id} style={styles.transactionRow}>
            <Text style={styles.transactionText}>{new Date(t.date).toLocaleDateString()}</Text>
            <Text style={styles.transactionText}>{t.type}</Text>
            <Text style={styles.transactionText}>{t.category}</Text>
            <Text style={styles.transactionText}>৳{t.amount}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.placeholderText}>No transactions yet</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdfd", padding: 20 },
  summaryContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  card: { flex: 1, borderRadius: 12, padding: 15, marginHorizontal: 5, alignItems: "center" },
  cardTitle: { fontSize: 14, color: "#fff", marginBottom: 5, fontWeight: "600" },
  cardAmount: { fontSize: 20, color: "#fff", fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#004c4c", marginTop: 20, marginBottom: 10 },
  placeholderText: { textAlign: "center", color: "#666", fontStyle: "italic", marginVertical: 20 },
  listItem: { fontSize: 14, marginVertical: 2, color: "#004c4c" },
  transactionRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottomWidth: 0.5, borderColor: "#ccc" },
  transactionText: { flex: 1, textAlign: "center", fontSize: 13, color: "#004c4c" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
});
