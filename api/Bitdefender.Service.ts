import httpCommon from "./http.common";

export const fetchBitdefender = () => {
  return httpCommon.get(`/bitdefender`);
};

export const getBitdefenderCustomers = () => {
  return httpCommon.get(`/bitdefender/customers`);
};

export const createBitdefenderCustomers = (data: Record<string, any>) => {
  return httpCommon.post(`/bitdefender/customers`, data);
};

export const updateBitdefenderCustomer = (
  customerId: number,
  data: Record<string, any>
) => {
  return httpCommon.put(`/bitdefender/customers/${customerId}`, data);
};

export const getBitdefenderItems = () => {
  return httpCommon.get(`/bitdefender/items`);
};

export const createBitdefenderItems = (data: Record<string, any>) => {
  return httpCommon.post(`/bitdefender/items`, data);
};

export const updateBitdefenderItem = (
  itemId: number,
  data: Record<string, any>
) => {
  return httpCommon.put(`/bitdefender/items/${itemId}`, data);
};

export const getBitdefenderItemWithCustomer = (itemId: number) => {
  return httpCommon.get(`/bitdefender/items/${itemId}`);
};

const bitdefenderService = {
  fetchBitdefender,
  getBitdefenderCustomers,
  createBitdefenderCustomers,
  updateBitdefenderCustomer,
  getBitdefenderItems,
  createBitdefenderItems,
  updateBitdefenderItem,
  getBitdefenderItemWithCustomer,
};

export default bitdefenderService;
