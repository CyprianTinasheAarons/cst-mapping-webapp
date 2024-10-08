import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import BitdefenderService from "../../api/Bitdefender.Service";

export const fetchBitdefenderCustomers = createAsyncThunk(
  "bitdefender/fetchCustomers",
  async () => {
    const response = await BitdefenderService.getBitdefenderCustomers();
    return response.data.sort(
      (a: BitdefenderCustomer, b: BitdefenderCustomer) =>
        a.bitdefender_name.localeCompare(b.bitdefender_name)
    );
  }
);

export const updateBitdefenderHaloCustomerSync = createAsyncThunk(
  "bitdefender/updateCustomerSync",
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
    const response = await BitdefenderService.updateBitdefenderCustomer(
      customerId,
      {
        customer_halo_id: haloId,
        halo_name: haloName,
        synced: synced,
      }
    );
    return response.data;
  }
);

export const fetchBitdefenderHaloItems = createAsyncThunk(
  "bitdefender/fetchHaloItems",
  async () => {
    const response = await BitdefenderService.getBitdefenderItems();
    return response.data;
  }
);

export const updateBitdefenderHaloItem = createAsyncThunk(
  "bitdefender/updateHaloItem",
  async (data: Record<string, any>) => {
    const response = await BitdefenderService.updateBitdefenderItem(
      data.id,
      data
    );
    return response.data;
  }
);

interface BitdefenderCustomer {
  id: number;
  customer_halo_id: number | null;
  halo_name: string | null;
  customer_bitdefender_id: string;
  bitdefender_name: string;
  synced_at: string | null;
  synced: boolean | null;
}

interface BitdefenderState {
  customers: BitdefenderCustomer[];
  subscriptions: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  services: any[];
}

const initialState: BitdefenderState = {
  customers: [],
  subscriptions: [],
  status: "idle",
  error: null,
  services: [],
};

const bitdefenderSlice = createSlice({
  name: "bitdefender",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBitdefenderCustomers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBitdefenderCustomers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customers = action.payload;
      })
      .addCase(fetchBitdefenderCustomers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(updateBitdefenderHaloCustomerSync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateBitdefenderHaloCustomerSync.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.customers.findIndex(
          (customer) => customer.id === action.payload.id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      })
      .addCase(updateBitdefenderHaloCustomerSync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchBitdefenderHaloItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBitdefenderHaloItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.subscriptions = action.payload;
      })
      .addCase(fetchBitdefenderHaloItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(updateBitdefenderHaloItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateBitdefenderHaloItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.subscriptions.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
      })
      .addCase(updateBitdefenderHaloItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export default bitdefenderSlice.reducer;
