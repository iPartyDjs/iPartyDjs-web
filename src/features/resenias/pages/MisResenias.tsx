/* ===== src/features/resenias/pages/MisResenias.tsx ===== */
import { useNavigate } from "react-router-dom";
import { useReseniaByEvento } from "@/features/resenias/hooks/useResenias";
import type { EstadoResenia, EventoDTO, TipoEvento } from "@ipartydjs/shared";
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

function EventoResenia({ evento }: { evento: EventoDTO }) {
    const { data: resenia, isLoading } = useReseniaByEvento(evento.id_evento);
    const navigate = useNavigate();
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
                    onClick={() =>
                        navigate(`/resenias/crear?evento=${evento.id_evento}`)
                    }
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
        <div className="mc-main">
            <h1>Mis reseñas</h1>
            <br />

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
                    <EventoResenia key={evento.id_evento} evento={evento} />
                ))}
            </div>

            {eventos?.length === 0 && !isLoading && (
                <p>No tienes eventos registrados.</p>
            )}
        </div>
    );
}
