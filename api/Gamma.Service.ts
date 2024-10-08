import httpCommon from "./http.common";

export const getGammaCustomers = () => {
  return httpCommon.get(`/gamma/gamma-halo-customers`);
};

export const updateGammaHaloCustomerSync = (
  customerId: number,
  synced = true,
  haloDetails?: Record<string, any>
) =>
  httpCommon.put(
    `/gamma/update-gamma-halo-customer-sync/${customerId}?synced=${synced}`,
    {
      customer_halo_id: haloDetails?.customer_halo_id,
      halo_name: haloDetails?.halo_name,
    }
  );

export const getAllGammaHaloItems = () => {
  return httpCommon.get(`/gamma/gamma-halo-items`);
};

export const updateGammaHaloItem = (data: Record<string, any>) => {
  return httpCommon.put("/gamma/update-gamma-halo-item", data);
};

export const getGammaHaloItem = (id: number) => {
  return httpCommon.get(`/gamma/gamma-halo-item/${id}`);
};

const gammaService = {
  getGammaCustomers,
  updateGammaHaloCustomerSync,
  getAllGammaHaloItems,
  updateGammaHaloItem,
  getGammaHaloItem,
};

export default gammaService;
