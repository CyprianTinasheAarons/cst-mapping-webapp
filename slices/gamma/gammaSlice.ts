import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import GammaService from "../../api/Gamma.Service";

export const fetchGammaCustomers = createAsyncThunk(
  "gamma/fetchCustomers",
  async () => {
    const response = await GammaService.getGammaCustomers();
    return response.data.sort((a: GammaCustomer, b: GammaCustomer) =>
      a.gamma_name.localeCompare(b.gamma_name)
    );
  }
);

export const updateGammaHaloCustomerSync = createAsyncThunk(
  "gamma/updateCustomerSync",
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
    const response = await GammaService.updateGammaHaloCustomerSync(
      customerId,
      synced,
      {
        customer_halo_id: haloId,
        halo_name: haloName,
        synced: synced,
      }
    );
    return response.data;
  }
);

export const fetchGammaHaloItems = createAsyncThunk(
  "gamma/fetchHaloItems",
  async () => {
    const response = await GammaService.getAllGammaHaloItems();
    return response.data;
  }
);

export const updateGammaHaloItem = createAsyncThunk(
  "gamma/updateHaloItem",
  async (data: Record<string, any>) => {
    const response = await GammaService.updateGammaHaloItem(data);
    return response.data;
  }
);
interface GammaCustomer {
  id: number;
  customer_halo_id: number | null;
  halo_name: string | null;
  customer_gamma_id: string;
  gamma_name: string;
  synced_at: string | null;
  synced: boolean | null;
}

interface GammaState {
  customers: GammaCustomer[];
  subscriptions: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  services: any[];
}

const initialState: GammaState = {
  customers: [],
  subscriptions: [],
  status: "idle",
  error: null,
  services: [],
};

const gammaSlice = createSlice({
  name: "gamma",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGammaCustomers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGammaCustomers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customers = action.payload;
      })
      .addCase(fetchGammaCustomers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(updateGammaHaloCustomerSync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateGammaHaloCustomerSync.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.customers.findIndex(
          (customer) => customer.id === action.payload.id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      })
      .addCase(updateGammaHaloCustomerSync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchGammaHaloItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGammaHaloItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.subscriptions = action.payload;
      })
      .addCase(fetchGammaHaloItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(updateGammaHaloItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateGammaHaloItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.subscriptions.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
      })
      .addCase(updateGammaHaloItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export default gammaSlice.reducer;
