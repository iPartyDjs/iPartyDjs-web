/* ===== src/features/solicitudes/components/SolicitudForm.tsx ===== */
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
    CreateSolicitudSchema,
    type CreateSolicitudInput,
    type TipoEvento,
} from "@ipartydjs/shared";

const TIPO_EVENTO_OPTIONS: { value: TipoEvento; label: string }[] = [
    { value: "boda", label: "Boda" },
    { value: "xv_anos", label: "XV Años" },
    { value: "cumpleanos", label: "Cumpleaños" },
    { value: "corporativo", label: "Corporativo" },
    { value: "otro", label: "Otro" },
];

interface SolicitudFormInitialData {
    fecha_deseada?: string; // llega como ISO string desde SolicitudEventoDTO
    direccion?: string;
    tipo_evento?: TipoEvento;
}

interface SolicitudFormProps {
    onSubmit: (data: CreateSolicitudInput) => void;
    initialData?: SolicitudFormInitialData;
    isLoading?: boolean;
    mode: "crear" | "editar";
}

// Tipo de ENTRADA del schema: lo que existe en el form antes de que Zod
// transforme/coaccione fecha_deseada a Date. z.input<> ≠ z.output<> cuando
// el schema usa coerce/transform — por eso hacen falta ambos.
type SolicitudFormValues = z.input<typeof CreateSolicitudSchema>;

export function SolicitudForm({
    onSubmit,
    initialData,
    isLoading,
    mode,
}: SolicitudFormProps) {
    const defaultValues = useMemo(
        () => ({
            fecha_deseada: initialData?.fecha_deseada
                ? new Date(initialData.fecha_deseada)
                : undefined,
            direccion: initialData?.direccion ?? "",
            tipo_evento: initialData?.tipo_evento ?? "boda",
        }),
        [
            initialData?.fecha_deseada,
            initialData?.direccion,
            initialData?.tipo_evento,
        ],
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SolicitudFormValues, unknown, CreateSolicitudInput>({
        resolver: zodResolver(CreateSolicitudSchema),
        defaultValues,
    });

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    return (
        <form
            className="solicitud-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
        >
            <div className="form-field">
                <label htmlFor="fecha_deseada">Fecha deseada</label>
                <input
                    id="fecha_deseada"
                    type="date"
                    {...register("fecha_deseada", { valueAsDate: true })}
                />
                {errors.fecha_deseada && (
                    <span className="field-error">
                        {errors.fecha_deseada.message}
                    </span>
                )}
            </div>
            <br />

            <div className="form-field">
                <label htmlFor="direccion">Dirección</label>
                <textarea id="direccion" rows={3} {...register("direccion")} />
                {errors.direccion && (
                    <span className="field-error">
                        {errors.direccion.message}
                    </span>
                )}
            </div>
            <br />

            <div className="form-field">
                <label htmlFor="tipo_evento">Tipo de evento</label>
                <select id="tipo_evento" {...register("tipo_evento")}>
                    {TIPO_EVENTO_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {errors.tipo_evento && (
                    <span className="field-error">
                        {errors.tipo_evento.message}
                    </span>
                )}
            </div>

            <br />

            <button type="submit" className="btn-gold" disabled={isLoading}>
                {isLoading
                    ? "Guardando..."
                    : mode === "crear"
                      ? "Crear solicitud"
                      : "Actualizar solicitud"}
            </button>
        </form>
    );
}
