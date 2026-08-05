/* ===== src/features/resenias/components/ReseniaForm.tsx ===== */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    CreateReviewSchema,
    RequestReviewEditionSchema,
    type CreateReviewInput,
    type RequestReviewEditionInput,
} from "@ipartydjs/shared";

export interface EventoOption {
    id_evento: string;
    label: string;
}

interface ReseniaFormCrearProps {
    mode: "crear";
    onSubmit: (data: CreateReviewInput) => void;
    isLoading?: boolean;
    eventosOptions: EventoOption[];
}

interface ReseniaFormEditarProps {
    mode: "editar";
    onSubmit: (data: RequestReviewEditionInput) => void;
    isLoading?: boolean;
    initialData?: { comentario_edicion?: string };
}

type ReseniaFormProps = ReseniaFormCrearProps | ReseniaFormEditarProps;

const CALIFICACIONES = [1, 2, 3, 4, 5];

export function ReseniaForm(props: ReseniaFormProps) {
    if (props.mode === "crear") {
        return <CrearReseniaForm {...props} />;
    }
    return <EditarReseniaForm {...props} />;
}

function CrearReseniaForm({
    onSubmit,
    isLoading,
    eventosOptions,
}: ReseniaFormCrearProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateReviewInput>({
        resolver: zodResolver(CreateReviewSchema),
        defaultValues: { id_evento: "", calificacion: 5, comentario: "" },
    });

    return (
        <form
            className="resenia-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
        >
            <div className="form-field">
                <label htmlFor="id_evento">Evento</label>
                <select id="id_evento" {...register("id_evento")}>
                    <option value="">Selecciona un evento</option>
                    {eventosOptions.map((opt) => (
                        <option key={opt.id_evento} value={opt.id_evento}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {errors.id_evento && (
                    <span className="field-error">
                        {errors.id_evento.message}
                    </span>
                )}
            </div>

            <div className="form-field">
                <label htmlFor="calificacion">Calificación</label>
                <select
                    id="calificacion"
                    {...register("calificacion", { valueAsNumber: true })}
                >
                    {CALIFICACIONES.map((n) => (
                        <option key={n} value={n}>
                            {n} {n === 1 ? "estrella" : "estrellas"}
                        </option>
                    ))}
                </select>
                {errors.calificacion && (
                    <span className="field-error">
                        {errors.calificacion.message}
                    </span>
                )}
            </div>

            <div className="form-field">
                <label htmlFor="comentario">Comentario</label>
                <textarea
                    id="comentario"
                    rows={4}
                    {...register("comentario")}
                />
                {errors.comentario && (
                    <span className="field-error">
                        {errors.comentario.message}
                    </span>
                )}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Crear reseña"}
            </button>
        </form>
    );
}

function EditarReseniaForm({
    onSubmit,
    isLoading,
    initialData,
}: ReseniaFormEditarProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RequestReviewEditionInput>({
        resolver: zodResolver(RequestReviewEditionSchema),
        defaultValues: {
            comentario_edicion: initialData?.comentario_edicion ?? "",
        },
    });

    return (
        <form
            className="resenia-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
        >
            <div className="form-field">
                <label htmlFor="comentario_edicion">Nuevo comentario</label>
                <textarea
                    id="comentario_edicion"
                    rows={4}
                    {...register("comentario_edicion")}
                />
                {errors.comentario_edicion && (
                    <span className="field-error">
                        {errors.comentario_edicion.message}
                    </span>
                )}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Solicitar edición"}
            </button>
        </form>
    );
}
