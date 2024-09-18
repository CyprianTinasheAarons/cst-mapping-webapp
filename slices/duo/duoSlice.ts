import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import DuoService from '../../api/Duo.Service';

export const fetchDuoCustomers = createAsyncThunk(
  'duo/fetchCustomers',
  async (data: any) => {
    const response = await DuoService.getDuoCustomers(data);
    return response.data;
  }
);

export const updateDuoCustomerSync = createAsyncThunk(
  'duo/updateCustomerSync',
  async ({ customerId, synced, duoDetails }: { customerId: number; synced: boolean; duoDetails?: Record<string, any> }) => {
    const response = await DuoService.updateDuoCustomerSync(customerId, synced, duoDetails);
    return response.data;
  }
);

export const fetchDuoSubscriptions = createAsyncThunk(
  'duo/fetchSubscriptions',
  async (customerId: string) => {
    const response = await DuoService.getDuoSubscriptions(customerId);
    return response.data;
  }
);

export const fetchAllDuoCustomers = createAsyncThunk(
  'duo/fetchAllCustomers',
  async () => {
    const response = await DuoService.getAllDuoCustomers();
    return response.data;
  }
);

export const fetchAllDuoItems = createAsyncThunk(
  'duo/fetchAllItems',
  async () => {
    const response = await DuoService.getAllDuoItems();
    return response.data;
  }
);

export const updateDuoItem = createAsyncThunk(
  'duo/updateItem',
  async (data: Record<string, any>) => {
    const response = await DuoService.updateDuoItem(data);
    return response.data;
  }
);

interface DuoState {
  customers: any[];
  subscriptions: any[];
  items: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DuoState = {
  customers: [],
  subscriptions: [],
  items: [],
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
      })
      .addCase(updateDuoCustomerSync.fulfilled, (state, action) => {
        const updatedCustomer = action.payload;
        const index = state.customers.findIndex(customer => customer.id === updatedCustomer.id);
        if (index !== -1) {
          state.customers[index] = updatedCustomer;
        }
      })
      .addCase(fetchDuoSubscriptions.fulfilled, (state, action) => {
        state.subscriptions = action.payload;
      })
      .addCase(fetchAllDuoCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
      })
      .addCase(fetchAllDuoItems.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(updateDuoItem.fulfilled, (state, action) => {
        const updatedItem = action.payload;
        const index = state.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.items[index] = updatedItem;
        }
      });
  },
});

export default duoSlice.reducer;