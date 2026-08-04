import { apiClient } from "@/core/api/client";
import type {
    LoginInput,
    RegisterClientInput,
    UsuarioDTO,
    ApiResponse,
} from "@ipartydjs/shared";

type LoginData = { token: string; usuario: UsuarioDTO };
type LoginApiResponse = ApiResponse<LoginData>;
type RegisterApiResponse = ApiResponse<UsuarioDTO>;

export const authService = {
    async login(data: LoginInput): Promise<LoginData> {
        const response = await apiClient.post<LoginApiResponse>(
            "/auth/login",
            data,
        );

        const body = response.data;
        if (!body.success) {
            throw new Error(body.message);
        }
        return body.data;
    },

    async register(data: RegisterClientInput): Promise<UsuarioDTO> {
        const response = await apiClient.post<RegisterApiResponse>(
            "/auth/registro",
            data,
        );

        const body = response.data;
        if (!body.success) {
            console.error(body);
            throw new Error(body.message);
        }
        console.error(body);
        return body.data;
    },
};
