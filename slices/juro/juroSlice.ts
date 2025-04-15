import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import juroService from "../../api/Juro.Service";
import HaloService from "@/api/Halo.Service";

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

export const downloadContractPdf = createAsyncThunk(
  "juro/downloadContractPdf",
  async (contractId: string) => {
    const response = await juroService.downloadContractPdf(contractId);
    return response.data;
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

interface JuroState {
  contracts: JuroContract[];
  currentContract: JuroContract | null;
  templates: JuroTemplate[];
  currentTemplate: JuroTemplate | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  healthStatus: "unknown" | "healthy" | "unhealthy";
}

const initialState: JuroState = {
  contracts: [],
  currentContract: null,
  templates: [],
  currentTemplate: null,
  status: "idle",
  error: null,
  healthStatus: "unknown",
};

const juroSlice = createSlice({
  name: "juro",
  initialState,
  reducers: {
    clearCurrentContract: (state) => {
      state.currentContract = null;
    },
    clearCurrentTemplate: (state) => {
      state.currentTemplate = null;
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
        state.healthStatus = "healthy";
      })
      .addCase(checkJuroHealth.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
        state.healthStatus = "unhealthy";
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
        state.currentTemplate = action.payload;
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
        state.currentContract = action.payload;
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
        state.currentContract = action.payload;
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
        state.currentContract = action.payload.juro;
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
        state.currentContract = action.payload;
      })
      .addCase(sendContractForSigning.rejected, (state, action) => {
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
      });
  },
});

export const { clearCurrentContract, clearCurrentTemplate } = juroSlice.actions;
export default juroSlice.reducer;
