import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import ingramAutoSyncService from "@/api/ingram.autosync.Service";

interface RecurringInvoice {
  agreement_id: number;
  autosync: boolean;
  client_id: number;
  invoice_id: number;
  items: Record<string, any>;
  old_lines: Record<string, any>;
}

interface IngramAutoSyncState {
  recurringInvoices: RecurringInvoice[];
  currentInvoice: RecurringInvoice | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export const createAutoSyncRecurringInvoice = createAsyncThunk<
  RecurringInvoice,
  Omit<RecurringInvoice, "id">
>(
  "ingramAutoSync/createRecurringInvoice",
  async (data: Omit<RecurringInvoice, "id">) => {
    const response =
      await ingramAutoSyncService.createIngramAutoSyncRecurringInvoice(data);
    return response.data;
  }
);

export const fetchAutoSyncRecurringInvoice = createAsyncThunk<
  RecurringInvoice,
  number
>("ingramAutoSync/fetchRecurringInvoice", async (invoiceId: number) => {
  const response =
    await ingramAutoSyncService.getIngramAutoSyncRecurringInvoice(invoiceId);
  return response.data;
});

export const fetchAllAutoSyncRecurringInvoices = createAsyncThunk<
  RecurringInvoice[]
>("ingramAutoSync/fetchAllRecurringInvoices", async () => {
  const response =
    await ingramAutoSyncService.getAllIngramAutoSyncRecurringInvoices();
  return response.data;
});

export const updateAutoSyncRecurringInvoice = createAsyncThunk<
  RecurringInvoice,
  { invoiceId: number; autosync: boolean }
>(
  "ingramAutoSync/updateRecurringInvoice",
  async ({ invoiceId, autosync }: { invoiceId: number; autosync: boolean }) => {
    const response =
      await ingramAutoSyncService.updateIngramAutoSyncRecurringInvoice(
        invoiceId,
        autosync
      );
    return response.data;
  }
);

export const deleteAutoSyncRecurringInvoice = createAsyncThunk<number, number>(
  "ingramAutoSync/deleteRecurringInvoice",
  async (invoiceId: number) => {
    await ingramAutoSyncService.deleteIngramAutoSyncRecurringInvoice(invoiceId);
    return invoiceId;
  }
);

const initialState: IngramAutoSyncState = {
  recurringInvoices: [],
  currentInvoice: null,
  status: "idle",
  error: null,
};

const ingramAutoSyncSlice = createSlice({
  name: "ingramAutoSync",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createAutoSyncRecurringInvoice.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createAutoSyncRecurringInvoice.fulfilled,
        (state, action: PayloadAction<RecurringInvoice>) => {
          state.status = "succeeded";
          state.recurringInvoices.push(action.payload);
        }
      )
      .addCase(createAutoSyncRecurringInvoice.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchAutoSyncRecurringInvoice.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchAutoSyncRecurringInvoice.fulfilled,
        (state, action: PayloadAction<RecurringInvoice>) => {
          state.status = "succeeded";
          state.currentInvoice = action.payload;
        }
      )
      .addCase(fetchAutoSyncRecurringInvoice.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchAllAutoSyncRecurringInvoices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchAllAutoSyncRecurringInvoices.fulfilled,
        (state, action: PayloadAction<RecurringInvoice[]>) => {
          state.status = "succeeded";
          state.recurringInvoices = action.payload;
        }
      )
      .addCase(fetchAllAutoSyncRecurringInvoices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(updateAutoSyncRecurringInvoice.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        updateAutoSyncRecurringInvoice.fulfilled,
        (state, action: PayloadAction<RecurringInvoice>) => {
          state.status = "succeeded";
          const index = state.recurringInvoices.findIndex(
            (invoice) => invoice.id === action.payload.id
          );
          if (index !== -1) {
            state.recurringInvoices[index] = action.payload;
          }
        }
      )
      .addCase(updateAutoSyncRecurringInvoice.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(deleteAutoSyncRecurringInvoice.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        deleteAutoSyncRecurringInvoice.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.status = "succeeded";
          state.recurringInvoices = state.recurringInvoices.filter(
            (invoice) => invoice.id !== action.payload
          );
        }
      )
      .addCase(deleteAutoSyncRecurringInvoice.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export default ingramAutoSyncSlice.reducer;
