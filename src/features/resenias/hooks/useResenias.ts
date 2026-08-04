/* ===== src/features/resenias/hooks/useResenias.ts ===== */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    RequestReviewEditionInput,
    RejectReviewInput,
} from "@ipartydjs/shared";
import { reseniaService } from "@/features/resenias/services/resenia.service";
import { useAuthStore } from "@/core/stores/auth.store";

export function usePublicReviews() {
    return useQuery({
        queryKey: ["resenias", "publicas"],
        queryFn: () => reseniaService.getPublicas(),
    });
}

export function useReseniaByEvento(id_evento: string) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: ["resenia", "evento", id_evento],
        queryFn: () => reseniaService.getByEvento(id_evento),
        enabled: Boolean(id_evento) && isAuthenticated,
    });
}

export function useCrearResenia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: reseniaService.crear,
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["resenia", "evento", data.id_evento],
            });
            queryClient.invalidateQueries({
                queryKey: ["resenias", "publicas"],
            });
        },
    });
}

export function useSolicitarEdicion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: RequestReviewEditionInput;
        }) => reseniaService.solicitarEdicion(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["resenia", "evento"] });
            queryClient.invalidateQueries({
                queryKey: ["resenias", "publicas"],
            });
        },
    });
}

export function useAprobarResenia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => reseniaService.aprobar(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["resenias"] });
            queryClient.invalidateQueries({ queryKey: ["resenia", "evento"] });
            queryClient.invalidateQueries({
                queryKey: ["resenias", "publicas"],
            });
        },
    });
}

export function useRechazarResenia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: RejectReviewInput }) =>
            reseniaService.rechazar(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["resenias"] });
            queryClient.invalidateQueries({ queryKey: ["resenia", "evento"] });
            queryClient.invalidateQueries({
                queryKey: ["resenias", "publicas"],
            });
        },
    });
}

export function useEliminarResenia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => reseniaService.eliminar(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["resenias"] });
            queryClient.invalidateQueries({ queryKey: ["resenia", "evento"] });
            queryClient.invalidateQueries({
                queryKey: ["resenias", "publicas"],
            });
        },
    });
}
