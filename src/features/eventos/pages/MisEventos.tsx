import { useMisEventos } from "@/features/eventos/hooks/useEventos";
import type { EstadoEvento, TipoEvento } from "@ipartydjs/shared";

const TIPO_EVENTO_VIEW: Record<TipoEvento, string> = {
    boda: "Boda",
    xv_anos: "XV Años",
    corporativo: "Corporativo",
    cumpleanos: "Cumpleaños",
    otro: "Otro",
};

const STATUS_COLOR: Record<EstadoEvento, string> = {
    confirmado: "badge-gold",
    en_preparacion: "badge-blue",
    realizado: "badge-green",
};

export default function MisEventos() {
    const { data: eventos, isLoading, isError, error } = useMisEventos();

    return (
        <div className="mc-main">
            <h1>Mis eventos</h1>
            <br />

            {isLoading && <p>Cargando...</p>}
            {isError && (
                <p className="error-text">
                    {error instanceof Error
                        ? error.message
                        : "Error al cargar tus eventos"}
                </p>
            )}

            <div className="ms-list">
                {eventos?.map((evento) => (
                    <div key={evento.id_evento} className="ms-card">
                        <div className="ms-card-top">
                            <span className="ms-card-tipo">
                                {TIPO_EVENTO_VIEW[evento.tipo_evento]}
                            </span>
                            <span
                                className={`ms-badge ${STATUS_COLOR[evento.estado]}`}
                            >
                                {evento.estado}
                            </span>
                        </div>

                        <div className="ms-card-meta">
                            <span>
                                {new Date(evento.fecha_hora).toLocaleString()}
                            </span>
                            <span className="ms-dot">·</span>
                            <span>{evento.direccion}</span>
                        </div>
                    </div>
                ))}
            </div>

            {eventos?.length === 0 && !isLoading && (
                <p>No tienes eventos registrados.</p>
            )}
        </div>
    );
}
