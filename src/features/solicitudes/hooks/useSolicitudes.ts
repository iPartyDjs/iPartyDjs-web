/* ===== src/features/solicitudes/hooks/useSolicitudes.ts ===== */
import {
    useMutation,
    useQuery,
    useQueryClient,
    keepPreviousData,
} from "@tanstack/react-query";
import type {
    EstadoSolicitud,
    UpdateSolicitudInput,
    RejectSolicitudInput,
} from "@ipartydjs/shared";
import { solicitudService } from "../services/solicitud.service";
import { useAuthStore } from "@/core/stores/auth.store";

export function useMisSolicitudes(estado?: EstadoSolicitud) {
    const hasRole = useAuthStore((state) => state.hasRole);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: ["solicitudes", "mias", estado],
        queryFn: () => solicitudService.getMisSolicitudes(estado),
        enabled: isAuthenticated && hasRole("cliente"),
    });
}

export function useCrearSolicitud() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: solicitudService.crear,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["solicitudes", "mias"],
            });
        },
    });
}

export function useSolicitud(id: string) {
    return useQuery({
        queryKey: ["solicitud", id],
        queryFn: () => solicitudService.getById(id),
        enabled: Boolean(id),
    });
}

export function useUpdateSolicitud() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: UpdateSolicitudInput;
        }) => solicitudService.update(id, data),
        onSuccess: (_result, variables) => {
            console.log(variables.id);

            queryClient.invalidateQueries({
                queryKey: ["solicitudes", "mias"],
            });
            queryClient.invalidateQueries({
                queryKey: ["solicitud", variables.id],
            });
        },
    });
}

export function useListAllSolicitudes(
    estado?: EstadoSolicitud,
    page?: number,
    limit?: number,
) {
    const hasRole = useAuthStore((state) => state.hasRole);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isAdmin = hasRole("administrador") || hasRole("superadministrador");

    return useQuery({
        queryKey: ["solicitudes", "admin", estado, page, limit],
        queryFn: () => solicitudService.listAll(estado, page, limit),
        enabled: isAuthenticated && isAdmin,
        placeholderData: keepPreviousData,
    });
}

export function useListPendingSolicitudes(page?: number, limit?: number) {
    const hasRole = useAuthStore((state) => state.hasRole);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isAdmin = hasRole("administrador") || hasRole("superadministrador");

    return useQuery({
        queryKey: ["solicitudes", "pendientes", page, limit],
        queryFn: () => solicitudService.listPending(page, limit),
        enabled: isAuthenticated && isAdmin,
        placeholderData: keepPreviousData,
    });
}

export function useApproveSolicitud() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => solicitudService.approve(id),
        onSuccess: (_result, id) => {
            queryClient.invalidateQueries({ queryKey: ["solicitudes"] });
            queryClient.invalidateQueries({ queryKey: ["solicitud", id] });
        },
    });
}

export function useRejectSolicitud() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: RejectSolicitudInput;
        }) => solicitudService.reject(id, data),
        onSuccess: (_result, variables) => {
            queryClient.invalidateQueries({ queryKey: ["solicitudes"] });
            queryClient.invalidateQueries({
                queryKey: ["solicitud", variables.id],
            });
        },
    });
}
