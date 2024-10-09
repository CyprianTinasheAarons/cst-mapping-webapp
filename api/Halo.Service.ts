import httpCommon from "./http.common";

export const getHaloClients = () => {
  return httpCommon.get(`/halo`);
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

export const createHaloRecurringInvoiceTemplate = (
  data: Record<string, any>
) => {
  return httpCommon.post(`/halo/recurring-invoice-template`, data);
};

export const createHaloRecurringInvoice = (data: Record<string, any>) => {
  return httpCommon.post(`/halo/recurring-invoice`, data);
};

const HaloService = {
  getHaloClients,
  getHaloItems,
  getHaloContracts,
  getHaloContractDetails,
  getHaloRecurringInvoices,
  createHaloRecurringInvoiceTemplate,
  createHaloRecurringInvoice,
  getHaloItemById,
};

export default HaloService;
