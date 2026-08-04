import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CreateSolicitudInput } from "@ipartydjs/shared";
import { SolicitudForm } from "@/features/solicitudes/components/SolicitudForm";
import { useCrearSolicitud } from "@/features/solicitudes/hooks/useSolicitudes";
import "./solicitudes.css";

export default function CrearSolicitud() {
    const crear = useCrearSolicitud();
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = (data: CreateSolicitudInput) => {
        setErrorMsg(null);
        crear.mutate(data, {
            onSuccess: () => {
                navigate("/mis-solicitudes");
            },
            onError: (error) => {
                setErrorMsg(
                    error instanceof Error
                        ? error.message
                        : "No se pudo crear la solicitud.",
                );
            },
        });
    };

    return (
        <div className="solicitudes-page">
            <h1>Nueva solicitud</h1>
            {errorMsg && <p className="error-text">{errorMsg}</p>}
            <SolicitudForm
                mode="crear"
                onSubmit={handleSubmit}
                isLoading={crear.isPending}
            />
        </div>
    );
}
