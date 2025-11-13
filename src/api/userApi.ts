import axiosClient from "./axiosClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const userApi = {
  getUserDetails: async (token: string) => {
    return axiosClient.get(`${API_URL}/users/me/details`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getUserInstallations: async (token: string) => {
    return axiosClient.get(`${API_URL}/users/me/installations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getHuaweiCredentials: async (token: string) => {
    return axiosClient.get(`${API_URL}/users/me/huawei-credentials`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
