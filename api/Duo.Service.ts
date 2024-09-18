import httpCommon from "./http.common";

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
 * Updates the Duo customer sync status
 * @param {number} customerId - The ID of the customer
 * @param {boolean} synced - The sync status
 * @param {Object} duoDetails - Additional details for the Duo customer
 * @returns {Promise} - Promise resolving to the updated customer record
 */
export const updateDuoCustomerSync = (
  customerId: number,
  synced = true,
  duoDetails?: Record<string, any>
) =>
  httpCommon.put(`/supabase/update-duo-customer-sync/${customerId}`, {
    customer_duo_id: duoDetails?.customer_duo_id,
    duo_name: duoDetails?.duo_name,
  });

/**
 * Fetches Duo subscriptions for a specific customer
 * @param {string} customerId - The ID of the customer
 * @returns {Promise} - Promise resolving to the Duo subscriptions data
 */
export const getDuoSubscriptions = (customerId: string) => {
  return httpCommon.get(`/duo/subscriptions/${customerId}`);
};

/**
 * Fetches all Duo customers data
 * @returns {Promise} - Promise resolving to the Duo customers data
 */
export const getAllDuoCustomers = () => {
  return httpCommon.get(`/supabase/duo-customers`);
};

/**
 * Fetches all Duo items data
 * @returns {Promise} - Promise resolving to the Duo items data
 */
export const getAllDuoItems = () => {
  return httpCommon.get(`/supabase/duo-items`);
};

/**
 * Updates the Duo item mapping
 * @param {Object} data - The data to update
 * @returns {Promise} - Promise resolving to the updated item record
 */
export const updateDuoItem = (data: Record<string, any>) =>
  httpCommon.put(`/supabase/update-duo-item`, data);

const Service = {
  getDuoCustomers,
  updateDuoCustomerSync,
  getDuoSubscriptions,
  getAllDuoCustomers,
  getAllDuoItems,
  updateDuoItem,
};

export default Service;
