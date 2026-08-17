import { cn } from "./cn";
import type { ComponentPropsWithoutRef } from "react";

const contactClass =
    "group relative flex items-center justify-between overflow-hidden border border-gold px-7 py-4.5 font-body text-[0.65rem] font-semibold tracking-[0.25em] text-gold uppercase transition-colors duration-300 hover:text-surface disabled:cursor-not-allowed disabled:opacity-60";

type ButtonFormProps = ComponentPropsWithoutRef<"button"> & {
    children: React.ReactNode;
};

export default function ButtonForm({ children, className, ...props }: ButtonFormProps) {
    return (
        <button {...props} className={cn(contactClass, className)}>
            <span aria-hidden className="absolute inset-0 -translate-x-full bg-gold transition-transform duration-400 ease-out group-hover:translate-x-0" />
            <span className="relative z-10">{children}</span>
            <span className="relative z-10 text-base transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </button>
    );
}
