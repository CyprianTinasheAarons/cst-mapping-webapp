import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import HaloService from "@/api/Halo.Service";
import GammaService from "@/api/Gamma.Service";
import IngramService from "@/api/Ingram.Service";
import BitdefenderService from "@/api/Bitdefender.Service";
import DuoService from "@/api/Duo.Service";
import SentineloneService from "@/api/Sentinelone.Service";

export const fetchHaloClients = createAsyncThunk(
  "halo/fetchClients",
  async () => {
    const response = await HaloService.getHaloClients();
    return response.data;
  }
);

export const fetchHaloItems = createAsyncThunk("halo/fetchItems", async () => {
  const response = await HaloService.getHaloItems();
  return response.data;
});

export const fetchHaloContracts = createAsyncThunk(
  "halo/fetchContracts",
  async (search?: string) => {
    const response = await HaloService.getHaloContracts(search);
    return response.data;
  }
);

export const updateIngramHaloItem = createAsyncThunk(
  "halo/updateIngramHaloItem",
  async (data: Record<string, any>) => {
    const response = await IngramService.updateIngramHaloItem(data);
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
    const response = await IngramService.createHaloRecurringInvoice(
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
    const response = await IngramService.getIngramHaloItem(itemId);
    return response.data;
  }
);

export const fetchGammaHaloItem = createAsyncThunk(
  "gamma/fetchHaloItem",
  async (id: number) => {
    const response = await GammaService.getGammaHaloItem(id);
    return response.data;
  }
);

export const fetchSentineloneHaloItem = createAsyncThunk(
  "sentinelone/fetchHaloItem",
  async (id: number) => {
    const response = await SentineloneService.getSentineloneItemWithCustomer(id);
    return response.data;
  }
);

export const fetchDuoHaloItem = createAsyncThunk(
  "duo/fetchHaloItem",
  async (id: number) => {
    const response = await DuoService.getDuoItemWithCustomer(id);
    return response.data;
  }
);

export const fetchBitdefenderHaloItem = createAsyncThunk(
  "bitdefender/fetchHaloItem",
  async (id: number) => {
    const response = await BitdefenderService.getBitdefenderItemWithCustomer(id);
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
      })
      .addCase(fetchGammaHaloItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGammaHaloItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentItem = action.payload;
      })
      .addCase(fetchGammaHaloItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export default haloSlice.reducer;
