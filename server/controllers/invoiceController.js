const Invoice = require('../models/Invoice');

// @desc    Get invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
  const invoices = await Invoice.find({ user: req.user.id });
  res.status(200).json(invoices);
};

// @desc    Set invoice
// @route   POST /api/invoices
// @access  Private
const setInvoice = async (req, res) => {
  const { client, items, invoiceNumber, dueDate, total, status } = req.body;

  if (!client || !items || !invoiceNumber || !dueDate || !total) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const invoice = await Invoice.create({
    user: req.user.id,
    client,
    items,
    invoiceNumber,
    dueDate,
    total,
    status,
  });

  res.status(201).json(invoice);
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    res.status(400);
    throw new Error('Invoice not found');
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Make sure the logged in user matches the invoice user
  if (invoice.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedInvoice);
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    res.status(400);
    throw new Error('Invoice not found');
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Make sure the logged in user matches the invoice user
  if (invoice.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await Invoice.findByIdAndDelete(req.params.id);

  res.status(200).json({ id: req.params.id });
};

module.exports = {
  getInvoices,
  setInvoice,
  updateInvoice,
  deleteInvoice,
};
