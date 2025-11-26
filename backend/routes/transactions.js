const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// ✅ Get last month's summary (income & expense)
router.get("/summary/lastmonth/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const now = new Date();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const transactions = await Transaction.find({
      userEmail: email,
      date: { $gte: firstDayLastMonth, $lte: lastDayLastMonth },
    });

    const income = transactions
      .filter((t) => t.type === "Income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "Expense")
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({ income, expense });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all transactions for a user
router.get("/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const transactions = await Transaction.find({ userEmail: email }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Add a new transaction
router.post("/", async (req, res) => {
  try {
    const { type, amount, note, category, userEmail } = req.body;

    if (!type || !amount || !note || !category || !userEmail) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const newTransaction = new Transaction({
      type,
      amount,
      note,
      category,
      userEmail,
      date: new Date(),
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update an existing transaction
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { type, amount, note, category } = req.body;

  if (!type || !amount || !note || !category) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { type, amount, note, category },
      { new: true } // return the updated document
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(updatedTransaction);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
