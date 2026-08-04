import { useParams } from "react-router-dom";
import {
    useEvento,
    useStartPreparation,
    useCompleteEvento,
} from "@/features/eventos/hooks/useEventos";
import { useAuthStore } from "@/core/stores/auth.store";
import "./eventos.css";

const TIPO_EVENTO_LABEL: Record<string, string> = {
    boda: "Boda",
    xv_anos: "XV años",
    cumpleanos: "Cumpleaños",
    corporativo: "Corporativo",
    otro: "Evento",
};

export default function DetalleEvento() {
    const { id } = useParams<{ id: string }>();
    const eventoId = id ?? "";
    const { data: evento, isLoading, isError, error } = useEvento(eventoId);
    const hasRole = useAuthStore((state) => state.hasRole);
    const isAdmin = hasRole("administrador") || hasRole("superadministrador");

    const startPreparation = useStartPreparation();
    const complete = useCompleteEvento();

    const handleStartPreparation = () => {
        if (!evento) return;
        startPreparation.mutate(evento.id_evento);
    };

    const handleComplete = () => {
        if (!evento) return;
        if (!window.confirm("¿Marcar este evento como realizado?")) return;
        complete.mutate(evento.id_evento);
    };

    if (isLoading) return <div className="solicitudes-page">Cargando...</div>;
    if (isError || !evento) {
        return (
            <div className="solicitudes-page">
                <p className="error-text">
                    {error instanceof Error
                        ? error.message
                        : "No se pudo cargar el evento."}
                </p>
            </div>
        );
    }

    return (
        <div className="solicitudes-page">
            <h1>Detalle de evento</h1>

            <div className="solicitud-detalle">
                <p>
                    <strong>Tipo:</strong>{" "}
                    {TIPO_EVENTO_LABEL[evento.tipo_evento] ??
                        evento.tipo_evento}
                </p>
                <p>
                    <strong>Fecha y hora:</strong>{" "}
                    {new Date(evento.fecha_hora).toLocaleString()}
                </p>
                <p>
                    <strong>Dirección:</strong> {evento.direccion}
                </p>
                <p>
                    <strong>Estado:</strong>{" "}
                    <span className={`badge badge-evento-${evento.estado}`}>
                        {evento.estado}
                    </span>
                </p>
            </div>

            {isAdmin && evento.estado === "confirmado" && (
                <div className="actions-cell">
                    <button
                        className="btn-primary"
                        disabled={startPreparation.isPending}
                        onClick={handleStartPreparation}
                    >
                        Iniciar preparación
                    </button>
                </div>
            )}

            {isAdmin && evento.estado !== "realizado" && (
                <div className="actions-cell">
                    <button
                        className="btn-approve"
                        disabled={complete.isPending}
                        onClick={handleComplete}
                    >
                        Marcar como realizado
                    </button>
                </div>
            )}
        </div>
    );
}
