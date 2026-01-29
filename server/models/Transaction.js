const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    amount: Number,
    type: String,
    category: String,
    note: String,
    date: Date,

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    userName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
