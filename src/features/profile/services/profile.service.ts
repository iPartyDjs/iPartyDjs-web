import { apiClient } from "@/core/api/client";
import type {
    UsuarioDTO,
    ApiResponse,
    UpdateProfileInput,
    ChangePasswordInput,
} from "@ipartydjs/shared";

type ProfileApiResponse = ApiResponse<UsuarioDTO>;
type ChangePasswordApiResponse = ApiResponse<{ message: string }>;

export const profileService = {
    async getProfile(): Promise<UsuarioDTO> {
        const response =
            await apiClient.get<ProfileApiResponse>("/usuarios/me");
        const body = response.data;
        if (!body.success) {
            throw new Error(body.message);
        }
        return body.data;
    },

    async updateProfile(data: UpdateProfileInput): Promise<UsuarioDTO> {
        const response = await apiClient.patch<ProfileApiResponse>(
            "/usuarios/me",
            data,
        );
        const body = response.data;
        if (!body.success) {
            throw new Error(body.message);
        }
        return body.data;
    },

    async changePassword(
        data: ChangePasswordInput,
    ): Promise<{ message: string }> {
        const response = await apiClient.patch<ChangePasswordApiResponse>(
            "/usuarios/me/password",
            data,
        );
        const body = response.data;
        if (!body.success) {
            throw new Error(body.message);
        }
        return body.data;
    },
};
