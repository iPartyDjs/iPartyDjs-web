/* ===== src/features/solicitudes/pages/MisSolicitudes.tsx ===== */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EstadoSolicitud } from "@ipartydjs/shared";
import { useMisSolicitudes } from "@/features/solicitudes/hooks/useSolicitudes";
import "./solicitudes.css";

const ESTADO_OPTIONS: EstadoSolicitud[] = [
    "pendiente",
    "en_proceso",
    "completada",
    "rechazada",
];

export default function MisSolicitudes() {
    const [estado, setEstado] = useState<EstadoSolicitud | undefined>(
        undefined,
    );
    const {
        data: solicitudes,
        isLoading,
        isError,
        error,
    } = useMisSolicitudes(estado);
    const navigate = useNavigate();

    return (
        <div className="solicitudes-page">
            <header className="solicitudes-header">
                <h1>Mis solicitudes</h1>
                <button
                    className="btn-primary"
                    onClick={() => navigate("/solicitudes/nueva")}
                >
                    Nueva solicitud
                </button>
            </header>

            <div className="solicitudes-filters">
                <label htmlFor="estado-filter">Filtrar por estado</label>
                <select
                    id="estado-filter"
                    value={estado ?? ""}
                    onChange={(e) =>
                        setEstado(
                            e.target.value
                                ? (e.target.value as EstadoSolicitud)
                                : undefined,
                        )
                    }
                >
                    <option value="">Todos</option>
                    {ESTADO_OPTIONS.map((e) => (
                        <option key={e} value={e}>
                            {e}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading && <p>Cargando solicitudes...</p>}
            {isError && (
                <p className="error-text">
                    {error instanceof Error
                        ? error.message
                        : "Error al cargar solicitudes"}
                </p>
            )}

            <div className="solicitudes-grid">
                {solicitudes?.map((s) => (
                    <div key={s.id_solicitud} className="solicitud-card">
                        <p className="solicitud-tipo">{s.tipo_evento}</p>
                        <p>Fecha deseada: {s.fecha_deseada}</p>
                        <p>
                            Estado:{" "}
                            <span className={`badge badge-${s.estado}`}>
                                {s.estado}
                            </span>
                        </p>
                        <button
                            className="btn-secondary"
                            onClick={() =>
                                navigate(`/solicitudes/${s.id_solicitud}`)
                            }
                        >
                            Ver detalle
                        </button>
                    </div>
                ))}
            </div>

            {solicitudes?.length === 0 && !isLoading && (
                <p>No tienes solicitudes registradas.</p>
            )}
        </div>
    );
}
