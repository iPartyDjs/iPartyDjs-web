import { apiClient, unwrap } from "./client";
import type {
  ApiResponse,
  FotografiaDTO,
  PhotoFiltersInput,
  UploadPhotoInput,
  EditPhotoMetadataInput,
  RejectPhotoInput,
} from "@ipartydjs/shared";

export const listFotografias = async (
  filters: PhotoFiltersInput,
): Promise<FotografiaDTO[]> => {
  const query = new URLSearchParams();
  if (filters.estado) query.append("estado", filters.estado);
  if (filters.id_fotografo) query.append("id_fotografo", filters.id_fotografo);

  const response = await apiClient.get<ApiResponse<FotografiaDTO[]>>(
    `/fotografias?${query.toString()}`,
  );
  return unwrap(response);
};

export const getFotografiaById = async (id: string): Promise<FotografiaDTO> => {
  const response = await apiClient.get<ApiResponse<FotografiaDTO>>(
    `/fotografias/${id}`,
  );
  return unwrap(response);
};

/** El campo del archivo DEBE llamarse "foto" — así lo exige el multer del backend. */
export const uploadFotografia = async (
  data: UploadPhotoInput,
  file: File,
): Promise<FotografiaDTO> => {
  const formData = new FormData();
  formData.append("foto", file);
  formData.append("titulo", data.titulo);
  formData.append("descripcion", data.descripcion);

  const response = await apiClient.post<ApiResponse<FotografiaDTO>>(
    "/fotografias",
    formData,
  );
  return unwrap(response);
};

export const editFotografiaMetadata = async (
  id: string,
  data: EditPhotoMetadataInput,
): Promise<FotografiaDTO> => {
  const response = await apiClient.patch<ApiResponse<FotografiaDTO>>(
    `/fotografias/${id}/metadata`,
    data,
  );
  return unwrap(response);
};

/** ApprovePhotoSchema es EmptySchema — sin cuerpo, pero mandamos {} por seguridad. */
export const approveFotografia = async (id: string): Promise<FotografiaDTO> => {
  const response = await apiClient.patch<ApiResponse<FotografiaDTO>>(
    `/fotografias/${id}/aprobar`,
    {},
  );
  return unwrap(response);
};

/**
 * NOTA: el backend valida `motivo` pero NO lo persiste (Fotografia en
 * schema.prisma no tiene columna para eso).
 */
export const rejectFotografia = async (
  id: string,
  data: RejectPhotoInput,
): Promise<FotografiaDTO> => {
  const response = await apiClient.patch<ApiResponse<FotografiaDTO>>(
    `/fotografias/${id}/rechazar`,
    data,
  );
  return unwrap(response);
};

export const deleteFotografia = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/fotografias/${id}`,
  );
  return unwrap(response);
};
