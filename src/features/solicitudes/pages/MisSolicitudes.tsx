import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EstadoSolicitud, TipoEvento } from "@ipartydjs/shared";
import { useMisSolicitudes } from "@/features/solicitudes/hooks/useSolicitudes";
import EditarSolicitud from "./EditarSolicitud";

const ESTADO_OPTIONS: EstadoSolicitud[] = [
    "pendiente",
    "en_proceso",
    "completada",
    "rechazada",
];

const STATUS_COLOR: Record<EstadoSolicitud, string> = {
    completada: "badge-green",
    pendiente: "badge-gold",
    rechazada: "badge-red",
    en_proceso: "badge-blue",
};

const TIPO_EVENTO_VIEW: Record<TipoEvento, string> = {
    boda: "Boda",
    xv_anos: "XV Años",
    corporativo: "Corporativo",
    cumpleanos: "Cumpleaños",
    otro: "Otro",
};

export default function MisSolicitudes() {
    const [estado, setEstado] = useState<EstadoSolicitud | undefined>(
        undefined,
    );
    const [selectedSolicitudId, setSelectedSolicitudId] = useState<
        string | null
    >(null);
    const {
        data: solicitudes,
        isLoading,
        isError,
        error,
    } = useMisSolicitudes(estado);
    // We now render EditarSolicitud directly inside the modal via idProp
    const navigate = useNavigate();

    return (
        <div className="mc-main">
            <header className="step-header">
                <h1>Mis solicitudes</h1>
                <button
                    className="btn-gold"
                    onClick={() => navigate("/dashboard/solicitudes/nueva")}
                >
                    Nueva solicitud
                </button>
            </header>

            <div
                className="ms-filters"
                role="tablist"
                aria-label="Filtros de estado"
            >
                <button
                    type="button"
                    className={`ms-filter-btn ${estado === undefined ? "active" : ""}`}
                    onClick={() => setEstado(undefined)}
                >
                    Todos
                </button>
                {ESTADO_OPTIONS.map((opt) => (
                    <button
                        key={opt}
                        type="button"
                        className={`ms-filter-btn  ${estado === opt ? "active" : ""}`}
                        onClick={() => setEstado(opt)}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            {isLoading && <p>Cargando solicitudes...</p>}
            {isError && (
                <p className="error-text">
                    {error instanceof Error
                        ? error.message
                        : "Error al cargar solicitudes"}
                </p>
            )}

            <div className="">
                <div className="ms-section-label">
                    Solicitudes ({solicitudes?.length})
                </div>
                <div className="ms-list">
                    {solicitudes?.map((s) => (
                        <div
                            key={s.id_solicitud}
                            className={`ms-card`}
                            onClick={() => {
                                if (s.estado == "pendiente") {
                                    return setSelectedSolicitudId(
                                        s.id_solicitud,
                                    );
                                }
                            }}
                        >
                            <div className="ms-card-top">
                                <span className="ms-card-tipo">
                                    {TIPO_EVENTO_VIEW[s.tipo_evento]}
                                </span>
                                <span
                                    className={`ms-badge ${STATUS_COLOR[s.estado]}`}
                                >
                                    {s.estado}
                                </span>
                            </div>

                            <div className="ms-card-meta">
                                <span>{s.fecha_deseada}</span>
                                <span className="ms-dot">·</span>
                                <span>{s.direccion}</span>
                            </div>

                            <div className="ms-card-enviada">
                                Enviada el {s.created_at}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedSolicitudId && (
                <div
                    className="ms-modal-backdrop"
                    onClick={() => setSelectedSolicitudId(null)}
                >
                    <div
                        className="ms-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Editar solicitud"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="ms-modal-header">
                            <h2>Editar solicitud</h2>
                            <button
                                type="button"
                                className="ms-modal-close"
                                onClick={() => setSelectedSolicitudId(null)}
                                aria-label="Cerrar modal"
                            >
                                ×
                            </button>
                        </div>

                        <EditarSolicitud
                            idProp={selectedSolicitudId}
                            hideHeader
                            onClose={() => setSelectedSolicitudId(null)}
                        />
                    </div>
                </div>
            )}

            {solicitudes?.length === 0 && !isLoading && (
                <p>No tienes solicitudes registradas.</p>
            )}
        </div>
    );
}
