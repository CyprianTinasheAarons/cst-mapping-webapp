import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import MiddlewareService from "../../api/middleware";

export const fetchHaloClients = createAsyncThunk(
  "halo/fetchClients",
  async (data: any) => {
    const response = await MiddlewareService.getHaloClients(data);
    return response.data;
  }
);

export const fetchHaloItems = createAsyncThunk("halo/fetchItems", async () => {
  const response = await MiddlewareService.getHaloItems();
  return response.data;
});

export const fetchHaloContracts = createAsyncThunk(
  "halo/fetchContracts",
  async (search?: string) => {
    const response = await MiddlewareService.getHaloContracts(search);
    return response.data;
  }
);

export const updateIngramHaloItem = createAsyncThunk(
  "halo/updateIngramHaloItem",
  async (data: Record<string, any>) => {
    const response = await MiddlewareService.updateIngramHaloItem(data);
    return response.data;
  }
);

export const createHaloRecurringInvoice = createAsyncThunk(
  "halo/createRecurringInvoice",
  async ({
    clientId,
    contractId,
    items,
  }: {
    clientId: number;
    contractId: string;
    items: Array<{
      id: number;
      count: number;
      accountsid: string;
      baseprice: number;
    }>;
  }) => {
    const response = await MiddlewareService.createHaloRecurringInvoice(
      clientId,
      contractId,
      items
    );
    return response.data;
  }
);

export const fetchIngramHaloItem = createAsyncThunk(
  "halo/fetchIngramHaloItem",
  async (itemId: number) => {
    const response = await MiddlewareService.getIngramHaloItem(itemId);
    return response.data;
  }
);

interface HaloState {
  clients: any[];
  items: any[];
  contracts: any[];
  currentItem: any | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: HaloState = {
  clients: [],
  items: [],
  contracts: [],
  currentItem: null,
  status: "idle",
  error: null,
};

const haloSlice = createSlice({
  name: "halo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHaloClients.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchHaloClients.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.clients = action.payload;
      })
      .addCase(fetchHaloClients.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchHaloItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchHaloItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchHaloItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchHaloContracts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchHaloContracts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.contracts = action.payload;
      })
      .addCase(fetchHaloContracts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(updateIngramHaloItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateIngramHaloItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Update the item in the state if needed
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateIngramHaloItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(createHaloRecurringInvoice.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createHaloRecurringInvoice.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(createHaloRecurringInvoice.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchIngramHaloItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchIngramHaloItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentItem = action.payload;
      })
      .addCase(fetchIngramHaloItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export default haloSlice.reducer;
