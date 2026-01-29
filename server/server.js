const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const connectDB = require('./db');
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Category = require('./models/Category');
const Budget = require('./models/Budget');

const app = express();

connectDB();


app.use(cors());
app.use(express.json());



// Signup
app.post('/api/signup', async (req, res) => {
  const { name, emailOrPhone, password } = req.body;

  try {
    const existingUser = await User.findOne({ emailOrPhone });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      emailOrPhone,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    const user = await User.findOne({ emailOrPhone });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      userId: user._id,
      name: user.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});


// Add transaction
app.post('/api/transactions', async (req, res) => {
  const { amount, type, category, note, date, userId, userName } = req.body;

  try {
    const transaction = new Transaction({
      amount,
      type,
      category,
      note,
      date,
      userId,
      userName,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

// Get transactions (user-specific)
app.get('/api/transactions', async (req, res) => {
  const { userId } = req.query;

  try {
    const transactions = await Transaction
      .find({ userId })
      .sort({ date: -1 });

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});
// DELETE transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});
// UPDATE transaction
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});



app.post('/api/categories', async (req, res) => {
  console.log('CATEGORY BODY:', req.body); // 🔥 ADD THIS

  try {
    const { name, type, userId, userName } = req.body;

    if (!name || !type || !userId || !userName) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const existing = await Category.findOne({ name, type, userId });
    if (existing) return res.json(existing);

    const category = new Category({
      name,
      type,
      userId,
      userName,
    });

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error('CATEGORY SAVE ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/categories', async (req, res) => {
  try {
    const { userId } = req.query;
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const categories = await Category.find({ userId: objectUserId });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { name, type } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, type },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//delete category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add or update monthly budget
app.post('/api/budget', async (req, res) => {
  try {
    const { userId, userName, month, amount } = req.body;

    if (!userId || !userName || !month || !amount) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    let budget = await Budget.findOne({ userId, month });

    if (budget) {
      budget.amount = amount;
      budget.userName = userName; // 🔥 ensure stored
      await budget.save();
    } else {
      budget = new Budget({
        userId,
        userName,
        month,
        amount,
      });
      await budget.save();
    }

    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get monthly budget
app.get('/api/budget', async (req, res) => {
  const { userId, month } = req.query;

  try {
    const budget = await Budget.findOne({
  userId: new mongoose.Types.ObjectId(userId),
  month
});
    res.json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
