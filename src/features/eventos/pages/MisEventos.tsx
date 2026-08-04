import { useNavigate } from "react-router-dom";
import { useMisEventos } from "@/features/eventos/hooks/useEventos";

const TIPO_EVENTO_LABEL: Record<string, string> = {
    boda: "Boda",
    xv_anos: "XV años",
    cumpleanos: "Cumpleaños",
    corporativo: "Corporativo",
    otro: "Evento",
};

export default function MisEventos() {
    const { data: eventos, isLoading, isError, error } = useMisEventos();
    const navigate = useNavigate();

    return (
        <div className="solicitudes-page">
            <h1>Mis eventos</h1>

            {isLoading && <p>Cargando...</p>}
            {isError && (
                <p className="error-text">
                    {error instanceof Error
                        ? error.message
                        : "Error al cargar tus eventos"}
                </p>
            )}

            <div className="solicitudes-grid">
                {eventos?.map((evento) => (
                    <div key={evento.id_evento} className="solicitud-card">
                        <p className="solicitud-tipo">
                            {TIPO_EVENTO_LABEL[evento.tipo_evento] ??
                                evento.tipo_evento}
                        </p>
                        <p>
                            Fecha:{" "}
                            {new Date(evento.fecha_hora).toLocaleString()}
                        </p>
                        <p>Dirección: {evento.direccion}</p>
                        <p>
                            Estado:{" "}
                            <span
                                className={`badge badge-evento-${evento.estado}`}
                            >
                                {evento.estado}
                            </span>
                        </p>
                        <button
                            className="btn-secondary"
                            onClick={() =>
                                navigate(`/eventos/${evento.id_evento}`)
                            }
                        >
                            Ver detalle
                        </button>
                    </div>
                ))}
            </div>

            {eventos?.length === 0 && !isLoading && (
                <p>No tienes eventos registrados.</p>
            )}
        </div>
    );
}
