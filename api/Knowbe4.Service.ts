import httpCommon from "./http.common";

export const fetchKnowbe4 = () => {
  return httpCommon.get(`/knowbe4`);
};

export const getKnowbe4Customers = () => {
  return httpCommon.get(`/knowbe4/customers`);
};

export const createKnowbe4Customers = (data: Record<string, any>) => {
  return httpCommon.post(`/knowbe4/customers`, data);
};

export const updateKnowbe4Customer = (
  customerId: number,
  data: Record<string, any>
) => {
  return httpCommon.put(`/knowbe4/customers/${customerId}`, data);
};

export const getKnowbe4Items = () => {
  return httpCommon.get(`/knowbe4/items`);
};

export const createKnowbe4Items = (data: Record<string, any>) => {
  return httpCommon.post(`/knowbe4/items`, data);
};

export const updateKnowbe4Item = (itemId: number, data: Record<string, any>) => {
  return httpCommon.put(`/knowbe4/items/${itemId}`, data);
};

export const getKnowbe4ItemWithCustomer = (
  itemHaloId: number,
  customerKnowbe4Id: number
) => {
  return httpCommon.get(`/knowbe4/items/${itemHaloId}/${customerKnowbe4Id}`);
};

const knowbe4Service = {
  fetchKnowbe4,
  getKnowbe4Customers,
  createKnowbe4Customers,
  updateKnowbe4Customer,
  getKnowbe4Items,
  createKnowbe4Items,
  updateKnowbe4Item,
  getKnowbe4ItemWithCustomer,
};

export default knowbe4Service;
