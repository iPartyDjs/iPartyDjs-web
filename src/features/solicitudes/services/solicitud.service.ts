import { apiClient } from "@/core/api/client";
import type {
    SolicitudEventoDTO,
    CreateSolicitudInput,
    UpdateSolicitudInput,
    RejectSolicitudInput,
    EstadoSolicitud,
    ApiResponse,
    PaginatedResult,
} from "@ipartydjs/shared";

type SolicitudResponse = ApiResponse<SolicitudEventoDTO>;
type SolicitudListResponse = ApiResponse<SolicitudEventoDTO[]>;
type SolicitudPaginatedResponse = ApiResponse<
    PaginatedResult<SolicitudEventoDTO>
>;

function unwrap<T>(body: ApiResponse<T>): T {
    if (!body.success) {
        throw new Error(body.message);
    }
    return body.data;
}

export const solicitudService = {
    async crear(data: CreateSolicitudInput): Promise<SolicitudEventoDTO> {
        const response = await apiClient.post<SolicitudResponse>(
            "/solicitudes",
            data,
        );
        return unwrap(response.data);
    },

    async getMisSolicitudes(
        estado?: EstadoSolicitud,
    ): Promise<SolicitudEventoDTO[]> {
        const response = await apiClient.get<SolicitudListResponse>(
            "/solicitudes/mias",
            {
                params: estado ? { estado } : undefined,
            },
        );
        return unwrap(response.data);
    },

    async getById(id: string): Promise<SolicitudEventoDTO> {
        const response = await apiClient.get<SolicitudResponse>(
            `/solicitudes/${id}`,
        );
        return unwrap(response.data);
    },

    async listAll(
        estado?: EstadoSolicitud,
        page?: number,
        limit?: number,
    ): Promise<PaginatedResult<SolicitudEventoDTO>> {
        const response = await apiClient.get<SolicitudPaginatedResponse>(
            "/solicitudes",
            {
                params: { estado, page, limit },
            },
        );
        return unwrap(response.data);
    },

    async listPending(
        page?: number,
        limit?: number,
    ): Promise<PaginatedResult<SolicitudEventoDTO>> {
        const response = await apiClient.get<SolicitudPaginatedResponse>(
            "/solicitudes/pendientes",
            { params: { page, limit } },
        );
        return unwrap(response.data);
    },

    async update(
        id: string,
        data: UpdateSolicitudInput,
    ): Promise<SolicitudEventoDTO> {
        const response = await apiClient.patch<SolicitudResponse>(
            `/solicitudes/${id}`,
            data,
        );
        return unwrap(response.data);
    },

    async approve(id: string): Promise<SolicitudEventoDTO> {
        const response = await apiClient.patch<SolicitudResponse>(
            `/solicitudes/${id}/aprobar`,
            {},
        );
        return unwrap(response.data);
    },

    async reject(
        id: string,
        data: RejectSolicitudInput,
    ): Promise<SolicitudEventoDTO> {
        const response = await apiClient.patch<SolicitudResponse>(
            `/solicitudes/${id}/rechazar`,
            data,
        );
        return unwrap(response.data);
    },
};
