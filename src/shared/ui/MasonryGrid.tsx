import { type ReactNode } from "react";

// Tailwind escanea el código como texto plano en busca de nombres de clase
// completos — una clase armada con `${columns}` nunca se generaría en el
// CSS final. Este mapeo evita ese problema manteniendo las clases literales.
const columnClasses: Record<number, string> = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
};

type MasonryGridProps<T> = {
    items: T[];
    columns?: 2 | 3 | 4;
    getKey: (item: T) => string;
    renderItem: (item: T, index: number) => ReactNode;
    className?: string;
};

// Reparte los items en columnas independientes (round-robin) en vez de un
// solo grid con filas calzadas: cada columna fluye a su propio ritmo
// vertical, que es lo que produce el efecto masonry.
export default function MasonryGrid<T>({
    items,
    columns = 3,
    getKey,
    renderItem,
    className = "",
}: MasonryGridProps<T>) {
    const buckets: { item: T; index: number }[][] = Array.from(
        { length: columns },
        () => [],
    );

    items.forEach((item, index) => {
        buckets[index % columns].push({ item, index });
    });

    return (
        <div
            className={`grid grid-cols-2 gap-4 ${columnClasses[columns]} ${className}`}
        >
            {buckets.map((bucket, colIndex) => (
                <div key={colIndex} className="grid gap-4">
                    {bucket.map(({ item, index }) => (
                        <div key={getKey(item)}>{renderItem(item, index)}</div>
                    ))}
                </div>
            ))}
        </div>
    );
}
