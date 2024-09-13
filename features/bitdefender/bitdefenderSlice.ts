import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import MiddlewareService from '../../api/middleware';

export const fetchBitdefenderCompanies = createAsyncThunk(
  'bitdefender/fetchCompanies',
  async (data: any) => {
    const response = await MiddlewareService.getBitdefenderCompaniesWithDeviceCount(data);
    return response.data;
  }
);

interface BitdefenderState {
  companies: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: BitdefenderState = {
  companies: [],
  status: 'idle',
  error: null,
};

const bitdefenderSlice = createSlice({
  name: 'bitdefender',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBitdefenderCompanies.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBitdefenderCompanies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.companies = action.payload;
      })
      .addCase(fetchBitdefenderCompanies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export default bitdefenderSlice.reducer;