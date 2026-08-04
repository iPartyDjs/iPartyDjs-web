/* ===== src/features/resenias/pages/MisResenias.tsx ===== */
import { useNavigate } from "react-router-dom";
import { useReseniaByEvento } from "@/features/resenias/hooks/useResenias";
import type { EventoDTO } from "@ipartydjs/shared";
import { useMisEventos } from "@/features/eventos/hooks/useEventos";

const TIPO_EVENTO_LABEL: Record<string, string> = {
    boda: "Boda",
    xv_anos: "XV años",
    cumpleanos: "Cumpleaños",
    corporativo: "Corporativo",
    otro: "Evento",
};

function EventoResenia({ evento }: { evento: EventoDTO }) {
    const { data: resenia, isLoading } = useReseniaByEvento(evento.id_evento);
    const navigate = useNavigate();
    const label = TIPO_EVENTO_LABEL[evento.tipo_evento] ?? evento.tipo_evento;

    return (
        <div className="solicitud-card">
            <p className="solicitud-tipo">{label}</p>
            <p>Fecha: {new Date(evento.fecha_hora).toLocaleDateString()}</p>

            {isLoading && <p>Cargando reseña...</p>}

            {!isLoading && evento.estado === "realizado" && !resenia && (
                <button
                    className="btn-primary"
                    onClick={() =>
                        navigate(`/resenias/crear?evento=${evento.id_evento}`)
                    }
                >
                    Crear reseña
                </button>
            )}

            {!isLoading && resenia && (
                <>
                    <p>
                        Calificación: {"★".repeat(resenia.calificacion)}
                        {"☆".repeat(5 - resenia.calificacion)}
                    </p>
                    <p className="resenia-comentario-resumen">
                        {resenia.comentario}
                    </p>
                    <span className={`badge badge-resenia-${resenia.estado}`}>
                        {resenia.estado}
                    </span>
                    <button
                        className="btn-secondary"
                        onClick={() =>
                            navigate(`/resenias/evento/${evento.id_evento}`)
                        }
                    >
                        Ver detalle
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

    return (
        <div className="solicitudes-page">
            <h1>Mis reseñas</h1>

            {isLoading && <p>Cargando eventos...</p>}
            {isError && (
                <p className="error-text">
                    {error instanceof Error
                        ? error.message
                        : "Error al cargar tus eventos"}
                </p>
            )}

            <div className="solicitudes-grid">
                {eventos?.map((evento) => (
                    <EventoResenia key={evento.id_evento} evento={evento} />
                ))}
            </div>

            {eventos?.length === 0 && !isLoading && (
                <p>No tienes eventos registrados.</p>
            )}
        </div>
    );
}
