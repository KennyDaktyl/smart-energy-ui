import axiosClient from "./axiosClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const raspberryApi = {
    getMyRaspberries: (token: string) => {
        return axiosClient.get(`${API_URL}/raspberries/me`, {
        headers: { Authorization: `Bearer ${token}` },
        });
    },
    updateRaspberry: (token: string, uuid: string, payload: any) => {
        return axiosClient.put(`${API_URL}/raspberries/${uuid}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
    }
};