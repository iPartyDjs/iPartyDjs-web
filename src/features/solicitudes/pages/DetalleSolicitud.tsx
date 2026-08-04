import { useNavigate, useParams } from "react-router-dom";
import {
    useSolicitud,
    useApproveSolicitud,
    useRejectSolicitud,
} from "@/features/solicitudes/hooks/useSolicitudes";
import { useAuthStore } from "@/core/stores/auth.store";
import "./solicitudes.css";

export default function DetalleSolicitud() {
    const { id } = useParams<{ id: string }>();
    const solicitudId = id ?? "";
    const {
        data: solicitud,
        isLoading,
        isError,
        error,
    } = useSolicitud(solicitudId);
    const approve = useApproveSolicitud();
    const reject = useRejectSolicitud();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const hasRole = useAuthStore((state) => state.hasRole);

    const isAdmin = hasRole("administrador") || hasRole("superadministrador");
    const esDueño =
        user?.rol === "cliente" &&
        solicitud !== undefined &&
        user.id_cliente === solicitud.id_cliente;

    const handleApprove = () => {
        if (!solicitud) return;
        approve.mutate(solicitud.id_solicitud);
    };

    const handleReject = () => {
        if (!solicitud) return;
        const motivo =
            window.prompt("Motivo del rechazo (opcional):") ?? undefined;
        reject.mutate({ id: solicitud.id_solicitud, data: { motivo } });
    };

    if (isLoading) return <div className="solicitudes-page">Cargando...</div>;
    if (isError || !solicitud) {
        return (
            <div className="solicitudes-page">
                <p className="error-text">
                    {error instanceof Error
                        ? error.message
                        : "No se pudo cargar la solicitud."}
                </p>
            </div>
        );
    }

    return (
        <div className="solicitudes-page">
            <h1>Detalle de solicitud</h1>

            <div className="solicitud-detalle">
                <p>
                    <strong>ID:</strong> {solicitud.id_solicitud}
                </p>
                <p>
                    <strong>Tipo de evento:</strong> {solicitud.tipo_evento}
                </p>
                <p>
                    <strong>Fecha deseada:</strong> {solicitud.fecha_deseada}
                </p>
                <p>
                    <strong>Dirección:</strong> {solicitud.direccion}
                </p>
                <p>
                    <strong>Estado:</strong>{" "}
                    <span className={`badge badge-${solicitud.estado}`}>
                        {solicitud.estado}
                    </span>
                </p>
                <p>
                    <strong>Creado:</strong> {solicitud.created_at}
                </p>
            </div>

            <div className="actions-cell">
                {isAdmin && solicitud.estado === "pendiente" && (
                    <>
                        <button
                            className="btn-approve"
                            disabled={approve.isPending}
                            onClick={handleApprove}
                        >
                            Aprobar
                        </button>
                        <button
                            className="btn-reject"
                            disabled={reject.isPending}
                            onClick={handleReject}
                        >
                            Rechazar
                        </button>
                    </>
                )}

                {esDueño && solicitud.estado === "pendiente" && (
                    <button
                        className="btn-primary"
                        onClick={() =>
                            navigate(
                                `/solicitudes/${solicitud.id_solicitud}/editar`,
                            )
                        }
                    >
                        Editar
                    </button>
                )}
            </div>
        </div>
    );
}
