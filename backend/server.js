const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// ✅ Enable CORS for all
app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB Connection (Database Name = SmartSpentDB)
mongoose
  .connect(
    'mongodb+srv://mehedyrojel:1234@cluster0.1lbzk4c.mongodb.net/SmartSpentDB?retryWrites=true&w=majority'
  )
  .then(() => console.log('✅ MongoDB connected to SmartSpentDB'))
  .catch((err) => console.log('❌ DB Error:', err));

// ✅ Import Models
const User = require('./models/User'); // import User model

// ✅ Import routes
const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/users');

// ✅ Simple route to test server
app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

// ✅ Register API Route
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    await User.create({ name, email, password });

    return res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Login API Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email & Password required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    return res.status(200).json({ message: 'Login successful!' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Use routes
app.use('/transactions', transactionRoutes);
app.use('/users', userRoutes);

// ✅ Start Server
app.listen(5000, () => console.log('🚀 Server running on port 5000'));
