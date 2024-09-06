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
};

export default MiddlewareService;
