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

export const toggleSentinelOneDisabledStatus = (data: any) => {
  const url = `/supabase/toggle-client-disabled-status?client_id=${data.client_id}&type=sentinelone`;
  return httpCommon.put(url);
};

export const toggleBitdefenderDisabledStatus = (data: any) => {
  const url = `/supabase/toggle-client-disabled-status?client_id=${data.client_id}&type=bitdefender`;
  return httpCommon.put(url);
};

export const setBitdefenderOverrideStatus = (data: any) => {
  const url = `/supabase/set-bitdefender-override-status?client_id=${data.client_id}&enable=${data.enable}&count=${data.count}`;
  return httpCommon.put(url);
};

export const setSentinelOneOverrideStatus = (data: any) => {
  const url = `/supabase/set-sentinelone-override-status?client_id=${data.client_id}&enable=${data.enable}&count=${data.count}`;
  return httpCommon.put(url);
};

const MiddlewareService = {
  getHaloClients,
  getBitdefenderCompaniesWithDeviceCount,
  getSentinelOneCustomers,
  getSupabaseTableMapping,
  toggleSentinelOneDisabledStatus,
  toggleBitdefenderDisabledStatus,
  setBitdefenderOverrideStatus,
  setSentinelOneOverrideStatus,
};

export default MiddlewareService;
