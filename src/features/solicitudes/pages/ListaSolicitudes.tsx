import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EstadoSolicitud } from "@ipartydjs/shared";
import {
    useListAllSolicitudes,
    useApproveSolicitud,
    useRejectSolicitud,
} from "@/features/solicitudes/hooks/useSolicitudes";
import "./solicitudes.css";

const ESTADO_OPTIONS: EstadoSolicitud[] = [
    "pendiente",
    "en_proceso",
    "completada",
    "rechazada",
];
const LIMIT = 10;

export default function ListaSolicitudes() {
    const [estado, setEstado] = useState<EstadoSolicitud | undefined>(
        undefined,
    );
    const [page, setPage] = useState(1);
    const { data, isLoading, isError, error } = useListAllSolicitudes(
        estado,
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
        // Placeholder simple: sin modal propio, ver aviso en el chat.
        const motivo =
            window.prompt("Motivo del rechazo (opcional):") ?? undefined;
        reject.mutate({ id, data: { motivo } });
    };

    const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

    return (
        <div className="solicitudes-page">
            <h1>Solicitudes</h1>

            <div className="solicitudes-filters">
                <label htmlFor="estado-filter">Filtrar por estado</label>
                <select
                    id="estado-filter"
                    value={estado ?? ""}
                    onChange={(e) => {
                        setEstado(
                            e.target.value
                                ? (e.target.value as EstadoSolicitud)
                                : undefined,
                        );
                        setPage(1);
                    }}
                >
                    <option value="">Todos</option>
                    {ESTADO_OPTIONS.map((e) => (
                        <option key={e} value={e}>
                            {e}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading && <p>Cargando...</p>}
            {isError && (
                <p className="error-text">
                    {error instanceof Error
                        ? error.message
                        : "Error al cargar solicitudes"}
                </p>
            )}

            <table className="solicitudes-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tipo</th>
                        <th>Fecha deseada</th>
                        <th>Estado</th>
                        <th>Cliente</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.data.map((s) => (
                        <tr key={s.id_solicitud}>
                            <td>{s.id_solicitud}</td>
                            <td>{s.tipo_evento}</td>
                            <td>{s.fecha_deseada}</td>
                            <td>
                                <span className={`badge badge-${s.estado}`}>
                                    {s.estado}
                                </span>
                            </td>
                            {/* SolicitudEventoDTO no expone nombre de cliente, solo id_cliente. */}
                            <td>{s.id_cliente}</td>
                            <td className="actions-cell">
                                {s.estado === "pendiente" && (
                                    <>
                                        <button
                                            className="btn-approve"
                                            disabled={approve.isPending}
                                            onClick={() =>
                                                handleApprove(s.id_solicitud)
                                            }
                                        >
                                            Aprobar
                                        </button>
                                        <button
                                            className="btn-reject"
                                            disabled={reject.isPending}
                                            onClick={() =>
                                                handleReject(s.id_solicitud)
                                            }
                                        >
                                            Rechazar
                                        </button>
                                    </>
                                )}
                                <button
                                    className="btn-secondary"
                                    onClick={() =>
                                        navigate(
                                            `/solicitudes/${s.id_solicitud}`,
                                        )
                                    }
                                >
                                    Ver
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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
