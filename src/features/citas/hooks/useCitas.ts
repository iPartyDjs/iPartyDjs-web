import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    EstadoCita,
    ScheduleAppointmentInput,
    RescheduleAppointmentInput,
    CancelAppointmentInput,
    CompleteAppointmentInput,
} from "@ipartydjs/shared";
import { citaService } from "@/features/citas/services/cita.service";
import { useAuthStore } from "@/core/stores/auth.store";

export function useCitasBySolicitud(id_solicitud: string) {
    return useQuery({
        queryKey: ["citas", "solicitud", id_solicitud],
        queryFn: () => citaService.getBySolicitud(id_solicitud),
        enabled: Boolean(id_solicitud),
    });
}

export function useCita(id: string) {
    return useQuery({
        queryKey: ["citas", "detalle", id],
        queryFn: () => citaService.getById(id),
        enabled: Boolean(id),
    });
}

export function useListAllCitas(
    desde?: string,
    hasta?: string,
    estado?: EstadoCita,
) {
    const hasRole = useAuthStore((state) => state.hasRole);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isAdmin = hasRole("administrador") || hasRole("superadministrador");

    return useQuery({
        queryKey: ["citas", "admin", desde, hasta, estado],
        queryFn: () => citaService.listAll(desde, hasta, estado),
        enabled: isAuthenticated && isAdmin,
    });
}

export function useAgendarCita() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ScheduleAppointmentInput) =>
            citaService.agendar(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["citas"] });
        },
    });
}

export function useRescheduleCita() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: RescheduleAppointmentInput;
        }) => citaService.reschedule(id, data),
        onSuccess: (_result, variables) => {
            queryClient.invalidateQueries({ queryKey: ["citas"] });
            queryClient.invalidateQueries({
                queryKey: ["citas", "detalle", variables.id],
            });
        },
    });
}

export function useCancelCita() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: CancelAppointmentInput;
        }) => citaService.cancel(id, data),
        onSuccess: (_result, variables) => {
            queryClient.invalidateQueries({ queryKey: ["citas"] });
            queryClient.invalidateQueries({
                queryKey: ["citas", "detalle", variables.id],
            });
        },
    });
}

export function useCompleteCita() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: CompleteAppointmentInput;
        }) => citaService.complete(id, data),
        onSuccess: (_result, variables) => {
            queryClient.invalidateQueries({ queryKey: ["citas"] });
            queryClient.invalidateQueries({
                queryKey: ["citas", "detalle", variables.id],
            });
        },
    });
}
