import { apiClient } from "@/core/api/client";
import type {
    EventoDTO,
    CreateEventoInput,
    UpdateEventoInput,
    ApiResponse,
} from "@ipartydjs/shared";

type EventoResponse = ApiResponse<EventoDTO>;
type EventoListResponse = ApiResponse<EventoDTO[]>;

function unwrap<T>(body: ApiResponse<T>): T {
    if (!body.success) {
        throw new Error(body.message);
    }
    return body.data;
}

export const eventoService = {
    async crear(data: CreateEventoInput): Promise<EventoDTO> {
        const response = await apiClient.post<EventoResponse>("/eventos", data);
        return unwrap(response.data);
    },

    async getMisEventos(): Promise<EventoDTO[]> {
        const response =
            await apiClient.get<EventoListResponse>("/eventos/mios");
        return unwrap(response.data);
    },

    async getById(id: string): Promise<EventoDTO> {
        const response = await apiClient.get<EventoResponse>(`/eventos/${id}`);
        return unwrap(response.data);
    },

    async update(id: string, data: UpdateEventoInput): Promise<EventoDTO> {
        const response = await apiClient.patch<EventoResponse>(
            `/eventos/${id}`,
            data,
        );
        return unwrap(response.data);
    },

    async startPreparation(id: string): Promise<EventoDTO> {
        const response = await apiClient.patch<EventoResponse>(
            `/eventos/${id}/iniciar-preparacion`,
            {},
        );
        return unwrap(response.data);
    },

    async complete(id: string): Promise<EventoDTO> {
        const response = await apiClient.patch<EventoResponse>(
            `/eventos/${id}/completar`,
            {},
        );
        return unwrap(response.data);
    },
};
