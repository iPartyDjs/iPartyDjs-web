import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EstadoCita } from "@ipartydjs/shared";
import {
    useListAllCitas,
    useCancelCita,
    useCompleteCita,
} from "@/features/citas/hooks/useCitas";

const ESTADO_OPTIONS: EstadoCita[] = ["programada", "realizada", "cancelada"];

export default function ListaCitasAdmin() {
    const [estado, setEstado] = useState<EstadoCita | undefined>(undefined);
    const [desde, setDesde] = useState<string>("");
    const [hasta, setHasta] = useState<string>("");

    const {
        data: citas,
        isLoading,
        isError,
        error,
    } = useListAllCitas(desde || undefined, hasta || undefined, estado);
    const cancel = useCancelCita();
    const complete = useCompleteCita();
    const navigate = useNavigate();

    const handleCancel = (id: string) => {
        const observaciones =
            window.prompt("Observaciones (opcional):") ?? undefined;
        cancel.mutate({ id, data: { observaciones } });
    };

    const handleComplete = (id: string, decision: "aceptado" | "rechazado") => {
        const observaciones =
            window.prompt("Observaciones (opcional):") ?? undefined;
        complete.mutate({ id, data: { decision, observaciones } });
    };

    return (
        <div className="solicitudes-page">
            <h1>Citas</h1>

            <div className="solicitudes-filters">
                <label htmlFor="estado-filter">Estado</label>
                <select
                    id="estado-filter"
                    value={estado ?? ""}
                    onChange={(e) =>
                        setEstado(
                            e.target.value
                                ? (e.target.value as EstadoCita)
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

                <label htmlFor="desde-filter">Desde</label>
                <input
                    id="desde-filter"
                    type="date"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                />

                <label htmlFor="hasta-filter">Hasta</label>
                <input
                    id="hasta-filter"
                    type="date"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                />
            </div>

            {isLoading && <p>Cargando...</p>}
            {isError && (
                <p className="error-text">
                    {error instanceof Error
                        ? error.message
                        : "Error al cargar citas"}
                </p>
            )}

            <table className="solicitudes-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Solicitud</th>
                        <th>Fecha y hora</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {citas?.map((cita) => (
                        <tr key={cita.id_cita}>
                            <td>{cita.id_cita}</td>
                            <td>{cita.id_solicitud}</td>
                            <td>
                                {new Date(cita.fecha_hora).toLocaleString()}
                            </td>
                            <td>
                                <span
                                    className={`badge badge-cita-${cita.estado}`}
                                >
                                    {cita.estado}
                                </span>
                            </td>
                            <td className="actions-cell">
                                {cita.estado === "programada" && (
                                    <>
                                        <button
                                            className="btn-approve"
                                            disabled={complete.isPending}
                                            onClick={() =>
                                                handleComplete(
                                                    cita.id_cita,
                                                    "aceptado",
                                                )
                                            }
                                        >
                                            Aceptar continuar
                                        </button>
                                        <button
                                            className="btn-reject"
                                            disabled={complete.isPending}
                                            onClick={() =>
                                                handleComplete(
                                                    cita.id_cita,
                                                    "rechazado",
                                                )
                                            }
                                        >
                                            Rechazar continuar
                                        </button>
                                        <button
                                            className="btn-reject"
                                            disabled={cancel.isPending}
                                            onClick={() =>
                                                handleCancel(cita.id_cita)
                                            }
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            className="btn-secondary"
                                            onClick={() =>
                                                navigate(
                                                    `/citas/${cita.id_cita}/reagendar`,
                                                )
                                            }
                                        >
                                            Reagendar
                                        </button>
                                    </>
                                )}
                                <button
                                    className="btn-secondary"
                                    onClick={() =>
                                        navigate(`/citas/${cita.id_cita}`)
                                    }
                                >
                                    Ver
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {citas?.length === 0 && !isLoading && (
                <p>No hay citas registradas.</p>
            )}
        </div>
    );
}
