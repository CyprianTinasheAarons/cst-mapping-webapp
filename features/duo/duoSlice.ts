import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import MiddlewareService from '../../api/middleware';

export const fetchDuoCustomers = createAsyncThunk(
  'duo/fetchCustomers',
  async (data: any) => {
    const response = await MiddlewareService.getDuoCustomers(data);
    return response.data;
  }
);

interface DuoState {
  customers: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DuoState = {
  customers: [],
  status: 'idle',
  error: null,
};

const duoSlice = createSlice({
  name: 'duo',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDuoCustomers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDuoCustomers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.customers = action.payload;
      })
      .addCase(fetchDuoCustomers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export default duoSlice.reducer;