import { useEffect, useRef, useState } from "react";

const services = [
    {
        icon: "♪",
        title: "Dirección Musical",
        desc: "Selección musical personalizada, DJ profesional y animación para cada momento de tu evento.",
    },
    {
        icon: "◈",
        title: "Diseño Sonoro",
        desc: "Sistemas profesionales de audio, acústica y efectos sonoros de última generación.",
    },
    {
        icon: "✦",
        title: "Diseño Visual",
        desc: "Pantallas LED, iluminación arquitectónica robótica y ambientación visual completa.",
    },
    {
        icon: "◉",
        title: "Producción Integral",
        desc: "Coordinación total del evento: logística, montaje, contenido digital y efectos especiales.",
    },
];

const Services = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) setVisible(true);
            },
            { threshold: 0.2 },
        );
        if (sectionRef.current) obs.observe(sectionRef.current);
        return () => obs.disconnect();
    }, []);

    return (
        <section id="servicios" ref={sectionRef} className="services">
            <div className="section-header">
                <span className="section-tag">— Servicios —</span>
                <h2 className="section-title">
                    Producción de eventos
                    <br />
                    <em>como ningún otro.</em>
                </h2>
                <p className="section-desc">
                    Trabajamos con los mejores organizadores de eventos para
                    crear experiencias que tú y tus invitados nunca olvidarán.
                </p>
            </div>

            <div className="services-grid">
                {services.map((s, i) => (
                    <div
                        key={s.title}
                        className={`service-card ${visible ? "visible" : ""}`}
                        style={{ transitionDelay: `${i * 150}ms` }}
                    >
                        <div className="service-icon">{s.icon}</div>
                        <h3 className="service-title">{s.title}</h3>
                        <p className="service-desc">{s.desc}</p>
                        <div className="service-line" />
                    </div>
                ))}
            </div>

            <div className="services-events">
                <div className="events-label">Especialistas en</div>
                <div className="events-list">
                    {[
                        "Bodas",
                        "XV Años",
                        "Cumpleaños",
                        "Eventos Empresariales",
                        "Fiestas Privadas",
                        "Graduaciones",
                    ].map((e) => (
                        <span key={e} className="event-tag">
                            {e}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
