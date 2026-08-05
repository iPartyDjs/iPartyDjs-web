import { useState } from "react";
import { useParams } from "react-router-dom";
import type {
    CreateReviewInput,
    RequestReviewEditionInput,
} from "@ipartydjs/shared";
import {
    useReseniaByEvento,
    useCrearResenia,
    useSolicitarEdicion,
    useAprobarResenia,
    useRechazarResenia,
    useEliminarResenia,
} from "@/features/resenias/hooks/useResenias";
import {
    ReseniaForm,
    type EventoOption,
} from "@/features/resenias/components/ReseniaForm";
import { useAuthStore } from "@/core/stores/auth.store";

export default function DetalleResenia() {
    const { id_evento } = useParams<{ id_evento: string }>();
    const eventoId = id_evento ?? "";
    const {
        data: resenia,
        isLoading,
        isError,
        error,
    } = useReseniaByEvento(eventoId);

    const hasRole = useAuthStore((state) => state.hasRole);
    const user = useAuthStore((state) => state.user);
    const isAdmin = hasRole("administrador") || hasRole("superadministrador");
    const esDueño = user?.rol === "cliente";

    const crear = useCrearResenia();
    const solicitarEdicion = useSolicitarEdicion();
    const aprobar = useAprobarResenia();
    const rechazar = useRechazarResenia();
    const eliminar = useEliminarResenia();

    const [mostrarFormEdicion, setMostrarFormEdicion] = useState(false);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);

    const eventosOptions: EventoOption[] = eventoId
        ? [{ id_evento: eventoId, label: eventoId }]
        : [];

    const handleCrear = (data: CreateReviewInput) => {
        crear.mutate(data, {
            onSuccess: () => setStatusMsg("Reseña creada correctamente."),
            onError: (err) =>
                setStatusMsg(
                    err instanceof Error
                        ? err.message
                        : "No se pudo crear la reseña.",
                ),
        });
    };

    const handleSolicitarEdicion = (data: RequestReviewEditionInput) => {
        if (!resenia) return;
        solicitarEdicion.mutate(
            { id: resenia.id_resenia, data },
            {
                onSuccess: () => {
                    setMostrarFormEdicion(false);
                    setStatusMsg(
                        "Edición solicitada, pendiente de aprobación.",
                    );
                },
                onError: (err) =>
                    setStatusMsg(
                        err instanceof Error
                            ? err.message
                            : "No se pudo solicitar la edición.",
                    ),
            },
        );
    };

    const handleAprobar = () => {
        if (!resenia) return;
        aprobar.mutate(resenia.id_resenia, {
            onSuccess: () => setStatusMsg("Reseña aprobada."),
            onError: (err) =>
                setStatusMsg(
                    err instanceof Error
                        ? err.message
                        : "No se pudo aprobar la reseña.",
                ),
        });
    };

    const handleRechazar = () => {
        if (!resenia) return;
        const motivo =
            window.prompt("Motivo del rechazo (opcional):") ?? undefined;
        rechazar.mutate(
            { id: resenia.id_resenia, data: { motivo } },
            {
                onSuccess: () => setStatusMsg("Reseña rechazada."),
                onError: (err) =>
                    setStatusMsg(
                        err instanceof Error
                            ? err.message
                            : "No se pudo rechazar la reseña.",
                    ),
            },
        );
    };

    const handleEliminar = () => {
        if (!resenia) return;
        if (
            !window.confirm(
                "¿Eliminar esta reseña? Esta acción no se puede deshacer.",
            )
        )
            return;
        eliminar.mutate(resenia.id_resenia, {
            onSuccess: () => setStatusMsg("Reseña eliminada."),
            onError: (err) =>
                setStatusMsg(
                    err instanceof Error
                        ? err.message
                        : "No se pudo eliminar la reseña.",
                ),
        });
    };

    if (isLoading) return <div className="solicitudes-page">Cargando...</div>;
    if (isError) {
        return (
            <div className="solicitudes-page">
                <p className="error-text">
                    {error instanceof Error
                        ? error.message
                        : "No se pudo cargar la reseña."}
                </p>
            </div>
        );
    }

    const edicionPendiente =
        resenia?.estado === "aprobado" && resenia.comentario_edicion !== null;

    return (
        <div className="solicitudes-page">
            <h1>Reseña del evento</h1>
            {statusMsg && <p className="status-message">{statusMsg}</p>}

            {!resenia && esDueño && (
                <>
                    <p>Este evento aún no tiene reseña.</p>
                    <ReseniaForm
                        mode="crear"
                        onSubmit={handleCrear}
                        isLoading={crear.isPending}
                        eventosOptions={eventosOptions}
                    />
                </>
            )}

            {!resenia && !esDueño && <p>Este evento aún no tiene reseña.</p>}

            {resenia && (
                <div className="solicitud-detalle">
                    <p>
                        <strong>Calificación:</strong>{" "}
                        {"★".repeat(resenia.calificacion)}
                        {"☆".repeat(5 - resenia.calificacion)}
                    </p>
                    <p>
                        <strong>Comentario:</strong> {resenia.comentario}
                    </p>
                    {resenia.comentario_edicion && (
                        <p>
                            <strong>Edición solicitada:</strong>{" "}
                            {resenia.comentario_edicion}
                        </p>
                    )}
                    <p>
                        <strong>Estado:</strong>{" "}
                        <span
                            className={`badge badge-resenia-${resenia.estado}`}
                        >
                            {resenia.estado}
                        </span>
                        {edicionPendiente && (
                            <span className="badge badge-resenia-edicion">
                                Edición pendiente
                            </span>
                        )}
                    </p>

                    {isAdmin && resenia.estado === "pendiente" && (
                        <div className="actions-cell">
                            <button
                                className="btn-approve"
                                disabled={aprobar.isPending}
                                onClick={handleAprobar}
                            >
                                Aprobar
                            </button>
                            <button
                                className="btn-reject"
                                disabled={rechazar.isPending}
                                onClick={handleRechazar}
                            >
                                Rechazar
                            </button>
                        </div>
                    )}

                    {isAdmin && edicionPendiente && (
                        <p className="resenia-hint">
                            Esta reseña tiene una edición pendiente. Aprobarla
                            no está soportado todavía en el backend (falta un
                            método para promover el texto editado).
                        </p>
                    )}

                    {isAdmin &&
                        resenia.estado === "aprobado" &&
                        !edicionPendiente && (
                            <div className="actions-cell">
                                <button
                                    className="btn-reject"
                                    disabled={eliminar.isPending}
                                    onClick={handleEliminar}
                                >
                                    Eliminar
                                </button>
                            </div>
                        )}

                    {esDueño &&
                        resenia.estado === "aprobado" &&
                        !mostrarFormEdicion && (
                            <button
                                className="btn-secondary"
                                onClick={() => setMostrarFormEdicion(true)}
                            >
                                Solicitar edición
                            </button>
                        )}

                    {esDueño && mostrarFormEdicion && (
                        <ReseniaForm
                            mode="editar"
                            onSubmit={handleSolicitarEdicion}
                            isLoading={solicitarEdicion.isPending}
                            initialData={{
                                comentario_edicion:
                                    resenia.comentario_edicion ?? "",
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
