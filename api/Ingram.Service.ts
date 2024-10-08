import httpCommon from "./http.common";

export const getHaloClients = (data: any) => {
  return httpCommon.get(`/halo`, data);
};

export const getHaloItems = () => {
  return httpCommon.get(`/halo/items`);
};

export const getHaloContracts = (search?: string) => {
  const params = search ? { search } : undefined;
  return httpCommon.get(`/halo/contracts`, { params });
};

export const createHaloRecurringInvoiceTemplate = () => {
  return httpCommon.post(`/halo/recurring-invoice-template`);
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

export const getIngramHaloItem = (itemId: number) => {
  return httpCommon.get(`/supabase/ingram-halo-item/${itemId}`);
};

export const getIngramClients = () => {
  return httpCommon.get(`/ingram`);
};

export const updateIngramHaloCustomerSync = (
  customerId: number,
  synced: boolean,
  haloDetails?: Record<string, any>
) =>
  httpCommon.put(
    `/supabase/update-ingram-halo-customer-sync/${customerId}?synced=${synced}`,
    {
      customer_halo_id: haloDetails?.customer_halo_id,
      halo_name: haloDetails?.halo_name,
    }
  );

export const getIngramSubscriptions = (customerId: string) => {
  return httpCommon.get(`/ingram/subscriptions/${customerId}`);
};

export const getIngramHaloCustomers = () => {
  return httpCommon.get(`/supabase/ingram-halo-customers`);
};

export const getAllIngramHaloItems = () => {
  return httpCommon.get(`/supabase/ingram-halo-items`);
};

export const updateIngramHaloItem = (data: Record<string, any>) =>
  httpCommon.put(`/supabase/update-ingram-halo-item`, data);

const ingramService = {
  getIngramClients,
  getIngramSubscriptions,
  getIngramHaloCustomers,
  updateIngramHaloCustomerSync,
  getHaloContracts,
  createHaloRecurringInvoice,
  createHaloRecurringInvoiceTemplate,
  updateIngramHaloItem,
  getAllIngramHaloItems,
  getIngramHaloItem,
};

export default ingramService;
