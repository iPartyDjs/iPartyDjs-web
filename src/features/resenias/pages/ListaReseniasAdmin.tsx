import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListAllEventos } from "@/features/eventos/hooks/useEventos";
import { useReseniaByEvento } from "@/features/resenias/hooks/useResenias";
import type { EventoDTO } from "@ipartydjs/shared";

function FilaReseniaEvento({ evento }: { evento: EventoDTO }) {
    const { data: resenia, isLoading } = useReseniaByEvento(evento.id_evento);
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <tr>
                <td colSpan={5}>
                    Cargando reseña de evento {evento.id_evento}...
                </td>
            </tr>
        );
    }

    if (!resenia) {
        return (
            <tr>
                <td>{evento.id_evento}</td>
                <td>{evento.tipo_evento}</td>
                <td>—</td>
                <td>Sin reseña</td>
                <td>—</td>
            </tr>
        );
    }

    return (
        <tr>
            <td>{evento.id_evento}</td>
            <td>{evento.tipo_evento}</td>
            <td>{resenia.calificacion} / 5</td>
            <td>
                <span className={`badge badge-resenia-${resenia.estado}`}>
                    {resenia.estado}
                </span>
                {resenia.estado === "aprobado" &&
                    resenia.comentario_edicion !== null && (
                        <span className="badge badge-resenia-edicion">
                            Edición pendiente
                        </span>
                    )}
            </td>
            <td>
                <button
                    className="btn-secondary"
                    onClick={() =>
                        navigate(`/resenias/evento/${evento.id_evento}`)
                    }
                >
                    Ver / gestionar
                </button>
            </td>
        </tr>
    );
}

export default function ListaReseniasAdmin() {
    const [page, setPage] = useState(1);
    const LIMIT = 20;

    // Solo eventos 'realizado' pueden tener reseña.
    const { data, isLoading, isError, error } = useListAllEventos(
        "realizado",
        page,
        LIMIT,
    );

    const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

    return (
        <div className="solicitudes-page">
            <h1>Reseñas</h1>
            <p className="resenia-hint">
                No existe un listado directo de reseñas en el backend; se
                muestran los eventos realizados y su reseña asociada (si
                existe).
            </p>

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
                        <th>Evento</th>
                        <th>Tipo</th>
                        <th>Calificación</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.data.map((evento) => (
                        <FilaReseniaEvento
                            key={evento.id_evento}
                            evento={evento}
                        />
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
