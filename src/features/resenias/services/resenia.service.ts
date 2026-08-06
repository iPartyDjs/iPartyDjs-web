import { apiClient } from "@/core/api/client";
import type {
    ReseniaDTO,
    CreateReviewInput,
    RequestReviewEditionInput,
    RejectReviewInput,
    ApiResponse,
} from "@ipartydjs/shared";

type ReseniaResponse = ApiResponse<ReseniaDTO>;
type ReseniaListResponse = ApiResponse<ReseniaDTO[]>;
type ReseniaOrNullResponse = ApiResponse<ReseniaDTO | null>;
type DeleteResponse = ApiResponse<{ message: string }>;

function unwrap<T>(body: ApiResponse<T>): T {
    if (!body.success) {
        throw new Error(body.message);
    }
    return body.data;
}

export const reseniaService = {
    async crear(data: CreateReviewInput): Promise<ReseniaDTO> {
        const response = await apiClient.post<ReseniaResponse>(
            "/resenias",
            data,
        );
        return unwrap(response.data);
    },

    async getPublicas(): Promise<ReseniaDTO[]> {
        const response =
            await apiClient.get<ReseniaListResponse>("/resenias/publicas");
        return unwrap(response.data);
    },

    async getByEvento(id_evento: string): Promise<ReseniaDTO | null> {
        const response = await apiClient.get<ReseniaOrNullResponse>(
            `/resenias/evento/${id_evento}`,
        );
        return unwrap(response.data);
    },

    async solicitarEdicion(
        id: string,
        data: RequestReviewEditionInput,
    ): Promise<ReseniaDTO> {
        const response = await apiClient.patch<ReseniaResponse>(
            `/resenias/${id}/editar`,
            data,
        );
        return unwrap(response.data);
    },

    async aprobar(id: string): Promise<ReseniaDTO> {
        const response = await apiClient.patch<ReseniaResponse>(
            `/resenias/${id}/aprobar`,
            {},
        );
        return unwrap(response.data);
    },

    async rechazar(id: string, data: RejectReviewInput): Promise<ReseniaDTO> {
        const response = await apiClient.patch<ReseniaResponse>(
            `/resenias/${id}/rechazar`,
            data,
        );
        return unwrap(response.data);
    },

    async eliminar(id: string): Promise<{ message: string }> {
        const response = await apiClient.delete<DeleteResponse>(
            `/resenias/${id}`,
            {
                data: {},
            },
        );
        return unwrap(response.data);
    },
};
