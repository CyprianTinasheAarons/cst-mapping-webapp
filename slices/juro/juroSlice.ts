import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import juroService from "../../api/Juro.Service";
import HaloService from "@/api/Halo.Service";
import { AxiosError } from "axios";

// Helper function to extract error messages
const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message;
  }
  return String(error);
};

export const checkJuroHealth = createAsyncThunk(
  "juro/checkHealth",
  async () => {
    const response = await juroService.checkHealth();
    return response.data;
  }
);

export const fetchJuroTemplates = createAsyncThunk(
  "juro/fetchTemplates",
  async () => {
    const response = await juroService.getTemplates();
    return response.data;
  }
);

export const fetchJuroTemplate = createAsyncThunk(
  "juro/fetchTemplate",
  async (templateId: string) => {
    const response = await juroService.getTemplate(templateId);
    return response.data;
  }
);

export const createJuroContract = createAsyncThunk(
  "juro/createContract",
  async (data: Record<string, any>) => {
    const response = await juroService.createContract(data);
    return response.data;
  }
);

export const uploadJuroContractPdf = createAsyncThunk(
  "juro/uploadContractPdf",
  async (contractData: Record<string, any>) => {
    const response = await juroService.uploadContractPdf(contractData);
    return response.data;
  }
);

export const sendContractForSigning = createAsyncThunk(
  "juro/sendContractForSigning",
  async ({
    contractId,
    signingUid,
    data,
  }: {
    contractId: string;
    signingUid: string;
    data: Record<string, any>;
  }) => {
    const response = await juroService.sendContractForSigning(
      contractId,
      signingUid,
      data
    );
    return response.data;
  }
);

export const signContract = createAsyncThunk(
  "juro/signContract",
  async ({
    contractId,
    data,
  }: {
    contractId: string;
    data: Record<string, any>;
  }) => {
    const response = await juroService.signContract(contractId, data);
    return response.data;
  }
);

export const downloadContractPdf = createAsyncThunk(
  "juro/downloadContractPdf",
  async (contractId: string) => {
    const response = await juroService.downloadContractPdf(contractId);
    return response;
  }
);

export const addContractToHalo = createAsyncThunk(
  "juro/addContractToHalo",
  async ({
    clientId,
    contractData,
  }: {
    clientId: number;
    contractData: Record<string, any>;
  }) => {
    // First upload the contract data to Juro
    const juroResponse = await juroService.createContract(contractData);
    const juroContractId = juroResponse.data.id;

    // Then add the contract reference to Halo
    const haloData = {
      client_id: clientId,
      juro_contract_id: juroContractId,
      contract_name: contractData.title || "Contract",
      contract_type: contractData.type || "Service Agreement",
      start_date: contractData.startDate || new Date().toISOString(),
      end_date: contractData.endDate,
      status: "Active",
      metadata: {
        source: "Juro",
        template: contractData.templateId,
        fields: contractData.fields,
      },
    };

    const haloResponse = await HaloService.createHaloContract(haloData);
    return {
      juro: juroResponse.data,
      halo: haloResponse.data,
    };
  }
);

// Document links thunks
export const getClientDocumentLinks = createAsyncThunk(
  "juro/getClientDocumentLinks",
  async (clientId: string, { rejectWithValue }) => {
    try {
      const response = await juroService.getClientDocumentLinks(clientId);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createDocumentLink = createAsyncThunk(
  "juro/createDocumentLink",
  async (
    { clientId, data }: { clientId: string; data: Record<string, any> },
    { rejectWithValue }
  ) => {
    try {
      const response = await juroService.createDocumentLink(clientId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateDocumentLink = createAsyncThunk(
  "juro/updateDocumentLink",
  async (
    {
      clientId,
      documentId,
      data,
    }: { clientId: string; documentId: string; data: Record<string, any> },
    { rejectWithValue }
  ) => {
    try {
      const response = await juroService.updateDocumentLink(clientId, documentId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteDocumentLink = createAsyncThunk(
  "juro/deleteDocumentLink",
  async (
    { clientId, documentId }: { clientId: string; documentId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await juroService.deleteDocumentLink(clientId, documentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Autofill template thunk
export const autofillContract = createAsyncThunk(
  "juro/autofillContract",
  async (
    data: { 
      template_id: string; 
      client_id?: number; 
      ticket_id?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await juroService.autofillContract(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// User settings thunks
export const getUserSettings = createAsyncThunk(
  "juro/getUserSettings",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await juroService.getUserSettings(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createOrUpdateUserSettings = createAsyncThunk(
  "juro/createOrUpdateUserSettings",
  async (
    { userId, data }: { userId: string; data: Record<string, any> },
    { rejectWithValue }
  ) => {
    try {
      const response = await juroService.createOrUpdateUserSettings(userId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

interface JuroContract {
  id: number;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

interface JuroTemplate {
  id: string;
  name: string;
  description: string | null;
  createdDate: string;
  updatedDate: string;
  version: number;
  status: string;
}

interface DocumentLink {
  id: string;
  client_id: string;
  document_id: string;
  document_url: string;
  document_title: string;
  created_at: string;
  updated_at: string;
  status?: string;
}

interface UserSettings {
  id: string;
  user_id: string;
  auto_send_for_signing: boolean;
  default_signatory_email?: string;
  created_at: string;
  updated_at: string;
}

interface JuroState {
  contracts: JuroContract[];
  templates: JuroTemplate[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  documentLinks: Record<string, DocumentLink[]>; // clientId -> DocumentLinks[]
  userSettings: UserSettings | null;
  autofilledContract: JuroContract | null;
}

const initialState: JuroState = {
  contracts: [],
  templates: [],
  status: "idle",
  error: null,
  documentLinks: {},
  userSettings: null,
  autofilledContract: null,
};

const juroSlice = createSlice({
  name: "juro",
  initialState,
  reducers: {
    clearCurrentContract: (state) => {
      state.contracts = [];
    },
    clearCurrentTemplate: (state) => {
      state.templates = [];
    },
    clearAutofilledContract: (state) => {
      state.autofilledContract = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Health
      .addCase(checkJuroHealth.pending, (state) => {
        state.status = "loading";
      })
      .addCase(checkJuroHealth.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(checkJuroHealth.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      // Templates
      .addCase(fetchJuroTemplates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchJuroTemplates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.templates = action.payload;
      })
      .addCase(fetchJuroTemplates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      .addCase(fetchJuroTemplate.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchJuroTemplate.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.templates = [action.payload];
      })
      .addCase(fetchJuroTemplate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      // Contracts
      .addCase(createJuroContract.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createJuroContract.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.contracts.push(action.payload);
      })
      .addCase(createJuroContract.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      .addCase(uploadJuroContractPdf.pending, (state) => {
        state.status = "loading";
      })
      .addCase(uploadJuroContractPdf.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.contracts.push(action.payload);
      })
      .addCase(uploadJuroContractPdf.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      .addCase(addContractToHalo.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addContractToHalo.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.contracts.push(action.payload.juro);
      })
      .addCase(addContractToHalo.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      .addCase(sendContractForSigning.pending, (state) => {
        state.status = "loading";
      })
      .addCase(sendContractForSigning.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.contracts.findIndex(
          (contract) => contract.id === action.payload.id
        );
        if (index !== -1) {
          state.contracts[index] = action.payload;
        }
        state.contracts.push(action.payload);
      })
      .addCase(sendContractForSigning.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      .addCase(signContract.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signContract.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.contracts.findIndex(
          (contract) => contract.id === action.payload.id
        );
        if (index !== -1) {
          state.contracts[index] = action.payload;
        }
        state.contracts.push(action.payload);
      })
      .addCase(signContract.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      .addCase(downloadContractPdf.pending, (state) => {
        state.status = "loading";
      })
      .addCase(downloadContractPdf.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(downloadContractPdf.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      // Document links
      .addCase(getClientDocumentLinks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getClientDocumentLinks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.documentLinks[action.meta.arg] = action.payload;
      })
      .addCase(getClientDocumentLinks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      .addCase(createDocumentLink.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createDocumentLink.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (!state.documentLinks[action.meta.arg.clientId]) {
          state.documentLinks[action.meta.arg.clientId] = [];
        }
        state.documentLinks[action.meta.arg.clientId].push(action.payload);
      })
      .addCase(createDocumentLink.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      .addCase(updateDocumentLink.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateDocumentLink.fulfilled, (state, action) => {
        state.status = "succeeded";
        const clientId = action.meta.arg.clientId;
        const documentId = action.meta.arg.documentId;
        if (state.documentLinks[clientId]) {
          const index = state.documentLinks[clientId].findIndex(
            (link) => link.id === documentId
          );
          if (index !== -1) {
            state.documentLinks[clientId][index] = action.payload;
          }
        }
      })
      .addCase(updateDocumentLink.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      .addCase(deleteDocumentLink.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteDocumentLink.fulfilled, (state, action) => {
        state.status = "succeeded";
        const clientId = action.meta.arg.clientId;
        const documentId = action.meta.arg.documentId;
        if (state.documentLinks[clientId]) {
          state.documentLinks[clientId] = state.documentLinks[clientId].filter(
            (link) => link.id !== documentId
          );
        }
      })
      .addCase(deleteDocumentLink.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      // Autofill template
      .addCase(autofillContract.pending, (state) => {
        state.status = "loading";
        state.autofilledContract = null;
      })
      .addCase(autofillContract.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.autofilledContract = action.payload;
      })
      .addCase(autofillContract.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
        state.autofilledContract = null;
      })

      // User settings
      .addCase(getUserSettings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getUserSettings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userSettings = action.payload;
      })
      .addCase(getUserSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      .addCase(createOrUpdateUserSettings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createOrUpdateUserSettings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userSettings = action.payload;
      })
      .addCase(createOrUpdateUserSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export const { clearCurrentContract, clearCurrentTemplate, clearAutofilledContract } = juroSlice.actions;
export default juroSlice.reducer;
