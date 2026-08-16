import type { HTMLAttributes } from "react";

type DecorativeShapeProps = HTMLAttributes<HTMLDivElement> & {
    kind?: "blob" | "glow";
    clipPath?: string;
    background?: string;
    innerClassName?: string;
};

export default function DecorativeShape({
    kind = "blob",
    clipPath,
    background,
    className,
    innerClassName,
    ...props
}: DecorativeShapeProps) {
    const defaultClip =
        "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)";

    const innerStyle: any = {};
    if (kind === "blob") {
        innerStyle.clipPath = clipPath ?? defaultClip;
    } else {
        innerStyle.background =
            background ??
            "radial-gradient(circle, rgba(var(--color-primary-rgb),0.05) 0%, transparent 70%)";
    }

    // Ensure the inner element fills the outer container by default so
    // glows are visible even when the caller only sets outer sizing classes.
    innerStyle.width = innerStyle.width ?? "100%";
    innerStyle.height = innerStyle.height ?? "100%";

    return (
        <div aria-hidden className={className} {...props}>
            <div style={innerStyle} className={innerClassName} />
        </div>
    );
}
