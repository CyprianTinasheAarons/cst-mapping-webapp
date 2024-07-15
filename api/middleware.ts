import httpCommon from "./http.common";

export const getHaloClients = (data: any) => {
  return httpCommon.get(`/halo`, data);
};

export const getBitdefenderCompaniesWithDeviceCount = (data: any) => {
  return httpCommon.get(`/bitdefender`, data);
};

export const getSentinelOneCustomers = (data: any) => {
  return httpCommon.get(`/sentinelOne`, data);
};

export const getSupabaseTableMapping = () => {
  return httpCommon.get(`/supabase/mapping`);
};

export const toggleClientDisabledStatus = (data: any) => {
  return httpCommon.post(`/supabase/toggle-client-disabled-status`, data);
};

export const setOverrideStatus = (data: any) => {
  return httpCommon.post(`/supabase/set-override-status`, data);
};

const MiddlewareService = {
  getHaloClients,
  getBitdefenderCompaniesWithDeviceCount,
  getSentinelOneCustomers,
  getSupabaseTableMapping,
  toggleClientDisabledStatus,
  setOverrideStatus,
};

export default MiddlewareService;
