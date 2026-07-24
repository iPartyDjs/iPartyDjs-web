import axios, { type AxiosInstance, AxiosError } from "axios";
import type { ApiResponse } from "@ipartydjs/shared";

const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// ===== Request Interceptor =====
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// ===== Response Interceptor =====
apiClient.interceptors.response.use(
    (response) => {
        const data = response.data as ApiResponse<unknown>;

        // Check if response has success: false
        if (data.success === false) {
            const error = new Error(
                data.message || "An error occurred",
            ) as AxiosError;
            error.response = response;
            return Promise.reject(error);
        }

        return response;
    },
    (error: AxiosError) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return Promise.reject(error);
        }

        return Promise.reject(error);
    },
);

export default apiClient;
