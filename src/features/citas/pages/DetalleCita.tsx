import { useNavigate, useParams } from "react-router-dom";
import {
    useCita,
    useCitasBySolicitud,
    useCancelCita,
    useCompleteCita,
} from "@/features/citas/hooks/useCitas";
import { useAuthStore } from "@/core/stores/auth.store";

export default function DetalleCita() {
    const { id } = useParams<{ id: string }>();
    const citaId = id ?? "";
    const { data: cita, isLoading, isError, error } = useCita(citaId);
    const hasRole = useAuthStore((state) => state.hasRole);
    const isAdmin = hasRole("administrador") || hasRole("superadministrador");
    const cancel = useCancelCita();
    const complete = useCompleteCita();
    const navigate = useNavigate();

    const { data: historial } = useCitasBySolicitud(cita?.id_solicitud ?? "");

    const handleCancel = () => {
        if (!cita) return;
        const observaciones =
            window.prompt("Observaciones (opcional):") ?? undefined;
        cancel.mutate({ id: cita.id_cita, data: { observaciones } });
    };

    const handleComplete = (decision: "aceptado" | "rechazado") => {
        if (!cita) return;
        const observaciones =
            window.prompt("Observaciones (opcional):") ?? undefined;
        complete.mutate({
            id: cita.id_cita,
            data: { decision, observaciones },
        });
    };

    if (isLoading) return <div className="solicitudes-page">Cargando...</div>;
    if (isError || !cita) {
        return (
            <div className="solicitudes-page">
                <p className="error-text">
                    {error instanceof Error
                        ? error.message
                        : "No se pudo cargar la cita."}
                </p>
            </div>
        );
    }

    return (
        <div className="solicitudes-page">
            <h1>Detalle de cita</h1>

            <div className="solicitud-detalle">
                <p>
                    <strong>ID:</strong> {cita.id_cita}
                </p>
                <p>
                    <strong>Solicitud:</strong> {cita.id_solicitud}
                </p>
                <p>
                    <strong>Fecha y hora:</strong>{" "}
                    {new Date(cita.fecha_hora).toLocaleString()}
                </p>
                <p>
                    <strong>Estado:</strong>{" "}
                    <span className={`badge badge-cita-${cita.estado}`}>
                        {cita.estado}
                    </span>
                </p>
                {cita.observaciones && (
                    <p>
                        <strong>Observaciones:</strong> {cita.observaciones}
                    </p>
                )}
                <p>
                    <a
                        href={cita.enlace_videollamada}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Abrir enlace de videollamada
                    </a>
                </p>
            </div>

            {isAdmin && cita.estado === "programada" && (
                <div className="actions-cell">
                    <button
                        className="btn-approve"
                        disabled={complete.isPending}
                        onClick={() => handleComplete("aceptado")}
                    >
                        Aceptar continuar
                    </button>
                    <button
                        className="btn-reject"
                        disabled={complete.isPending}
                        onClick={() => handleComplete("rechazado")}
                    >
                        Rechazar continuar
                    </button>
                    <button
                        className="btn-reject"
                        disabled={cancel.isPending}
                        onClick={handleCancel}
                    >
                        Cancelar
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() =>
                            navigate(`/citas/${cita.id_cita}/reagendar`)
                        }
                    >
                        Reagendar
                    </button>
                </div>
            )}

            {historial && historial.length > 1 && (
                <div className="cita-historial">
                    <h3>Historial de reagendamientos</h3>
                    <ul>
                        {historial.map((h) => (
                            <li key={h.id_cita}>
                                {new Date(h.fecha_hora).toLocaleString()} —{" "}
                                <span
                                    className={`badge badge-cita-${h.estado}`}
                                >
                                    {h.estado}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
