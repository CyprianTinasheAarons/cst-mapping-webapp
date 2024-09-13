import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import MiddlewareService from '../../api/middleware';

export const fetchSupabaseTableMapping = createAsyncThunk(
  'supabase/fetchTableMapping',
  async () => {
    const response = await MiddlewareService.getSupabaseTableMapping();
    return response.data;
  }
);

interface SupabaseState {
  tableMapping: any;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SupabaseState = {
  tableMapping: null,
  status: 'idle',
  error: null,
};

const supabaseSlice = createSlice({
  name: 'supabase',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupabaseTableMapping.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSupabaseTableMapping.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tableMapping = action.payload;
      })
      .addCase(fetchSupabaseTableMapping.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export default supabaseSlice.reducer;