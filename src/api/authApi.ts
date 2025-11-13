import axiosClient from "./axiosClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const authApi = {
  login: async (data: { email: string; password: string }) => {
    return axiosClient.post(`${API_URL}/auth/login`, data);
  },

  register: async (data: { email: string; password: string }) => {
    return axiosClient.post(`${API_URL}/auth/register`, data);
  },

  getMe: async (token: string) => {
    return axiosClient.get(`${API_URL}/users/me/details`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
