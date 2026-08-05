/* ===== src/features/citas/pages/AgendarCita.tsx ===== */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import type { ScheduleAppointmentInput } from "@ipartydjs/shared";
import {
    CitaForm,
    type SolicitudOption,
} from "@/features/citas/components/CitaForm";
import { useAgendarCita } from "@/features/citas/hooks/useCitas";
import { citaService } from "@/features/citas/services/cita.service";
import { useListAllSolicitudes } from "@/features/solicitudes/hooks/useSolicitudes";

interface AgendarCitaProps {
    hideTitle?: boolean;
    onSuccess?: () => void;
}

export default function AgendarCita({
    hideTitle,
    onSuccess,
}: AgendarCitaProps) {
    const agendar = useAgendarCita();
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Solo solicitudes 'en_proceso' pueden recibir una cita (ver
    // CitaService.schedule). Se piden 100 para no dejar fuera solicitudes
    // válidas por paginación — si el volumen crece, esto debería cambiar
    // a una búsqueda server-side en vez de traer todo.
    const { data: solicitudesPage, isLoading: loadingSolicitudes } =
        useListAllSolicitudes("en_proceso", 1, 100);

    const solicitudesEnProceso = solicitudesPage?.data ?? [];

    // El backend NO impide agendar una segunda cita 'programada' sobre la
    // misma solicitud (solo valida el estado de la solicitud, no si ya
    // tiene una cita activa) — esta exclusión es una salvaguarda de UI,
    // no algo que el servidor esté rechazando por su cuenta.
    const citasQueries = useQueries({
        queries: solicitudesEnProceso.map((s) => ({
            queryKey: ["citas", "solicitud", s.id_solicitud],
            queryFn: () => citaService.getBySolicitud(s.id_solicitud),
            enabled: Boolean(s.id_solicitud),
        })),
    });

    const loadingCitas = citasQueries.some((q) => q.isLoading);

    const solicitudesOptions: SolicitudOption[] = useMemo(() => {
        return solicitudesEnProceso
            .filter((_s, index) => {
                const citas = citasQueries[index]?.data ?? [];
                const tieneActivaProgramada = citas.some(
                    (c) => c.estado === "programada",
                );
                return !tieneActivaProgramada;
            })
            .map((s) => ({
                id_solicitud: s.id_solicitud,
                label: `${s.tipo_evento} — ${s.fecha_deseada} (${s.direccion})`,
            }));
    }, [solicitudesEnProceso, citasQueries]);

    const handleSubmit = (data: ScheduleAppointmentInput) => {
        setErrorMsg(null);
        agendar.mutate(data, {
            onSuccess: () => {
                if (onSuccess) {
                    onSuccess();
                } else {
                    navigate("/citas");
                }
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

    const isLoading = loadingSolicitudes || loadingCitas;

    return (
        <div className={hideTitle ? undefined : "solicitudes-page"}>
            {!hideTitle && <h1>Agendar cita</h1>}
            {errorMsg && <p className="error-text">{errorMsg}</p>}
            {isLoading && <p>Cargando solicitudes disponibles...</p>}
            {!isLoading && solicitudesOptions.length === 0 && (
                <p className="resenia-hint">
                    No hay solicitudes en proceso sin cita programada
                    actualmente.
                </p>
            )}
            <CitaForm
                mode="agendar"
                solicitudesOptions={solicitudesOptions}
                onSubmit={handleSubmit}
                isLoading={agendar.isPending}
            />
        </div>
    );
}
