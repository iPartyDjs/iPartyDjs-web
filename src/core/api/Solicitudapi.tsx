import { apiClient, unwrap } from "./client";
import type {
  ApiResponse,
  SolicitudEventoDTO,
  EstadoSolicitud,
  PaginatedResult,
  RejectSolicitudInput,
} from "@ipartydjs/shared";

export interface SolicitudFilters {
  estado?: EstadoSolicitud;
}

export interface Pagination {
  page: number;
  limit: number;
}

export const listSolicitudes = async (
  filters: SolicitudFilters,
  pagination: Pagination,
): Promise<PaginatedResult<SolicitudEventoDTO>> => {
  const params = new URLSearchParams();
  if (filters.estado) params.append("estado", filters.estado);
  params.append("page", String(pagination.page));
  params.append("limit", String(pagination.limit));

  const response = await apiClient.get<
    ApiResponse<PaginatedResult<SolicitudEventoDTO>>
  >(`/solicitudes?${params.toString()}`);
  return unwrap(response);
};

export const getSolicitudById = async (
  id: string,
): Promise<SolicitudEventoDTO> => {
  const response = await apiClient.get<ApiResponse<SolicitudEventoDTO>>(
    `/solicitudes/${id}`,
  );
  return unwrap(response);
};

/** ApproveSolicitudSchema es EmptySchema — sin cuerpo, pero mandamos {} por seguridad. */
export const approveSolicitud = async (
  id: string,
): Promise<SolicitudEventoDTO> => {
  const response = await apiClient.patch<ApiResponse<SolicitudEventoDTO>>(
    `/solicitudes/${id}/aprobar`,
    {},
  );
  return unwrap(response);
};

export const rejectSolicitud = async (
  id: string,
  data: RejectSolicitudInput,
): Promise<SolicitudEventoDTO> => {
  const response = await apiClient.patch<ApiResponse<SolicitudEventoDTO>>(
    `/solicitudes/${id}/rechazar`,
    data,
  );
  return unwrap(response);
};

/**
 * NUEVO — SOLICITUD:COMPLETE. No estaba en el diseño original del sistema
 * (ver notas en permissions.constants.ts): se agregó como acción manual
 * explícita para transicionar 'en_proceso' -> 'completada' sin depender del
 * registro del Evento.
 */
export const completeSolicitud = async (
  id: string,
): Promise<SolicitudEventoDTO> => {
  const response = await apiClient.patch<ApiResponse<SolicitudEventoDTO>>(
    `/solicitudes/${id}/completar`,
    {},
  );
  return unwrap(response);
};
