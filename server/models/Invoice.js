const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'client',
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'item',
    },
  ],
  invoiceNumber: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: 'pending',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('invoice', InvoiceSchema);
