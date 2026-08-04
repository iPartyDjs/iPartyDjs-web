/* ===== src/features/solicitudes/pages/EditarSolicitud.tsx ===== */
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { UpdateSolicitudInput } from "@ipartydjs/shared";
import { SolicitudForm } from "@/features/solicitudes/components/SolicitudForm";
import {
    useSolicitud,
    useUpdateSolicitud,
} from "@/features/solicitudes/hooks/useSolicitudes";
import "./solicitudes.css";

export default function EditarSolicitud() {
    const { id } = useParams<{ id: string }>();
    const solicitudId = id ?? "";
    const { data: solicitud, isLoading } = useSolicitud(solicitudId);
    const update = useUpdateSolicitud();
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = (data: UpdateSolicitudInput) => {
        setErrorMsg(null);
        update.mutate(
            { id: solicitudId, data },
            {
                onSuccess: () => {
                    navigate("/mis-solicitudes");
                },
                onError: (error) => {
                    setErrorMsg(
                        error instanceof Error
                            ? error.message
                            : "No se pudo actualizar la solicitud.",
                    );
                },
            },
        );
    };

    if (isLoading) return <div className="solicitudes-page">Cargando...</div>;
    if (!solicitud)
        return <div className="solicitudes-page">Solicitud no encontrada.</div>;

    return (
        <div className="solicitudes-page">
            <h1>Editar solicitud</h1>
            {errorMsg && <p className="error-text">{errorMsg}</p>}
            <SolicitudForm
                mode="editar"
                initialData={{
                    fecha_deseada: solicitud.fecha_deseada,
                    direccion: solicitud.direccion,
                    tipo_evento: solicitud.tipo_evento,
                }}
                onSubmit={handleSubmit}
                isLoading={update.isPending}
            />
        </div>
    );
}
