import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ScheduleAppointmentInput } from "@ipartydjs/shared";
import {
    CitaForm,
    type SolicitudOption,
} from "@/features/citas/components/CitaForm";
import { useAgendarCita } from "@/features/citas/hooks/useCitas";
import { useListAllSolicitudes } from "@/features/solicitudes/hooks/useSolicitudes";

export default function AgendarCita() {
    const agendar = useAgendarCita();
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Solo solicitudes 'en_proceso' pueden recibir una cita (ver
    // CitaService.schedule en el backend).
    const { data: solicitudesPage, isLoading } = useListAllSolicitudes(
        "en_proceso",
        1,
        100,
    );

    const solicitudesOptions: SolicitudOption[] =
        solicitudesPage?.data.map((s) => ({
            id_solicitud: s.id_solicitud,
            label: `${s.tipo_evento} — ${s.fecha_deseada} (${s.direccion})`,
        })) ?? [];

    const handleSubmit = (data: ScheduleAppointmentInput) => {
        setErrorMsg(null);
        agendar.mutate(data, {
            onSuccess: () => {
                navigate("/citas");
            },
            onError: (error) => {
                setErrorMsg(
                    error instanceof Error
                        ? error.message
                        : "No se pudo agendar la cita.",
                );
            },
        });
    };

    return (
        <div className="solicitudes-page">
            <h1>Agendar cita</h1>
            {errorMsg && <p className="error-text">{errorMsg}</p>}
            {isLoading && <p>Cargando solicitudes disponibles...</p>}
            <CitaForm
                mode="agendar"
                solicitudesOptions={solicitudesOptions}
                onSubmit={handleSubmit}
                isLoading={agendar.isPending}
            />
        </div>
    );
}
