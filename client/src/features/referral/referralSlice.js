import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Async Thunks
export const fetchReferralLink = createAsyncThunk(
  'referral/fetchLink',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/referrals/link');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchMyReferrals = createAsyncThunk(
  'referral/fetchMyReferrals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/referrals/my-referrals');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchCommissions = createAsyncThunk(
  'referral/fetchCommissions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/referrals/commissions', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const requestPayout = createAsyncThunk(
  'referral/requestPayout',
  async (payoutData, { rejectWithValue }) => {
    try {
      const response = await api.post('/agent/request-payout', payoutData);
      toast.success('Withdrawal request submitted successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Withdrawal request failed');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  referralLink: null,
  referrals: [],
  commissions: [],
  payouts: [],
  referralStats: {
    total: 0,
    completed: 0,
    pending: 0,
    totalEarnings: 0
  },
  commissionStats: {
    totalEarned: 0,
    pending: 0,
    paid: 0
  },
  isLoading: false,
  error: null
};

const referralSlice = createSlice({
  name: 'referral',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReferrals: (state) => {
      state.referrals = [];
      state.commissions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Referral Link
      .addCase(fetchReferralLink.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchReferralLink.fulfilled, (state, action) => {
        state.isLoading = false;
        state.referralLink = action.payload;
      })
      .addCase(fetchReferralLink.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch My Referrals
      .addCase(fetchMyReferrals.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyReferrals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.referrals = action.payload.referrals;
        state.referralStats = action.payload.stats;
      })
      .addCase(fetchMyReferrals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Commissions
      .addCase(fetchCommissions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCommissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.commissions = action.payload.commissions;
        state.commissionStats = action.payload.stats;
      })
      .addCase(fetchCommissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Request Payout
      .addCase(requestPayout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(requestPayout.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payouts.unshift(action.payload);
      })
      .addCase(requestPayout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearReferrals } = referralSlice.actions;
export default referralSlice.reducer;