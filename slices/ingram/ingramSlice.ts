import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import IngramService from "@/api/Ingram.Service";

export const fetchIngramClients = createAsyncThunk(
  "ingram/fetchClients",
  async () => {
    const response = await IngramService.getIngramHaloCustomers();
    return response.data;
  }
);

export const fetchIngramHaloItems = createAsyncThunk(
  "ingram/fetchHaloItems",
  async () => {
    const response = await IngramService.getAllIngramHaloItems();
    const filteredItems = response.data.filter((item: any) => {
      const name = item.item_ingram_name?.toLowerCase() || '';
      return name.includes('adobe') || name.includes('fly') || 
             name.includes('dropbox') || name.includes('azure');
    });
    return filteredItems;
  }
);

export const fetchIngramSubscriptions = createAsyncThunk(
  "ingram/fetchSubscriptions",
  async (customerId: string) => {
    const response = await IngramService.getIngramSubscriptions(customerId);
    const filteredSubscriptions = response.data.filter((subscription: any) => {
      const name = subscription.item_ingram_name?.toLowerCase() || '';
      return name.includes('adobe') || name.includes('fly') || 
             name.includes('dropbox') || name.includes('azure');
    });
    return filteredSubscriptions;
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
    const response = await IngramService.updateIngramHaloCustomerSync(
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
