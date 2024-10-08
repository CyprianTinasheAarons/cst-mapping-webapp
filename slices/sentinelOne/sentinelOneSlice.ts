import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import SentineloneService from "../../api/Sentinelone.Service";

export const fetchSentineloneCustomers = createAsyncThunk(
  "sentinelone/fetchCustomers",
  async () => {
    const response = await SentineloneService.getSentineloneCustomers();
    return response.data;
  }
);

export const updateSentineloneCustomer = createAsyncThunk(
  "sentinelone/updateCustomer",
  async ({
    customerId,
    data,
  }: {
    customerId: number;
    data: Record<string, any>;
  }) => {
    const response = await SentineloneService.updateSentineloneCustomer(
      customerId,
      data
    );
    return response.data;
  }
);

export const fetchSentineloneItems = createAsyncThunk(
  "sentinelone/fetchItems",
  async () => {
    const response = await SentineloneService.getSentineloneItems();
    return response.data;
  }
);

export const updateSentineloneItem = createAsyncThunk(
  "sentinelone/updateItem",
  async ({ itemId, data }: { itemId: number; data: Record<string, any> }) => {
    const response = await SentineloneService.updateSentineloneItem(
      itemId,
      data
    );
    return response.data;
  }
);

interface SentineloneCustomer {
  id: number;
  customer_halo_id: string | null;
  halo_name: string | null;
  customer_sentinelone_id: string;
  sentinelone_name: string;
  synced_at: Date;
  synced: boolean;
  disabled: boolean;
  override: boolean;
  override_count: number;
}

interface SentineloneState {
  customers: SentineloneCustomer[];
  items: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SentineloneState = {
  customers: [],
  items: [],
  status: "idle",
  error: null,
};

const sentineloneSlice = createSlice({
  name: "sentinelone",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSentineloneCustomers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSentineloneCustomers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customers = action.payload;
      })
      .addCase(fetchSentineloneCustomers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(updateSentineloneCustomer.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateSentineloneCustomer.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.customers.findIndex(
          (customer) => customer.id === action.payload.id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      })
      .addCase(updateSentineloneCustomer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchSentineloneItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSentineloneItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchSentineloneItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(updateSentineloneItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateSentineloneItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateSentineloneItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export default sentineloneSlice.reducer;
