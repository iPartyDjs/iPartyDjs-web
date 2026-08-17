import { useRef, useEffect, useState } from "react";
import { SectionHeader, MasonryGrid, Button } from "@/shared/ui";
import GalleryCard, { type GalleryPhoto } from "./gallery/GalleryCard";
import GallerySkeleton from "./gallery/GallerySkeleton";

const Gallery = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);
    const [hovered, setHovered] = useState<string | null>(null);

    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) setVisible(true);
            },
            { threshold: 0.1 },
        );
        if (sectionRef.current) obs.observe(sectionRef.current);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        const fetchGalleryPhotos = async () => {
            try {
                setLoading(true);
                const apiUrl =
                    import.meta.env.VITE_API_URL || "http://localhost:4000/api";
                const response = await fetch(`${apiUrl}/fotografias/publicas`);

                if (!response.ok) {
                    throw new Error(
                        "Error al obtener las fotografías de la galería.",
                    );
                }

                const result = await response.json();
                const dataList = result.data || result;
                setPhotos(dataList);
            } catch (err: unknown) {
                setError(
                    (err as Error).message ||
                        "Ocurrió un error al cargar la galería.",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchGalleryPhotos();
    }, []);

    const getDimState = (id: string): "hovered" | "dimmed" | "idle" => {
        if (hovered === null) return "idle";
        return hovered === id ? "hovered" : "dimmed";
    };

    return (
        <section
            id="galeria"
            ref={sectionRef}
            className="bg-surface-1 px-6 py-24 lg:px-15 lg:py-35"
        >
            <SectionHeader
                eyebrow="Galería"
                title={
                    <>
                        Momentos que
                        <br />
                        <em className="text-gold italic">
                            hablaron por sí solos.
                        </em>
                    </>
                }
                className="mb-20"
            />

            {loading ? (
                <GallerySkeleton />
            ) : error ? (
                <div className="flex items-center justify-center py-24">
                    <p className="font-body text-sm text-danger">
                        No se pudo cargar la galería en este momento.
                    </p>
                </div>
            ) : photos.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                    <p className="font-body text-sm text-cream-faint">
                        Próximamente nuevos eventos y fotografías.
                    </p>
                </div>
            ) : (
                <MasonryGrid
                    items={photos}
                    columns={3}
                    getKey={(photo) => photo.id_fotografia}
                    className="mx-auto max-w-6xl"
                    renderItem={(photo, index) => (
                        <GalleryCard
                            photo={photo}
                            index={index}
                            visible={visible}
                            dimState={getDimState(photo.id_fotografia)}
                            onHoverStart={() => setHovered(photo.id_fotografia)}
                            onHoverEnd={() => setHovered(null)}
                        />
                    )}
                />
            )}

            <div className="mt-15 text-center">
                <Button href="#contacto" variant="outline" size="lg">
                    Ver Todos los Eventos
                </Button>
            </div>
        </section>
    );
};

export default Gallery;
