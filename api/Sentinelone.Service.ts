import httpCommon from "./http.common";

export const fetchSentinelone = () => {
  return httpCommon.get('/sentinelone');
};

export const getSentineloneCustomers = () => {
  return httpCommon.get('/sentinelone/customers');
};

export const createSentineloneCustomers = (data: Record<string, any>) => {
  return httpCommon.post('/sentinelone/customers', data);
};

export const updateSentineloneCustomer = (customerId: number, data: Record<string, any>) => {
  return httpCommon.put(`/sentinelone/customers/${customerId}`, data);
};

export const getSentineloneItems = () => {
  return httpCommon.get('/sentinelone/items');
};

export const createSentineloneItems = (data: Record<string, any>) => {
  return httpCommon.post('/sentinelone/items', data);
};

export const updateSentineloneItem = (itemId: number, data: Record<string, any>) => {
  return httpCommon.put(`/sentinelone/items/${itemId}`, data);
};

export const getSentineloneItemWithCustomer = (itemId: number) => {
  return httpCommon.get(`/sentinelone/items/${itemId}`);
};

const sentineloneService = {
  fetchSentinelone,
  getSentineloneCustomers,
  createSentineloneCustomers,
  updateSentineloneCustomer,
  getSentineloneItems,
  createSentineloneItems,
  updateSentineloneItem,
  getSentineloneItemWithCustomer,
};

export default sentineloneService;
