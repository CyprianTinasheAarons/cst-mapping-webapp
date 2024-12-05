import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Knowbe4Service from "../../api/Knowbe4.Service";

export const fetchKnowbe4Customers = createAsyncThunk(
  "knowbe4/fetchCustomers",
  async () => {
    const response = await Knowbe4Service.getKnowbe4Customers();
    return response.data.sort((a: Knowbe4Customer, b: Knowbe4Customer) =>
      a.knowbe4_name.localeCompare(b.knowbe4_name)
    );
  }
);

export const updateKnowbe4CustomerSync = createAsyncThunk(
  "knowbe4/updateCustomerSync",
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
    const response = await Knowbe4Service.updateKnowbe4Customer(customerId, {
      customer_halo_id: haloId,
      halo_name: haloName,
      synced: synced,
    });
    return response.data;
  }
);

export const fetchKnowbe4Items = createAsyncThunk(
  "knowbe4/fetchItems",
  async () => {
    const response = await Knowbe4Service.getKnowbe4Items();
    return response.data;
  }
);

export const updateKnowbe4Item = createAsyncThunk(
  "knowbe4/updateItem",
  async ({ itemId, data }: { itemId: number; data: Record<string, any> }) => {
    const response = await Knowbe4Service.updateKnowbe4Item(itemId, data);
    return response.data;
  }
);

interface Knowbe4Customer {
  id: number;
  customer_halo_id: number | null;
  halo_name: string | null;
  customer_knowbe4_id: string;
  knowbe4_name: string;
  synced_at: string | null;
  synced: boolean | null;
}

interface Knowbe4State {
  customers: Knowbe4Customer[];
  items: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  services: any[];
}

const initialState: Knowbe4State = {
  customers: [],
  items: [],
  status: "idle",
  error: null,
  services: [],
};

const knowbe4Slice = createSlice({
  name: "knowbe4",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKnowbe4Customers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchKnowbe4Customers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customers = action.payload;
      })
      .addCase(fetchKnowbe4Customers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(updateKnowbe4CustomerSync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateKnowbe4CustomerSync.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.customers.findIndex(
          (customer) => customer.id === action.payload.id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      })
      .addCase(updateKnowbe4CustomerSync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchKnowbe4Items.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchKnowbe4Items.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchKnowbe4Items.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(updateKnowbe4Item.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateKnowbe4Item.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateKnowbe4Item.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export default knowbe4Slice.reducer;
