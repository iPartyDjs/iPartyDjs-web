import { cn } from "./cn";
import type { ComponentPropsWithoutRef } from "react";

type ButtonNavigateProps = ComponentPropsWithoutRef<"button"> & {
    children: React.ReactNode;
};

export default function ButtonNavigate({ children, className, ...props }: ButtonNavigateProps) {
    return (
        <button
            {...props}
            className={cn(
                "inline-flex items-center justify-center rounded-sm font-semibold uppercase tracking-[0.15em] transition-colors duration-300",
                className,
            )}
        >
            {children}
        </button>
    );
}
