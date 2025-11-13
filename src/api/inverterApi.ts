import axiosClient from "./axiosClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const inverterApi = {
  
  createInverter: (token: string, payload: any) =>
    axiosClient.post(`${API_URL}/inverters`, payload, {
      headers: { Authorization: `Bearer ${token}` },
  }),
  
  getInstallationInverters: (token: string, stationCode: string) =>
    axiosClient.get(`${API_URL}/huawei/devices`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { station_code: stationCode },
  }),
  
    // getDeviceProduction: (token: string, deviceId: string) =>
  //   axiosClient.get(`${API_URL}/huawei/device/production`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //     params: { device_id: deviceId },
  // }),

  getDeviceProduction: (token: string, inverterId: number) =>
    axiosClient.get(`${API_URL}/inverter-power/${inverterId}/power/latest`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
