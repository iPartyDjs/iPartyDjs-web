import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";
import { inputClasses, labelClasses } from "./Input";

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
    label?: string;
    helperText?: string;
    error?: string;
    containerClassName?: string;
    labelClassName?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    { label, helperText, error, id, className, containerClassName, labelClassName, ...props },
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

            <textarea
                id={resolvedId}
                ref={ref}
                className={cn(inputClasses, "resize-none", className)}
                {...props}
            />

            {error ? (
                <p className="font-body text-sm text-danger">{error}</p>
            ) : helperText ? (
                <p className="font-body text-[0.68rem] text-cream-dim">{helperText}</p>
            ) : null}
        </div>
    );
});

export default Textarea;

export function TextareaExample() {
    return (
        <form className="mx-auto max-w-md space-y-4">
            <Textarea
                label="Cuéntanos sobre tu evento"
                name="mensaje"
                rows={4}
                placeholder="Describe tu visión, número de invitados..."
            />
        </form>
    );
}
