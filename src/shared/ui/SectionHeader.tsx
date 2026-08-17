import { type ReactNode } from "react";

type SectionHeaderProps = {
    eyebrow: string;
    title: ReactNode;
    align?: "center" | "left";
    className?: string;
};

export default function SectionHeader({
    eyebrow,
    title,
    align = "center",
    className = "",
}: SectionHeaderProps) {
    const isCenter = align === "center";

    return (
        <div className={className}>
            <div
                className={`flex items-center gap-4 text-gold text-xs tracking-[0.35em] uppercase ${
                    isCenter ? "justify-center" : ""
                }`}
            >
                <span className="h-px w-8 bg-gold/50" />
                {eyebrow}
                {isCenter && <span className="h-px w-8 bg-gold/50" />}
            </div>
            <h2
                className={`mt-5 font-display text-4xl font-light text-cream sm:text-5xl ${
                    isCenter ? "text-center" : ""
                }`}
            >
                {title}
            </h2>
        </div>
    );
}
