import httpCommon from "./http.common";

export const fetchDuo = () => {
  return httpCommon.get(`/duo`);
};

export const getDuoCustomers = () => {
  return httpCommon.get(`/duo/customers`);
};

export const createDuoCustomers = (data: Record<string, any>) => {
  return httpCommon.post(`/duo/customers`, data);
};

export const updateDuoCustomer = (customerId: number, data: Record<string, any>) => {
  return httpCommon.put(`/duo/customers/${customerId}`, data);
};

export const getDuoItems = () => {
  return httpCommon.get(`/duo/items`);
};

export const createDuoItems = (data: Record<string, any>) => {
  return httpCommon.post(`/duo/items`, data);
};

export const updateDuoItem = (itemId: number, data: Record<string, any>) => {
  return httpCommon.put(`/duo/items/${itemId}`, data);
};

export const getDuoItemWithCustomer = (itemId: number) => {
  return httpCommon.get(`/duo/items/${itemId}`);
};

const duoService = {
  fetchDuo,
  getDuoCustomers,
  createDuoCustomers,
  updateDuoCustomer,
  getDuoItems,
  createDuoItems,
  updateDuoItem,
  getDuoItemWithCustomer,
};

export default duoService;
