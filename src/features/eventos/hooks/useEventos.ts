import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import type { EstadoEvento, UpdateEventoInput } from "@ipartydjs/shared";
import { eventoService } from "@/features/eventos/services/evento.service";
import { useAuthStore } from "@/core/stores/auth.store";

export function useMisEventos() {
    const hasRole = useAuthStore((state) => state.hasRole);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: ["eventos", "mios"],
        queryFn: () => eventoService.getMisEventos(),
        enabled: isAuthenticated && hasRole("cliente"),
    });
}

export function useEvento(id: string) {
    return useQuery({
        queryKey: ["eventos", "detalle", id],
        queryFn: () => eventoService.getById(id),
        enabled: Boolean(id),
    });
}

// NOTA: no existe useListAllEventos — el backend no expone GET /eventos
// (listado general). Solo /mios (cliente) y /:id (uno por id) están
// disponibles. Cualquier vista de admin que necesite listar eventos queda
// bloqueada hasta que se agregue ese endpoint al backend.

export function useUpdateEvento() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateEventoInput }) =>
            eventoService.update(id, data),
        onSuccess: (_result, variables) => {
            queryClient.invalidateQueries({ queryKey: ["eventos", "mios"] });
            queryClient.invalidateQueries({
                queryKey: ["eventos", "detalle", variables.id],
            });
        },
    });
}

export function useStartPreparation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => eventoService.startPreparation(id),
        onSuccess: (_result, id) => {
            queryClient.invalidateQueries({ queryKey: ["eventos", "mios"] });
            queryClient.invalidateQueries({
                queryKey: ["eventos", "detalle", id],
            });
        },
    });
}

export function useCompleteEvento() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => eventoService.complete(id),
        onSuccess: (_result, id) => {
            queryClient.invalidateQueries({ queryKey: ["eventos", "mios"] });
            queryClient.invalidateQueries({
                queryKey: ["eventos", "detalle", id],
            });
            // Al completar un evento se habilita reseñarlo — invalida esa caché también.
            queryClient.invalidateQueries({
                queryKey: ["resenia", "evento", id],
            });
        },
    });
}
export function useListAllEventos(
    estado?: EstadoEvento,
    page?: number,
    limit?: number,
) {
    const hasRole = useAuthStore((state) => state.hasRole);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isAdmin = hasRole("administrador") || hasRole("superadministrador");

    return useQuery({
        queryKey: ["eventos", "admin", estado, page, limit],
        queryFn: () => eventoService.listAll(estado, page, limit),
        enabled: isAuthenticated && isAdmin,
        placeholderData: keepPreviousData,
    });
}
