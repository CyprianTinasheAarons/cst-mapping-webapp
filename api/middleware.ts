// Import the HTTP common utility for making API requests
import httpCommon from "./http.common";

// ---- Halo API ----

/**
 * Fetches Halo clients data
 * @param {any} data - Query parameters for the request
 * @returns {Promise} - Promise resolving to the Halo clients data
 */
export const getHaloClients = (data: any) => {
  return httpCommon.get(`/halo`, data);
};

/**
 * Fetches Halo items data
 * @returns {Promise} - Promise resolving to the Halo items data
 */
export const getHaloItems = () => {
  return httpCommon.get(`/halo/items`);
};

/**
 * Fetches Halo contracts data
 * @param {string} search - Optional search parameter
 * @returns {Promise} - Promise resolving to the Halo contracts data
 */
export const getHaloContracts = (search?: string) => {
  const params = search ? { search } : undefined;
  return httpCommon.get(`/halo/contracts`, { params });
};

/**
 * Creates a Halo recurring invoice template
 * @param {Record<string, any>} data - The data for creating the recurring invoice template
 * @returns {Promise} - Promise resolving to the created recurring invoice template
 */
export const createHaloRecurringInvoiceTemplate = () => {
  return httpCommon.post(`/halo/recurring-invoice-template`);
};

/**
 * Creates a Halo recurring invoice
 * @param {number} clientId - The ID of the client
 * @param {string} contractId - The ID of the contract
 * @param {Array<{ id: number, count: number, accountsid: string, baseprice: number }>} items - The items for the recurring invoice
 * @returns {Promise} - Promise resolving to the created recurring invoice
 */
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

/**
 * Fetches a specific Ingram Halo item by ID
 * @param {number} itemId - The ID of the Ingram Halo item
 * @returns {Promise} - Promise resolving to the specific Ingram Halo item data
 */
export const getIngramHaloItem = (itemId: number) => {
  return httpCommon.get(`/supabase/ingram-halo-item/${itemId}`);
};

// ---- Ingram API ----

/**
 * Fetches Ingram clients data
 * @returns {Promise} - Promise resolving to the Ingram clients data
 */
export const getIngramClients = () => {
  return httpCommon.get(`/ingram`);
};

/**
 * Updates the Ingram Halo customer sync status
 * @param {number} customerId - The ID of the customer
 * @param {boolean} synced - The sync status
 * @param {Object} haloDetails - Additional details for the Halo customer
 * @returns {Promise} - Promise resolving to the updated customer record
 */
export const updateIngramHaloCustomerSync = (
  customerId: number,
  synced = true,
  haloDetails?: Record<string, any>
) =>
  httpCommon.put(`/supabase/update-ingram-halo-customer-sync/${customerId}`, {
    customer_halo_id: haloDetails?.customer_halo_id,
    halo_name: haloDetails?.halo_name,
  });

/**
 * Fetches Ingram subscriptions for a specific customer
 * @param {string} customerId - The ID of the customer
 * @returns {Promise} - Promise resolving to the Ingram subscriptions data
 */
export const getIngramSubscriptions = (customerId: string) => {
  return httpCommon.get(`/ingram/subscriptions/${customerId}`);
};

/**
 * Fetches all Ingram Halo customers data
 * @returns {Promise} - Promise resolving to the Ingram Halo customers data
 */
export const getIngramHaloCustomers = () => {
  return httpCommon.get(`/supabase/ingram-halo-customers`);
};

/**
 * Fetches all Ingram Halo items data
 * @returns {Promise} - Promise resolving to the Ingram Halo items data
 */
export const getAllIngramHaloItems = () => {
  return httpCommon.get(`/supabase/ingram-halo-items`);
};


/**
 * Updates the Ingram Halo item mapping
 * @param {Object} data - The data to update
 * @returns {Promise} - Promise resolving to the updated item record
 */
export const updateIngramHaloItem = (data: Record<string, any>) =>
  httpCommon.put(`/supabase/update-ingram-halo-item`, data);


// ---- Bitdefender API ----

/**
 * Retrieves Bitdefender companies with device count
 * @param {any} data - Query parameters for the request
 * @returns {Promise} - Promise resolving to the Bitdefender companies data
 */
export const getBitdefenderCompaniesWithDeviceCount = (data: any) => {
  return httpCommon.get(`/bitdefender`, data);
};

// ---- SentinelOne API ----

/**
 * Fetches SentinelOne customers data
 * @param {any} data - Query parameters for the request
 * @returns {Promise} - Promise resolving to the SentinelOne customers data
 */
export const getSentinelOneCustomers = (data: any) => {
  return httpCommon.get(`/sentinelOne`, data);
};

// ---- Supabase API ----

/**
 * Retrieves the mapping table from Supabase
 * @returns {Promise} - Promise resolving to the mapping table data
 */
export const getSupabaseTableMapping = () => {
  return httpCommon.get(`/supabase/mapping`);
};

// ---- Toggle Disabled Status APIs ----

/**
 * Toggles the disabled status for a SentinelOne client
 * @param {any} data - Object containing client_id
 * @returns {Promise} - Promise resolving to the updated status
 */
export const toggleSentinelOneDisabledStatus = (data: any) => {
  const url = `/supabase/toggle-client-disabled-status?client_id=${data.client_id}&type=sentinelone`;
  return httpCommon.put(url);
};

/**
 * Toggles the disabled status for a Bitdefender client
 * @param {any} data - Object containing client_id
 * @returns {Promise} - Promise resolving to the updated status
 */
export const toggleBitdefenderDisabledStatus = (data: any) => {
  const url = `/supabase/toggle-client-disabled-status?client_id=${data.client_id}&type=bitdefender`;
  return httpCommon.put(url);
};

// ---- Override Status APIs ----

/**
 * Sets the override status for a Bitdefender client
 * @param {any} data - Object containing client_id, enable status, and count
 * @returns {Promise} - Promise resolving to the updated override status
 */
export const setBitdefenderOverrideStatus = (data: any) => {
  const url = `/supabase/set-bitdefender-override-status?client_id=${data.client_id}&enable=${data.enable}&count=${data.count}`;
  return httpCommon.put(url);
};

/**
 * Sets the override status for a SentinelOne client
 * @param {any} data - Object containing client_id, enable status, and count
 * @returns {Promise} - Promise resolving to the updated override status
 */
export const setSentinelOneOverrideStatus = (data: any) => {
  const url = `/supabase/set-sentinelone-override-status?client_id=${data.client_id}&enable=${data.enable}&count=${data.count}`;
  return httpCommon.put(url);
};

// ---- Duo API ----

/**
 * Fetches Duo customers data
 * @param {any} data - Query parameters for the request
 * @returns {Promise} - Promise resolving to the Duo customers data
 */
export const getDuoCustomers = (data: any) => {
  return httpCommon.get(`/duo`, data);
};

/**
 * Toggles the disabled status for a Duo client
 * @param {any} data - Object containing client_id
 * @returns {Promise} - Promise resolving to the updated status
 */
export const toggleDuoDisabledStatus = (data: any) => {
  const url = `/supabase/toggle-client-disabled-status?client_id=${data.client_id}&type=duo`;
  return httpCommon.put(url);
};

/**
 * Sets the override status for a Duo client
 * @param {any} data - Object containing client_id, enable status, and count
 * @returns {Promise} - Promise resolving to the updated override status
 */
export const setDuoOverrideStatus = (data: any) => {
  const url = `/supabase/set-duo-override-status?client_id=${data.client_id}&enable=${data.enable}&count=${data.count}`;
  return httpCommon.put(url);
};

// ---- Middleware Service Object ----

const MiddlewareService = {
  getHaloClients,
  getHaloItems,
  getIngramClients,
  getIngramSubscriptions,
  getBitdefenderCompaniesWithDeviceCount,
  getSentinelOneCustomers,
  getSupabaseTableMapping,
  toggleSentinelOneDisabledStatus,
  toggleBitdefenderDisabledStatus,
  setBitdefenderOverrideStatus,
  setSentinelOneOverrideStatus,
  toggleDuoDisabledStatus,
  setDuoOverrideStatus,
  getDuoCustomers,
  getIngramHaloCustomers,
  updateIngramHaloCustomerSync,
  getHaloContracts,
  createHaloRecurringInvoice,
  createHaloRecurringInvoiceTemplate,
  updateIngramHaloItem,
  getAllIngramHaloItems,
  getIngramHaloItem,
};

export default MiddlewareService;
