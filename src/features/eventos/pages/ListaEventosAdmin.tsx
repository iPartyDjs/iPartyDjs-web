import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EstadoEvento } from "@ipartydjs/shared";
import { useListAllEventos } from "@/features/eventos/hooks/useEventos";

const ESTADO_OPTIONS: EstadoEvento[] = [
    "confirmado",
    "en_preparacion",
    "realizado",
];
const LIMIT = 10;

const TIPO_EVENTO_LABEL: Record<string, string> = {
    boda: "Boda",
    xv_anos: "XV años",
    cumpleanos: "Cumpleaños",
    corporativo: "Corporativo",
    otro: "Evento",
};

export default function ListaEventosAdmin() {
    const [estado, setEstado] = useState<EstadoEvento | undefined>(undefined);
    const [page, setPage] = useState(1);
    const { data, isLoading, isError, error } = useListAllEventos(
        estado,
        page,
        LIMIT,
    );
    const navigate = useNavigate();

    const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

    return (
        <div className="solicitudes-page">
            <h1>Eventos</h1>

            <div className="solicitudes-filters">
                <label htmlFor="estado-filter">Estado</label>
                <select
                    id="estado-filter"
                    value={estado ?? ""}
                    onChange={(e) => {
                        setEstado(
                            e.target.value
                                ? (e.target.value as EstadoEvento)
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
                        : "Error al cargar eventos"}
                </p>
            )}

            <table className="solicitudes-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tipo</th>
                        <th>Fecha y hora</th>
                        <th>Dirección</th>
                        <th>Estado</th>
                        <th>Cliente</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.data.map((evento) => (
                        <tr key={evento.id_evento}>
                            <td>{evento.id_evento}</td>
                            <td>
                                {TIPO_EVENTO_LABEL[evento.tipo_evento] ??
                                    evento.tipo_evento}
                            </td>
                            <td>
                                {new Date(evento.fecha_hora).toLocaleString()}
                            </td>
                            <td>{evento.direccion}</td>
                            <td>
                                <span
                                    className={`badge badge-evento-${evento.estado}`}
                                >
                                    {evento.estado}
                                </span>
                            </td>
                            {/* EventoDTO no expone nombre de cliente, solo id_cliente. */}
                            <td>{evento.id_cliente}</td>
                            <td>
                                <button
                                    className="btn-secondary"
                                    onClick={() =>
                                        navigate(`/eventos/${evento.id_evento}`)
                                    }
                                >
                                    Ver
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {data?.data.length === 0 && !isLoading && (
                <p>No hay eventos registrados.</p>
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
