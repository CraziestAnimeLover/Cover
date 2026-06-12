import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Async Thunks
export const createPaymentIntent = createAsyncThunk(
  'payment/createIntent',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/create-payment-intent', paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getPaymentStatus = createAsyncThunk(
  'payment/getStatus',
  async (paymentIntentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payments/status/${paymentIntentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getMyPurchases = createAsyncThunk(
  'payment/getMyPurchases',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payments/my-purchases');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  purchases: [],
  currentPayment: null,
  paymentStatus: null,
  isLoading: false,
  error: null
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPayment: (state) => {
      state.currentPayment = null;
      state.paymentStatus = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Payment Intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to create payment');
      })
      
      // Get Payment Status
      .addCase(getPaymentStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPaymentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentStatus = action.payload;
      })
      .addCase(getPaymentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get My Purchases
      .addCase(getMyPurchases.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyPurchases.fulfilled, (state, action) => {
        state.isLoading = false;
        state.purchases = action.payload;
      })
      .addCase(getMyPurchases.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearPayment, clearError } = paymentSlice.actions;
export default paymentSlice.reducer;