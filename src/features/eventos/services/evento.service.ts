import { apiClient } from "@/core/api/client";
import type {
  EventoDTO,
  CreateEventoInput,
  UpdateEventoInput,
  ApiResponse,
  EstadoEvento,
  PaginatedResult,
} from "@ipartydjs/shared";

type EventoResponse = ApiResponse<EventoDTO>;
type EventoListResponse = ApiResponse<EventoDTO[]>;
type EventoPaginatedResponse = ApiResponse<PaginatedResult<EventoDTO>>;

function unwrap<T>(body: unknown): T {
  const response = body as Record<string, unknown>;

  if (response?.success === false) {
    throw new Error(
      (response.error as string) ||
        (response.message as string) ||
        "Error desconocido en la petición",
    );
  }

  return (response?.data ?? response) as T;
}

export const eventoService = {
  async crear(data: CreateEventoInput): Promise<EventoDTO> {
    const response = await apiClient.post<EventoResponse>("/eventos", data);
    return unwrap(response.data);
  },

  async getMisEventos(): Promise<EventoDTO[]> {
    const response = await apiClient.get<EventoListResponse>("/eventos/mios");
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
  async listAll(
    estado?: EstadoEvento,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<EventoDTO>> {
    const response = await apiClient.get<EventoPaginatedResponse>("/eventos", {
      params: { estado, page, limit },
    });
    return unwrap(response.data);
  },
};
