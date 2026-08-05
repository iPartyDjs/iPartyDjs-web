import { useRef, useEffect, useState } from "react";

interface FotografiaPublica {
  id_fotografia: string;
  titulo: string;
  descripcion?: string;
  url_imagen: string;
  created_at: string;
  estado: string;
  tipo?: string;
}

const Gallery = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const [photos, setPhotos] = useState<FotografiaPublica[]>([]);
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
          throw new Error("Error al obtener las fotografías de la galería.");
        }

        const result = await response.json();
        const dataList = result.data || result;
        setPhotos(dataList);
      } catch (err: unknown) {
        setError(
          (err as Error).message || "Ocurrió un error al cargar la galería.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryPhotos();
  }, []);

  return (
    <section id="galeria" ref={sectionRef} className="gallery">
      <div className="section-header">
        <span className="section-tag">— Galería —</span>
        <h2 className="section-title">
          Momentos que
          <br />
          <em>hablaron por sí solos.</em>
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24 text-amber-400">
          <p className="text-sm tracking-widest uppercase animate-pulse">
            Cargando galería...
          </p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-24 text-red-400">
          <p className="text-sm tracking-wide">
            No se pudo cargar la galería en este momento.
          </p>
        </div>
      ) : photos.length === 0 ? (
        <div className="flex justify-center items-center py-24 text-neutral-500">
          <p className="text-sm tracking-wide">
            Próximamente nuevos eventos y fotografías.
          </p>
        </div>
      ) : (
        <div className="gallery-grid">
          {photos.map((item, i) => (
            <div
              key={item.id_fotografia}
              className={`gallery-card ${visible ? "visible" : ""} ${hovered === item.id_fotografia ? "hovered" : hovered !== null ? "dimmed" : ""}`}
              style={{
                transitionDelay: `${i * 100}ms`,
                background: "#1a1208",
              }}
              onMouseEnter={() => setHovered(item.id_fotografia)}
              onMouseLeave={() => setHovered(null)}
              data-hover
            >
              <img
                src={item.url_imagen}
                alt={item.titulo || "Fotografía de evento iPartyDjs"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />

              <div className="gallery-pattern">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div
                    key={j}
                    className="gallery-ring"
                    style={{ animationDelay: `${j * 0.4}s` }}
                  />
                ))}
              </div>
              <div className="gallery-overlay" />
              <div className="gallery-info">
                <span className="gallery-type">
                  {item.tipo || "Evento iPartyDjs"}
                </span>
                <span className="gallery-name">{item.titulo}</span>
                <span className="gallery-view">Ver evento →</span>
              </div>
              <div className="gallery-num">
                {String(i + 1).padStart(2, "0")}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="gallery-cta">
        <a href="#contacto" className="btn-outline">
          Ver Todos los Eventos
        </a>
      </div>
    </section>
  );
};

export default Gallery;
