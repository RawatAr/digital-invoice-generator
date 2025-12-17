import axios from 'axios';

const API_URL = '/api/clients/';

// Create new client
const createClient = async (clientData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, clientData, config);

  return response.data;
};

// Get user clients
const getClients = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);

  return response.data;
};

// Delete user client
const deleteClient = async (clientId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + clientId, config);

  return response.data;
};

// Update client
const updateClient = async (clientId, clientData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + clientId, clientData, config);
  return response.data;
};

const clientService = {
  createClient,
  getClients,
  deleteClient,
  updateClient,
};

export default clientService;
