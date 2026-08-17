import { MasonryGrid } from "@/shared/ui";
import { ASPECT_RATIOS } from "./GalleryCard";

// Cantidad fija de placeholders — solo define cuántas "fotos falsas" se ven
// mientras carga, no depende de datos reales.
const SKELETON_COUNT = 9;
const skeletonItems = Array.from({ length: SKELETON_COUNT }, (_, i) => i);

export default function GallerySkeleton() {
    return (
        <MasonryGrid
            items={skeletonItems}
            columns={3}
            getKey={(id) => `skeleton-${id}`}
            className="mx-auto max-w-6xl"
            renderItem={(_, index) => (
                <div
                    style={{ animationDelay: `${index * 80}ms` }}
                    className={`animate-pulse bg-surface-2 ${
                        ASPECT_RATIOS[index % ASPECT_RATIOS.length]
                    }`}
                />
            )}
        />
    );
}
