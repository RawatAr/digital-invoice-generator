import axios from 'axios';

const API_URL = '/api/items/';

// Create new item
const createItem = async (itemData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, itemData, config);

  return response.data;
};

// Get user items
const getItems = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);

  return response.data;
};

// Delete user item
const deleteItem = async (itemId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + itemId, config);

  return response.data;
};

// Update item
const updateItem = async (itemId, itemData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + itemId, itemData, config);
  return response.data;
};

const itemService = {
  createItem,
  getItems,
  deleteItem,
  updateItem,
};

export default itemService;
