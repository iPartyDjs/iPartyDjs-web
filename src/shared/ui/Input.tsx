import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

export const inputClasses =
    "w-full border border-white/8 bg-surface-1 px-4 py-3.5 font-body text-[0.78rem] font-light text-cream placeholder:text-cream/25 outline-none transition-colors duration-300 focus:border-gold focus:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60";

export const labelClasses =
    "text-[0.6rem] tracking-[0.2em] uppercase text-gold";

type InputProps = ComponentPropsWithoutRef<"input"> & {
    label?: string;
    helperText?: string;
    error?: string;
    containerClassName?: string;
    labelClassName?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    {
        label,
        helperText,
        error,
        containerClassName,
        labelClassName,
        id,
        className,
        ...props
    },
    ref,
) {
    const resolvedId = id ?? props.name;

    return (
        <div className={cn("flex flex-col gap-2", containerClassName)}>
            {label ? (
                <label
                    htmlFor={resolvedId}
                    className={cn(labelClasses, labelClassName)}
                >
                    {label}
                </label>
            ) : null}

            <input
                id={resolvedId}
                ref={ref}
                className={cn(
                    inputClasses,
                    error && "border-danger focus:border-danger",
                    className,
                )}
                aria-invalid={Boolean(error) || props["aria-invalid"]}
                {...props}
            />

            {error ? (
                <p className="font-body text-sm text-danger">{error}</p>
            ) : helperText ? (
                <p className="font-body text-[0.68rem] text-cream-dim">
                    {helperText}
                </p>
            ) : null}
        </div>
    );
});

export default Input;

export function InputExample() {
    return (
        <form className="mx-auto max-w-md space-y-4 rounded border border-white/10 bg-surface p-6">
            <Input
                label="Nombre completo"
                name="nombre"
                type="text"
                placeholder="Tu nombre"
                defaultValue=""
                helperText="Se usará para coordinar tu evento."
            />

            <Input
                label="Correo electrónico"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                defaultValue=""
                required
            />

            <button
                type="submit"
                className="group relative flex w-full items-center justify-between overflow-hidden border border-gold px-7 py-4 font-body text-[0.65rem] font-semibold tracking-[0.25em] text-gold uppercase transition-colors duration-300 hover:text-surface"
            >
                <span
                    aria-hidden
                    className="absolute inset-0 -translate-x-full bg-gold transition-transform duration-400 ease-out group-hover:translate-x-0"
                />
                <span className="relative z-10">Enviar</span>
                <span className="relative z-10 text-base">→</span>
            </button>
        </form>
    );
}
