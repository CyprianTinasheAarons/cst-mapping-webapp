import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import MiddlewareService from "../../api/middleware";

export const fetchIngramClients = createAsyncThunk(
  "ingram/fetchClients",
  async () => {
    const response = await MiddlewareService.getIngramHaloCustomers();
    return response.data;
  }
);

export const fetchIngramHaloItems = createAsyncThunk(
  "ingram/fetchHaloItems",
  async () => {
    const response = await MiddlewareService.getAllIngramHaloItems();
    return response.data;
  }
);

export const fetchIngramSubscriptions = createAsyncThunk(
  "ingram/fetchSubscriptions",
  async (customerId: string) => {
    const response = await MiddlewareService.getIngramSubscriptions(customerId);
    return response.data;
  }
);

export const updateIngramHaloCustomerSync = createAsyncThunk(
  "ingram/updateCustomerSync",
  async ({
    customerId,
    haloId,
    haloName,
    synced,
  }: {
    customerId: number;
    haloId: string;
    haloName: string;
    synced: boolean;
  }) => {
    const response = await MiddlewareService.updateIngramHaloCustomerSync(
      customerId,
      synced,
      {
        customer_halo_id: haloId,
        halo_name: haloName,
      }
    );
    return response.data;
  }
);

interface IngramHaloCustomer {
  id: number;
  customer_halo_id: string;
  halo_name: string;
  customer_ingram_id: string;
  ingram_name: string;
  synced_at: string;
  synced: boolean;
}

interface IngramState {
  clients: IngramHaloCustomer[];
  subscriptions: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: IngramState = {
  clients: [],
  subscriptions: [],
  status: "idle",
  error: null,
};

const ingramSlice = createSlice({
  name: "ingram",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngramClients.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchIngramClients.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.clients = action.payload;
      })
      .addCase(fetchIngramClients.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchIngramSubscriptions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchIngramSubscriptions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.subscriptions = action.payload;
      })
      .addCase(fetchIngramSubscriptions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(updateIngramHaloCustomerSync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateIngramHaloCustomerSync.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedClient = action.payload;
        const index = state.clients.findIndex(
          (client) => client.id === updatedClient.id
        );
        if (index !== -1) {
          state.clients[index] = updatedClient;
        }
      })
      .addCase(updateIngramHaloCustomerSync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchIngramHaloItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchIngramHaloItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.subscriptions = action.payload;
      })
      .addCase(fetchIngramHaloItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export default ingramSlice.reducer;
