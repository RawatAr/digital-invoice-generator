import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import invoiceReducer from './invoiceSlice';
import clientReducer from './clientSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    invoices: invoiceReducer,
    clients: clientReducer,
  },
});
