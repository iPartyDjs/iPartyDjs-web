import axios, { type AxiosError } from "axios";
import type { ApiResponse } from "@ipartydjs/shared";
import { useAuthStore } from "@/core/stores/auth.store";

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
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login")
    ) {
      // Antes: localStorage.removeItem("auth_token") a mano, lo que dejaba
      // el store de Zustand (isAuthenticated/user/token) desincronizado.
      // logout() limpia AMBOS: la key cruda y el store persistido.
      useAuthStore.getState().logout();
      const isAdminRoute =
        window.location.pathname.startsWith("/dashboard/admin") ||
        window.location.pathname.startsWith("/admin");
      window.location.href = isAdminRoute ? "/admin" : "/login";
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

/**
 * Desempaqueta un ApiResponse<T> ya resuelto por axios, devolviendo
 * directamente el `T` en vez de la unión completa.
 *
 * Es seguro asumir `success: true` aquí: si la respuesta hubiera sido
 * `success: false`, el interceptor de arriba YA convirtió esa respuesta en
 * una promesa rechazada — código nunca llega a `unwrap()` con un error.
 * Esto es lo que evita el error de TypeScript "Property 'data' does not
 * exist on type ApiErrorResponse" en cada archivo de api/*.ts: en vez de
 * castear a mano en cada uno, se angosta una sola vez, aquí.
 */
export function unwrap<T>(response: { data: ApiResponse<T> }): T {
  const body = response.data;
  if (!body.success) {
    // No debería pasar nunca (ver nota arriba), pero por si acaso.
    throw new Error(
      "message" in body && typeof body.message === "string"
        ? body.message
        : "Respuesta inesperada del servidor",
    );
  }
  return body.data;
}
