import { Image } from "@imagekit/react";
import { useRef, useEffect, useState } from "react";

const galleryItems = [
    { id: 1, label: "Boda de Ensueño", type: "Boda", color: "#1a1208" },
    { id: 2, label: "XV Años Mágicos", type: "XV Años", color: "#0d1a12" },
    { id: 3, label: "Gala Empresarial", type: "Corporativo", color: "#150d1a" },
    { id: 4, label: "Cumpleaños Élite", type: "Cumpleaños", color: "#1a0d0d" },
    { id: 5, label: "Boda en Jardín", type: "Boda", color: "#0d130f" },
    { id: 6, label: "Noche de Gala", type: "Corporativo", color: "#12100d" },
];

const Gallery = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);
    const [hovered, setHovered] = useState<number | null>(null);

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

            <div className="gallery-grid">
                {galleryItems.map((item, i) => (
                    <div
                        key={item.id}
                        className={`gallery-card ${visible ? "visible" : ""} ${hovered === item.id ? "hovered" : hovered !== null ? "dimmed" : ""}`}
                        style={{
                            transitionDelay: `${i * 100}ms`,
                            background: item.color,
                        }}
                        onMouseEnter={() => setHovered(item.id)}
                        onMouseLeave={() => setHovered(null)}
                        data-hover
                    >
                        <Image
                            urlEndpoint="https://ik.imagekit.io/uyilq4hre"
                            src="/WhatsApp Image 2026-05-20 at 6.37.13 PM.jpeg"
                            width={500}
                            height={500}
                            alt="Picture of the author"
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
                            <span className="gallery-type">{item.type}</span>
                            <span className="gallery-name">{item.label}</span>
                            <span className="gallery-view">Ver evento →</span>
                        </div>
                        <div className="gallery-num">
                            {String(item.id).padStart(2, "0")}
                        </div>
                    </div>
                ))}
            </div>

            <div className="gallery-cta">
                <a href="#contacto" className="btn-outline">
                    Ver Todos los Eventos
                </a>
            </div>
        </section>
    );
};

export default Gallery;
