import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResult,
  UsuarioDTO,
  RolDTO,
  UsuarioFiltersInput,
  PaginationInput,
  RegisterEmployeeInput,
} from "@ipartydjs/shared";

export type GetUsersParams = UsuarioFiltersInput &
  PaginationInput & {
    search?: string;
  };

export const getUsers = async (params: GetUsersParams) => {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.search?.trim()) query.append("search", params.search.trim());
  if (params.id_rol) query.append("id_rol", params.id_rol);
  if (params.estado) query.append("estado", params.estado);

  const response = await apiClient.get<
    ApiResponse<PaginatedResult<UsuarioDTO>>
  >(`/usuarios?${query.toString()}`);
  return response.data;
};

export const getRoles = async () => {
  const response =
    await apiClient.get<ApiResponse<RolDTO[]>>("/usuarios/roles");
  return response.data;
};

export const updateUserRole = async (id_usuario: string, id_rol: string) => {
  const response = await apiClient.patch<ApiResponse<UsuarioDTO>>(
    `/usuarios/${id_usuario}/rol`,
    { id_rol },
  );
  return response.data;
};

export const activateUser = async (id_usuario: string) => {
  const response = await apiClient.patch<ApiResponse<UsuarioDTO>>(
    `/usuarios/${id_usuario}/activar`,
  );
  return response.data;
};

export const deactivateUser = async (id_usuario: string) => {
  const response = await apiClient.patch<ApiResponse<UsuarioDTO>>(
    `/usuarios/${id_usuario}/desactivar`,
  );
  return response.data;
};

export const registerEmployee = async (data: RegisterEmployeeInput) => {
  const response = await apiClient.post<ApiResponse<UsuarioDTO>>(
    "/usuarios/",
    data,
  );
  return response.data;
};
