import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import MiddlewareService from '../../api/middleware';

export const fetchSentinelOneCustomers = createAsyncThunk(
  'sentinelOne/fetchCustomers',
  async (data: any) => {
    const response = await MiddlewareService.getSentinelOneCustomers(data);
    return response.data;
  }
);

interface SentinelOneState {
  customers: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SentinelOneState = {
  customers: [],
  status: 'idle',
  error: null,
};

const sentinelOneSlice = createSlice({
  name: 'sentinelOne',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSentinelOneCustomers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSentinelOneCustomers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.customers = action.payload;
      })
      .addCase(fetchSentinelOneCustomers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export default sentinelOneSlice.reducer;