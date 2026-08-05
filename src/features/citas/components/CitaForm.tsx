import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
    ScheduleAppointmentSchema,
    type ScheduleAppointmentInput,
} from "@ipartydjs/shared";
import { zodResolver } from "@hookform/resolvers/zod";

export interface SolicitudOption {
    id_solicitud: string;
    label: string;
}

interface CitaFormInitialData {
    id_solicitud?: string;
    fecha_hora?: string; // ISO string desde CitaDTO
    enlace_videollamada?: string;
}

interface CitaFormProps {
    onSubmit: (data: ScheduleAppointmentInput) => void;
    isLoading?: boolean;
    initialData?: CitaFormInitialData;
    mode: "agendar" | "reagendar";
    solicitudesOptions: SolicitudOption[];
}

// Igual que en SolicitudForm: fecha_hora entra como valor "crudo" (Date desde
// un <input datetime-local>, ya lo produce el propio input) y Zod la valida
// vía FutureDateSchema. z.input/z.output difieren si el schema transforma.
type CitaFormValues = z.input<typeof ScheduleAppointmentSchema>;

function toDatetimeLocalValue(iso: string | undefined): string {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
        date.getHours(),
    )}:${pad(date.getMinutes())}`;
}

export function CitaForm({
    onSubmit,
    isLoading,
    initialData,
    mode,
    solicitudesOptions,
}: CitaFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CitaFormValues, unknown, ScheduleAppointmentInput>({
        resolver: zodResolver(ScheduleAppointmentSchema),
        defaultValues: {
            id_solicitud: initialData?.id_solicitud ?? "",
            fecha_hora: initialData?.fecha_hora
                ? new Date(initialData.fecha_hora)
                : undefined,
            enlace_videollamada: initialData?.enlace_videollamada ?? "",
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                id_solicitud: initialData.id_solicitud ?? "",
                fecha_hora: initialData.fecha_hora
                    ? new Date(initialData.fecha_hora)
                    : undefined,
                enlace_videollamada: initialData.enlace_videollamada ?? "",
            });
        }
    }, [initialData, reset]);

    return (
        <form
            className="solicitud-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
        >
            <div className="form-field">
                <label htmlFor="id_solicitud">Solicitud</label>
                <select id="id_solicitud" {...register("id_solicitud")}>
                    <option value="">Selecciona una solicitud</option>
                    {solicitudesOptions.map((opt) => (
                        <option key={opt.id_solicitud} value={opt.id_solicitud}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {errors.id_solicitud && (
                    <span className="field-error">
                        {errors.id_solicitud.message}
                    </span>
                )}
            </div>

            <div className="form-field">
                <label htmlFor="fecha_hora">Fecha y hora</label>
                <input
                    id="fecha_hora"
                    type="datetime-local"
                    defaultValue={toDatetimeLocalValue(initialData?.fecha_hora)}
                    {...register("fecha_hora", { valueAsDate: true })}
                />
                {errors.fecha_hora && (
                    <span className="field-error">
                        {errors.fecha_hora.message}
                    </span>
                )}
            </div>

            <div className="form-field">
                <label htmlFor="enlace_videollamada">
                    Enlace de videollamada
                </label>
                <input
                    id="enlace_videollamada"
                    type="url"
                    placeholder="https://meet.google.com/..."
                    {...register("enlace_videollamada")}
                />
                {errors.enlace_videollamada && (
                    <span className="field-error">
                        {errors.enlace_videollamada.message}
                    </span>
                )}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading
                    ? "Guardando..."
                    : mode === "agendar"
                      ? "Agendar cita"
                      : "Reagendar cita"}
            </button>
        </form>
    );
}
