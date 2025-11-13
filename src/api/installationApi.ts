import axiosClient from "./axiosClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const installationApi = {
  createInstallation: (token: string, payload: any) =>
    axiosClient.post(`${API_URL}/installations`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getUserHuaweiInstallations: (token: string) =>
    axiosClient.get(`${API_URL}/huawei/stations`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};