import clsx from "clsx";
import GalleryRings from "./GalleryRings";

export type GalleryPhoto = {
    id_fotografia: string;
    titulo: string;
    descripcion?: string;
    url_imagen: string;
    created_at: string;
    estado: string;
    tipo?: string;
};

// Alterna proporciones para el efecto masonry — evita que todas las tarjetas
// se vean con la misma altura.
export const ASPECT_RATIOS = [
    "aspect-[3/4]",
    "aspect-square",
    "aspect-[4/5]",
    "aspect-[3/5]",
    "aspect-[5/6]",
];

type GalleryCardProps = {
    photo: GalleryPhoto;
    index: number;
    visible: boolean;
    dimState: "hovered" | "dimmed" | "idle";
    onHoverStart: () => void;
    onHoverEnd: () => void;
};

export default function GalleryCard({
    photo,
    index,
    visible,
    dimState,
    onHoverStart,
    onHoverEnd,
}: GalleryCardProps) {
    return (
        <div
            onMouseEnter={onHoverStart}
            onMouseLeave={onHoverEnd}
            style={{ transitionDelay: `${index * 100}ms` }}
            className={clsx(
                "group relative overflow-hidden bg-surface-2 transition-all duration-800",
                ASPECT_RATIOS[index % ASPECT_RATIOS.length],
                visible ? "scale-100 opacity-100" : "scale-95 opacity-0",
                dimState === "hovered" && "brightness-110",
                dimState === "dimmed" && "brightness-40",
                dimState === "idle" && "brightness-100",
            )}
        >
            <img
                src={photo.url_imagen}
                alt={photo.titulo || "Fotografía de evento iPartyDjs"}
                className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <GalleryRings />

            <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />

            <div className="absolute inset-x-0 bottom-0 flex translate-y-5 flex-col gap-1 p-6 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="font-body text-[0.55rem] tracking-[0.3em] text-gold uppercase">
                    {photo.tipo || "Evento iPartyDjs"}
                </span>
                <span className="font-display text-2xl text-cream">
                    {photo.titulo}
                </span>
                <span className="mt-2 font-body text-[0.65rem] tracking-widest text-gold">
                    Ver evento →
                </span>
            </div>

            <span className="absolute top-5 right-5 font-display text-xs text-gold/40 italic">
                {String(index + 1).padStart(2, "0")}
            </span>
        </div>
    );
}
