import httpCommon from "./http.common";

export const createIngramAutoSyncRecurringInvoice = (
  data: Record<string, any>
) => {
  return httpCommon.post(`/supabase/ingram-auto-sync-recurring-invoice`, data);
};

export const getIngramAutoSyncRecurringInvoice = (invoiceId: number) => {
  return httpCommon.get(
    `/supabase/ingram-auto-sync-recurring-invoice/${invoiceId}`
  );
};

export const getAllIngramAutoSyncRecurringInvoices = () => {
  return httpCommon.get(`/supabase/ingram-auto-sync-recurring-invoice`);
};

export const updateIngramAutoSyncRecurringInvoice = (
  invoiceId: number,
  autosync: boolean
) => {
  return httpCommon.put(
    `/supabase/ingram-auto-sync-recurring-invoice/${invoiceId}`,
    { autosync },
    { params: { autosync } }
  );
};

export const deleteIngramAutoSyncRecurringInvoice = (invoiceId: number) => {
  return httpCommon.delete(
    `/supabase/ingram-auto-sync-recurring-invoice/${invoiceId}`
  );
};

const ingramAutoSyncService = {
  createIngramAutoSyncRecurringInvoice,
  getIngramAutoSyncRecurringInvoice,
  getAllIngramAutoSyncRecurringInvoices,
  updateIngramAutoSyncRecurringInvoice,
  deleteIngramAutoSyncRecurringInvoice,
};

export default ingramAutoSyncService;
