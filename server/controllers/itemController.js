const Item = require('../models/Item');

// @desc    Get items
// @route   GET /api/items
// @access  Private
const getItems = async (req, res) => {
  const items = await Item.find();
  res.status(200).json(items);
};

// @desc    Set item
// @route   POST /api/items
// @access  Private
const setItem = async (req, res) => {
  const { description, quantity, price } = req.body;

  if (!description || !quantity || !price) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const item = await Item.create({
    description,
    quantity,
    price,
  });

  res.status(201).json(item);
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(400);
    throw new Error('Item not found');
  }

  const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedItem);
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(400);
    throw new Error('Item not found');
  }

  await Item.findByIdAndDelete(req.params.id);

  res.status(200).json({ id: req.params.id });
};

module.exports = {
  getItems,
  setItem,
  updateItem,
  deleteItem,
};
