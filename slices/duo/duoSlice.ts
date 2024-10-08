import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import DuoService from "../../api/Duo.Service";

export const fetchDuoCustomers = createAsyncThunk(
  "duo/fetchCustomers",
  async () => {
    const response = await DuoService.getDuoCustomers();
    return response.data.sort((a: DuoCustomer, b: DuoCustomer) =>
      a.duo_name.localeCompare(b.duo_name)
    );
  }
);

export const updateDuoCustomerSync = createAsyncThunk(
  "duo/updateCustomerSync",
  async ({
    customerId,
    haloId,
    haloName,
    synced,
  }: {
    customerId: number;
    haloId: number | null;
    haloName: string | null;
    synced: boolean;
  }) => {
    const response = await DuoService.updateDuoCustomer(customerId, {
      customer_halo_id: haloId,
      halo_name: haloName,
      synced: synced,
    });
    return response.data;
  }
);

export const fetchDuoItems = createAsyncThunk("duo/fetchItems", async () => {
  const response = await DuoService.getDuoItems();
  return response.data;
});

export const updateDuoItem = createAsyncThunk(
  "duo/updateItem",
  async ({ itemId, data }: { itemId: number; data: Record<string, any> }) => {
    const response = await DuoService.updateDuoItem(itemId, data);
    return response.data;
  }
);

interface DuoCustomer {
  id: number;
  customer_halo_id: number | null;
  halo_name: string | null;
  customer_duo_id: string;
  duo_name: string;
  synced_at: string | null;
  synced: boolean | null;
}

interface DuoState {
  customers: DuoCustomer[];
  items: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  services: any[];
}

const initialState: DuoState = {
  customers: [],
  items: [],
  status: "idle",
  error: null,
  services: [],
};

const duoSlice = createSlice({
  name: "duo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDuoCustomers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDuoCustomers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customers = action.payload;
      })
      .addCase(fetchDuoCustomers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(updateDuoCustomerSync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateDuoCustomerSync.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.customers.findIndex(
          (customer) => customer.id === action.payload.id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      })
      .addCase(updateDuoCustomerSync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchDuoItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDuoItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchDuoItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(updateDuoItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateDuoItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateDuoItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export default duoSlice.reducer;