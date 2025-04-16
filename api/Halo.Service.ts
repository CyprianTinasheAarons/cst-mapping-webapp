import httpCommon from "./http.common";

export const getHaloClients = () => {
  return httpCommon.get(`/halo`);
};

export const getHaloClientById = (clientId: number) => {
  return httpCommon.get(`/halo/client/${clientId}`);
};


export const getHaloItems = (
  count: number = 300,
  search: string = "Recurring Items"
) => {
  return httpCommon.get(`/halo/items`, {
    params: { count, search },
  });
};

export const getHaloItemById = (itemId: number) => {
  return httpCommon.get(`/halo/items/${itemId}`);
};

export const getHaloContracts = (
  search?: string,
  count: number = 50,
  page: number = 1,
  includeInactive: boolean = false
) => {
  return httpCommon.get(`/halo/contracts`, {
    params: {
      search,
      count,
      page,
      include_inactive: includeInactive,
    },
  });
};

export const getHaloContractDetails = (contractId: string) => {
  return httpCommon.get(`/halo/contract/${contractId}`);
};

export const getHaloRecurringInvoices = (
  contractId: number,
  pageSize: number = 15,
  pageNo: number = 1
) => {
  return httpCommon.get(`/halo/recurring-invoices/${contractId}`, {
    params: {
      page_size: pageSize,
      page_no: pageNo,
    },
  });
};

export const createHaloRecurringInvoice = (
  clientId: number,
  contractId: string,
  items: Array<{
    id: number;
    count: number;
    accountsid: string;
    baseprice: number;
  }>
) => {
  return httpCommon.post(`/halo/recurring-invoice`, items, {
    params: {
      client_id: clientId,
      contract_id: contractId,
    },
  });
};

export const createHaloRecurringInvoiceTemplate = (
  data: Record<string, any>
) => {
  return httpCommon.post(`/halo/recurring-invoice-template`, data);
};

export const updateHaloInvoice = (
  id: number,
  clientId: number,
  contractId: string,
  items: Array<Record<string, any>>,
  old_lines: Array<Record<string, any>>
) => {
  return httpCommon.post(`/halo/invoice/${id}/${clientId}/${contractId}`, {
    items,
    old_lines,
  });
};

export const createHaloContract = (data: Record<string, any>) => {
  return httpCommon.post(`/halo/contracts`, data);
};

const HaloService = {
  getHaloClients,
  getHaloClientById,
  getHaloItems,
  getHaloContracts,
  getHaloContractDetails,
  getHaloRecurringInvoices,
  createHaloRecurringInvoiceTemplate,
  createHaloRecurringInvoice,
  getHaloItemById,
  updateHaloInvoice,
  createHaloContract,
};

export default HaloService;
