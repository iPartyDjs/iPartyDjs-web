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

    // Verificamos si NO es exitosa
    if (!body.success) {
      // Al ser success: false, TypeScript sabe que es un ApiErrorResponse
      // Si la propiedad message es opcional o tiene otro nombre en ApiErrorResponse,
      // aseguramos su extracción:
      const errorMessage =
        ("message" in body &&
          typeof body.message === "string" &&
          body.message) ||
        "Error en la respuesta del servidor";

      return Promise.reject(new Error(errorMessage));
    }

    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }

    const responseData = error.response?.data;

    // Extraemos el mensaje de forma segura inspeccionando la propiedad
    let message = error.message;

    if (responseData && !responseData.success && "message" in responseData) {
      message = (responseData as { message: string }).message || error.message;
    }

    return Promise.reject(new Error(message));
  },
);
