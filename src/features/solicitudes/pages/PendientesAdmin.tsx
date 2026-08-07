/* ===== src/features/solicitudes/pages/PendientesAdmin.tsx ===== */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useListPendingSolicitudes,
    useApproveSolicitud,
    useRejectSolicitud,
} from "@/features/solicitudes/hooks/useSolicitudes";
import "./solicitudes.css";

const LIMIT = 10;

export default function PendientesAdmin() {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError, error } = useListPendingSolicitudes(
        page,
        LIMIT,
    );
    const approve = useApproveSolicitud();
    const reject = useRejectSolicitud();
    const navigate = useNavigate();

    const handleApprove = (id: string) => {
        approve.mutate(id);
    };

    const handleReject = (id: string) => {
        const motivo =
            window.prompt("Motivo del rechazo (opcional):") ?? undefined;
        reject.mutate({ id, data: { motivo } });
    };

    const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

    return (
        <div className="solicitudes-page">
            <h1>Solicitudes pendientes</h1>

            {isLoading && <p>Cargando...</p>}
            {isError && (
                <p className="error-text">
                    {error instanceof Error
                        ? error.message
                        : "Error al cargar solicitudes pendientes"}
                </p>
            )}

            <div className="solicitudes-grid">
                {data?.data.map((s) => (
                    <div key={s.id_solicitud} className="solicitud-card">
                        <p className="solicitud-tipo">{s.tipo_evento}</p>
                        <p>Fecha deseada: {s.fecha_deseada}</p>
                        <p>Cliente: {s.id_cliente}</p>
                        <div className="actions-cell">
                            <button
                                className="btn-approve"
                                disabled={approve.isPending}
                                onClick={() => handleApprove(s.id_solicitud)}
                            >
                                Aprobar
                            </button>
                            <button
                                className="btn-reject"
                                disabled={reject.isPending}
                                onClick={() => handleReject(s.id_solicitud)}
                            >
                                Rechazar
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() =>
                                    navigate(`/solicitudes/${s.id_solicitud}`)
                                }
                            >
                                Ver
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {data?.data.length === 0 && !isLoading && (
                <p>No hay solicitudes pendientes.</p>
            )}

            <div className="pagination">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                >
                    Anterior
                </button>
                <span>
                    Página {page} de {totalPages || 1}
                </span>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
