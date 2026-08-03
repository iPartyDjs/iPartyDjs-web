import axios, { type AxiosError } from "axios";
import type { ApiResponse } from "@ipartydjs/shared";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => {
        const body = response.data as ApiResponse<unknown>;
        if (!body.success) {
            return Promise.reject(new Error(body.message));
        }
        return response;
    },
    (error: AxiosError<ApiResponse<unknown>>) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
        }

        const responseData = error.response?.data;
        const message =
            responseData && !responseData.success
                ? responseData.message
                : error.message;

        return Promise.reject(new Error(message));
    },
);
