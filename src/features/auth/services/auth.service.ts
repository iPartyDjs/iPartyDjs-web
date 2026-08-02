import apiClient from "@/core/api/client";
import type {
  LoginInput,
  RegisterClientInput,
  AuthTokenPayload,
  UsuarioDTO,
  ApiSuccessResponse,
} from "@ipartydjs/shared";

/**
 * Utilidad para decodificar el payload de un JWT. Ya no se usa dentro de
 * login() porque el backend ahora manda `usuario` armado directamente, pero
 * se deja exportada por si la necesitas para validar expiración (`exp`) u
 * otros casos (refresh de token, debugging, etc.).
 */
export function decodeJwtPayload<T>(token: string): T {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
  return JSON.parse(jsonPayload) as T;
}

/**
 * Forma real (confirmada en Network tab) de `response.data.data` para
 * POST /auth/login:
 *   { token: string, usuario: {...datos del usuario...}, success: true }
 *
 * El backend ya arma el objeto `usuario` completo, así que no hace falta
 * decodificar el JWT a mano para tener nombre/apellido/rol/etc.
 */
interface LoginResponseData {
  token: string;
  usuario: AuthTokenPayload;
}

export const authService = {
  login: async (
    data: LoginInput,
  ): Promise<{ token: string; user: AuthTokenPayload }> => {
    const response = await apiClient.post<
      ApiSuccessResponse<LoginResponseData>
    >("/auth/login", data);

    const { token, usuario } = response.data.data;

    if (typeof token !== "string") {
      console.error(
        "[authService] Respuesta de login inesperada:",
        response.data,
      );
      throw new Error("El backend no devolvió un token válido en /auth/login.");
    }

    return { token, user: usuario };
  },

  register: async (data: RegisterClientInput) => {
    const response = await apiClient.post<ApiSuccessResponse<UsuarioDTO>>(
      "/auth/registro",
      data,
    );
    return response.data.data;
  },
};
