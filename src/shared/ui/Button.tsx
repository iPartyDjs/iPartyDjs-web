import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";
import { cn } from "./cn";

const button = cva(
    "inline-flex items-center justify-center rounded-sm font-semibold uppercase tracking-[0.15em] transition-colors duration-300",
    {
        variants: {
            variant: {
                gold: "bg-gold text-surface! hover:bg-gold-light",
                contact:
                    "group relative flex items-center justify-between overflow-hidden border border-gold px-7 py-4.5 font-body text-[0.65rem] font-semibold tracking-[0.25em] text-gold uppercase transition-colors duration-300 hover:text-surface disabled:cursor-not-allowed disabled:opacity-60",
                outline:
                    "border border-gold text-gold hover:bg-gold hover:text-surface!",
                ghost: "text-cream hover:text-gold",
            },
            size: {
                sm: "h-10 px-5 text-xs",
                md: "h-12 px-6 text-sm",
                lg: "h-14 px-8 text-sm",
            },
        },
        defaultVariants: {
            variant: "gold",
            size: "md",
        },
    },
);

type ButtonProps = ComponentProps<"a"> & VariantProps<typeof button>;

export default function Button({
    variant,
    size,
    className,
    ...props
}: ButtonProps) {
    return (
        <a className={cn(button({ variant, size }), className)} {...props} />
    );
}
