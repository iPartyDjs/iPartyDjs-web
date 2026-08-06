/* ===== src/features/resenias/pages/MisResenias.tsx ===== */
import { useState } from "react";
import { useAuthStore } from "@/core/stores/auth.store";
import {
    useReseniaByEvento,
    useCrearResenia,
    useSolicitarEdicion,
} from "@/features/resenias/hooks/useResenias";
import {
    ReseniaForm,
    type EventoOption,
} from "@/features/resenias/components/ReseniaForm";
import type {
    EstadoResenia,
    EventoDTO,
    TipoEvento,
    CreateReviewInput,
    RequestReviewEditionInput,
} from "@ipartydjs/shared";
import { useMisEventos } from "@/features/eventos/hooks/useEventos";

const TIPO_EVENTO_VIEW: Record<TipoEvento, string> = {
    boda: "Boda",
    xv_anos: "XV Años",
    corporativo: "Corporativo",
    cumpleanos: "Cumpleaños",
    otro: "Otro",
};

const STATUS_COLOR: Record<EstadoResenia, string> = {
    pendiente: "badge-gold",
    aprobado: "badge-green",
    rechazado: "badge-red",
};

interface EventoReseniaProps {
    evento: EventoDTO;
    onCreateReview: (evento: EventoDTO) => void;
    onOpenDetalle: (evento: EventoDTO) => void;
}

function EventoResenia({
    evento,
    onCreateReview,
    onOpenDetalle,
}: EventoReseniaProps) {
    const { data: resenia, isLoading } = useReseniaByEvento(evento.id_evento);
    const label = TIPO_EVENTO_VIEW[evento.tipo_evento] ?? evento.tipo_evento;

    return (
        <div className="ms-card">
            <div className="ms-card-top">
                <span className="ms-card-tipo">{label}</span>
                <p>Fecha: {new Date(evento.fecha_hora).toLocaleDateString()}</p>
            </div>

            {isLoading && <p>Cargando reseña...</p>}

            {!isLoading && evento.estado === "realizado" && !resenia && (
                <button
                    className="btn-primary"
                    onClick={() => onCreateReview(evento)}
                >
                    Crear reseña
                </button>
            )}

            {!isLoading && resenia && (
                <>
                    <div className="ms-card-top">
                        <p>
                            Calificación: {"★".repeat(resenia.calificacion)}
                            {"☆".repeat(5 - resenia.calificacion)}
                        </p>
                        <span
                            className={`ms-badge ${STATUS_COLOR[resenia.estado]}`}
                        >
                            {resenia.estado}
                        </span>
                    </div>

                    <p className="resenia-comentario-resumen">
                        {resenia.comentario}
                    </p>
                    <br />
                    <p>
                        Fecha:{" "}
                        {new Date(resenia.created_at).toLocaleDateString()}
                    </p>
                    <br />
                    <button
                        className="btn-gold"
                        onClick={() => onOpenDetalle(evento)}
                    >
                        Ver reseña
                    </button>
                </>
            )}

            {!isLoading && evento.estado !== "realizado" && !resenia && (
                <p className="resenia-hint">
                    Disponible al finalizar el evento.
                </p>
            )}
        </div>
    );
}

export default function MisResenias() {
    const { data: eventos, isLoading, isError, error } = useMisEventos();
    const crear = useCrearResenia();
    const solicitarEdicion = useSolicitarEdicion();
    const user = useAuthStore((state) => state.user);
    const esDueño = user?.rol === "cliente";

    const [selectedEvento, setSelectedEvento] = useState<EventoDTO | null>(
        null,
    );
    const [mostrarFormEdicion, setMostrarFormEdicion] = useState(false);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);

    const {
        data: resenia,
        isLoading: reseniaLoading,
        isError: reseniaError,
        error: reseniaErrorObj,
    } = useReseniaByEvento(selectedEvento?.id_evento ?? "");

    const openCreateModal = (evento: EventoDTO) => {
        setSelectedEvento(evento);
        setMostrarFormEdicion(false);
        setStatusMsg(null);
    };

    const openDetalleModal = (evento: EventoDTO) => {
        setSelectedEvento(evento);
        setMostrarFormEdicion(false);
        setStatusMsg(null);
    };

    const closeModal = () => {
        setSelectedEvento(null);
    };

    const handleCrear = (data: CreateReviewInput) => {
        crear.mutate(data, {
            onSuccess: () => {
                setStatusMsg("Reseña creada correctamente.");
                closeModal();
            },
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

    const eventosOptions: EventoOption[] = selectedEvento
        ? [
              {
                  id_evento: selectedEvento.id_evento,
                  label:
                      TIPO_EVENTO_VIEW[selectedEvento.tipo_evento] ??
                      selectedEvento.tipo_evento,
              },
          ]
        : [];

    return (
        <div className="mc-main">
            <h1>Mis reseñas</h1>
            <br />

            {statusMsg && <p className="status-message">{statusMsg}</p>}

            {isLoading && <p>Cargando eventos...</p>}
            {isError && (
                <p className="error-text">
                    {error instanceof Error
                        ? error.message
                        : "Error al cargar tus eventos"}
                </p>
            )}

            <div className="ms-list">
                {eventos?.map((evento) => (
                    <EventoResenia
                        key={evento.id_evento}
                        evento={evento}
                        onCreateReview={openCreateModal}
                        onOpenDetalle={openDetalleModal}
                    />
                ))}
            </div>

            {eventos?.length === 0 && !isLoading && (
                <p>No tienes eventos registrados.</p>
            )}

            {selectedEvento && (
                <div
                    className="ms-modal-backdrop"
                    aria-modal="true"
                    role="dialog"
                    onClick={closeModal}
                >
                    <div
                        className="ms-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="ms-modal-header">
                            <h2>Reseña del evento</h2>
                            <button
                                className="ms-modal-close"
                                onClick={closeModal}
                                aria-label="Cerrar modal"
                            >
                                ×
                            </button>
                        </div>
                        <div className="ms-modal-content">
                            {statusMsg && (
                                <p className="status-message">{statusMsg}</p>
                            )}

                            <p>
                                Evento:{" "}
                                <strong>
                                    {TIPO_EVENTO_VIEW[
                                        selectedEvento.tipo_evento
                                    ] ?? selectedEvento.tipo_evento}
                                </strong>
                            </p>
                            <p>
                                Fecha:{" "}
                                {new Date(
                                    selectedEvento.fecha_hora,
                                ).toLocaleDateString()}
                            </p>

                            {reseniaLoading && <p>Cargando reseña...</p>}
                            {reseniaError && (
                                <p className="error-text">
                                    {reseniaErrorObj instanceof Error
                                        ? reseniaErrorObj.message
                                        : "Error al cargar la reseña."}
                                </p>
                            )}

                            {!reseniaLoading && !resenia && esDueño && (
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

                            {!reseniaLoading && !resenia && !esDueño && (
                                <p>Este evento aún no tiene reseña.</p>
                            )}

                            {!reseniaLoading && resenia && (
                                <div className="solicitud-detalle">
                                    <p>
                                        <strong>Calificación:</strong>{" "}
                                        {"★".repeat(resenia.calificacion)}
                                        {"☆".repeat(5 - resenia.calificacion)}
                                    </p>
                                    <p>
                                        <strong>Comentario:</strong>{" "}
                                        {resenia.comentario}
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
                                        {resenia.estado === "aprobado" &&
                                            resenia.comentario_edicion !==
                                                null && (
                                                <span className="badge badge-resenia-edicion">
                                                    Edición pendiente
                                                </span>
                                            )}
                                    </p>

                                    {esDueño &&
                                        resenia.estado === "aprobado" &&
                                        !mostrarFormEdicion &&
                                        resenia.comentario_edicion == null && (
                                            <button
                                                className="btn-gold"
                                                onClick={() =>
                                                    setMostrarFormEdicion(true)
                                                }
                                            >
                                                Solicitar edición
                                            </button>
                                        )}

                                    {esDueño && mostrarFormEdicion && (
                                        <ReseniaForm
                                            mode="editar"
                                            onSubmit={handleSolicitarEdicion}
                                            isLoading={
                                                solicitarEdicion.isPending
                                            }
                                            initialData={{
                                                comentario_edicion:
                                                    resenia.comentario_edicion ??
                                                    "",
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
