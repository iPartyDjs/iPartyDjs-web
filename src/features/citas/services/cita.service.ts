import { apiClient } from "@/core/api/client";
import type {
    CitaDTO,
    ScheduleAppointmentInput,
    RescheduleAppointmentInput,
    CancelAppointmentInput,
    CompleteAppointmentInput,
    EstadoCita,
    ApiResponse,
} from "@ipartydjs/shared";

type CitaResponse = ApiResponse<CitaDTO>;
type CitaListResponse = ApiResponse<CitaDTO[]>;

function unwrap<T>(body: ApiResponse<T>): T {
    if (!body.success) {
        throw new Error(body.message);
    }
    return body.data;
}

export const citaService = {
    async agendar(data: ScheduleAppointmentInput): Promise<CitaDTO> {
        const response = await apiClient.post<CitaResponse>("/citas", data);
        return unwrap(response.data);
    },

    async listAll(
        desde?: string,
        hasta?: string,
        estado?: EstadoCita,
    ): Promise<CitaDTO[]> {
        const response = await apiClient.get<CitaListResponse>("/citas", {
            params: { desde, hasta, estado },
        });
        return unwrap(response.data);
    },

    async getById(id: string): Promise<CitaDTO> {
        const response = await apiClient.get<CitaResponse>(`/citas/${id}`);
        return unwrap(response.data);
    },

    async getBySolicitud(id_solicitud: string): Promise<CitaDTO[]> {
        const response = await apiClient.get<CitaListResponse>(
            `/citas/solicitud/${id_solicitud}`,
        );
        return unwrap(response.data);
    },

    async reschedule(
        id: string,
        data: RescheduleAppointmentInput,
    ): Promise<CitaDTO> {
        const response = await apiClient.patch<CitaResponse>(
            `/citas/${id}/reagendar`,
            data,
        );
        return unwrap(response.data);
    },

    async cancel(id: string, data: CancelAppointmentInput): Promise<CitaDTO> {
        const response = await apiClient.patch<CitaResponse>(
            `/citas/${id}/cancelar`,
            data,
        );
        return unwrap(response.data);
    },

    async complete(
        id: string,
        data: CompleteAppointmentInput,
    ): Promise<CitaDTO> {
        const response = await apiClient.patch<CitaResponse>(
            `/citas/${id}/completar`,
            data,
        );
        return unwrap(response.data);
    },
};
