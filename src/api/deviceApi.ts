import axiosClient from "./axiosClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const deviceApi = {
    getRaspberryDevices: (token: string, raspberryId: number) =>
        axiosClient.get(`${API_URL}/devices/raspberry/${raspberryId}`, {
          headers: { Authorization: `Bearer ${token}` },
    }),
    
    createDevice: (token: string, payload: any) =>
        axiosClient.post(`${API_URL}/devices`, payload, {
          headers: { Authorization: `Bearer ${token}` },
    }),
    
    updateDevice: (token: string, id: number, payload: any) =>
        axiosClient.put(`${API_URL}/devices/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
    }),

    deleteDevice: (token: string, id: number) =>
      axiosClient.delete(`${API_URL}/devices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    
    setManualState(token: string, deviceId: number, state: boolean) {
        return axiosClient.patch(
          `${API_URL}/devices/${deviceId}/manual_state`,
          { state },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      },
};