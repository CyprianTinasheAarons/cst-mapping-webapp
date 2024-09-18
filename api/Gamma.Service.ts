import httpCommon from "./http.common";

// ---- Gamma API ----

/**
 * Fetches Gamma customers data
 * @param {any} data - Query parameters for the request
 * @returns {Promise} - Promise resolving to the Gamma customers data
 */
export const getGammaCustomers = () => {
  return httpCommon.get(`/supabase/gamma-halo-customers`);
};

/**
 * Updates the Gamma Halo customer sync status
 * @param {number} customerId - The ID of the customer
 * @param {boolean} synced - The sync status (default: true)
 * @param {Object} haloDetails - Additional details for the Halo customer
 * @returns {Promise} - Promise resolving to the updated customer record
 */
export const updateGammaHaloCustomerSync = (
  customerId: number,
  synced: boolean,
  haloDetails?: Record<string, any>
) =>
  httpCommon.put(`/supabase/update-gamma-halo-customer-sync/${customerId}`, {
    customer_halo_id: haloDetails?.customer_halo_id,
    halo_name: haloDetails?.halo_name,
    synced: synced,
  });

/**
 * Fetches Gamma subscriptions data
 * @param {any} data - Query parameters for the request
 * @returns {Promise} - Promise resolving to the Gamma subscriptions data
 */
export const getAllGammaHaloItems = () => {
  return httpCommon.get(`/supabase/gamma-halo-items`);
};

/**
 * Updates the Gamma Halo item
 * @param {Object} itemData - The data for updating the Gamma Halo item
 * @returns {Promise} - Promise resolving to the updated item record
 */
export const updateGammaHaloItem = (data: Record<string, any>) => {
  return httpCommon.put("/supabase/update-gamma-halo-item", data);
};

/**
 * Fetches a Gamma Halo item by ID
 * @param {number} id - The ID of the Gamma Halo item
 * @returns {Promise} - Promise resolving to the Gamma Halo item data
 */
export const getGammaHaloItem = (id: number) => {
  return httpCommon.get(`/supabase/gamma-halo-item/${id}`);
};


const Service = {
  getGammaCustomers,
  updateGammaHaloCustomerSync,
  getAllGammaHaloItems,
  updateGammaHaloItem,
  getGammaHaloItem,
};

export default Service;
