import type { HTMLAttributes } from "react";

type DecorativeGlowProps = HTMLAttributes<HTMLDivElement> & {
    background?: string;
    innerClassName?: string;
};

export default function DecorativeGlow({
    background,
    className,
    innerClassName,
    ...props
}: DecorativeGlowProps) {
    return (
        <div aria-hidden className={className} {...props}>
            <div
                className={innerClassName}
                style={{
                    background:
                        background ??
                        "radial-gradient(circle, rgba(var(--color-primary-rgb),0.05) 0%, transparent 70%)",
                }}
            />
        </div>
    );
}
