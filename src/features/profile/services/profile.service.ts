import { apiClient } from "@/core/api/client";
import type {
  UsuarioDTO,
  ApiResponse,
  UpdateProfileInput,
  ChangePasswordInput,
} from "@ipartydjs/shared";

type ProfileApiResponse = ApiResponse<UsuarioDTO>;
type ChangePasswordApiResponse = ApiResponse<{ message: string }>;

function unwrap<T>(body: ApiResponse<T>): T {
  if (!body.success) {
    const errorMessage =
      ("message" in body && typeof body.message === "string" && body.message) ||
      "Error en la respuesta del servidor";

    throw new Error(errorMessage);
  }
  return body.data;
}

export const profileService = {
  async getProfile(): Promise<UsuarioDTO> {
    const response = await apiClient.get<ProfileApiResponse>("/usuarios/me");
    return unwrap(response.data);
  },

  async updateProfile(data: UpdateProfileInput): Promise<UsuarioDTO> {
    const response = await apiClient.patch<ProfileApiResponse>(
      "/usuarios/me",
      data,
    );
    return unwrap(response.data);
  },

  async changePassword(
    data: ChangePasswordInput,
  ): Promise<{ message: string }> {
    const response = await apiClient.patch<ChangePasswordApiResponse>(
      "/usuarios/me/password",
      data,
    );
    return unwrap(response.data);
  },
};
