import apiClient from "@/core/api/client";
import type {
    LoginInput,
    RegisterClientInput,
    //ApiResponse,
    AuthTokenPayload,
    ClienteDTO,
    ApiSuccessResponse,
} from "@ipartydjs/shared";

/** TODO: Corregir este metodo */

export const authService = {
    login: async (data: LoginInput) => {
        const response = await apiClient.post<
            ApiSuccessResponse<{ token: string; user: AuthTokenPayload }>
        >("/auth/login", data);
        return response.data.data;
    },

    register: async (data: RegisterClientInput) => {
        const response = await apiClient.post<ApiSuccessResponse<ClienteDTO>>(
            "/auth/register",
            data,
        );
        return response.data.data;
    },
};
