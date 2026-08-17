import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";
import { inputClasses, labelClasses } from "./Input";

type Option = { label: string; value: string };

type SelectProps = ComponentPropsWithoutRef<"select"> & {
    label?: string;
    helperText?: string;
    error?: string;
    options?: Option[];
    containerClassName?: string;
    labelClassName?: string;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
    { label, helperText, error, options = [], id, className, containerClassName, labelClassName, ...props },
    ref,
) {
    const resolvedId = id ?? (props as any).name;

    return (
        <div className={cn("flex flex-col gap-2", containerClassName)}>
            {label ? (
                <label htmlFor={resolvedId} className={cn(labelClasses, labelClassName)}>
                    {label}
                </label>
            ) : null}

            <select
                id={resolvedId}
                ref={ref}
                className={cn(inputClasses, className)}
                {...props}
            >
                {props.children ?? (
                    <>
                        {options.length === 0 ? null : (
                            <option value="" disabled hidden>
                                Selecciona...
                            </option>
                        )}
                        {options.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </>
                )}
            </select>

            {error ? (
                <p className="font-body text-sm text-danger">{error}</p>
            ) : helperText ? (
                <p className="font-body text-[0.68rem] text-cream-dim">{helperText}</p>
            ) : null}
        </div>
    );
});

export default Select;

export function SelectExample() {
    return (
        <form className="mx-auto max-w-md space-y-4">
            <Select
                label="Tipo de evento"
                name="tipo_evento"
                options={[
                    { label: "Boda", value: "boda" },
                    { label: "XV Años", value: "xv_anos" },
                    { label: "Cumpleaños", value: "cumpleanos" },
                ]}
            />
        </form>
    );
}
