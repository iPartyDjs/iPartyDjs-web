import { useEffect, useRef } from "react";

const particles = Array.from({ length: 20 }).map(() => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    animationDelay: Math.random() * 6,
    animationDuration: 4 + Math.random() * 6,
    width: 1 + Math.random() * 2,
    height: 1 + Math.random() * 2,
}));

const Hero = () => {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const els = [
            titleRef.current,
            subtitleRef.current,
            ctaRef.current,
            scrollRef.current,
        ];
        els.forEach((el, i) => {
            if (!el) return;
            el.style.opacity = "0";
            el.style.transform = "translateY(40px)";
            setTimeout(
                () => {
                    if (!el) return;
                    el.style.transition = `opacity 1.2s ease, transform 1.2s ease`;
                    el.style.opacity = "1";
                    el.style.transform = "translateY(0)";
                },
                400 + i * 200,
            );
        });
    }, []);

    /*
    const particles = useMemo(
        () =>
            Array.from({ length: 20 }).map(() => ({
                left: Math.random() * 100,
                top: Math.random() * 100,
                animationDelay: Math.random() * 6,
                animationDuration: 4 + Math.random() * 6,
                width: 1 + Math.random() * 2,
                height: 1 + Math.random() * 2,
            })),
        [],
    );
*/
    return (
        <section id="inicio" className="hero">
            <div className="hero-bg">
                <div className="hero-gradient" />
                <div className="hero-grid" />
                <div className="hero-particles">
                    {particles.map((particle, i) => (
                        <div
                            key={i}
                            className="particle"
                            style={{
                                left: `${particle.left}%`,
                                top: `${particle.top}%`,
                                animationDelay: `${particle.animationDelay}s`,
                                animationDuration: `${particle.animationDuration}s`,
                                width: `${particle.width}px`,
                                height: `${particle.height}px`,
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="hero-content">
                <div className="hero-eyebrow">
                    <span className="eyebrow-line" />
                    <span className="eyebrow-text">
                        Producción & Coordinación de Eventos
                    </span>
                    <span className="eyebrow-line" />
                </div>

                <h1 ref={titleRef} className="hero-title">
                    Creamos <em>experiencias</em>
                    <br />
                    que se convierten en
                    <br />
                    <span className="title-gold">memorias eternas.</span>
                </h1>

                <p ref={subtitleRef} className="hero-subtitle">
                    Bodas · XV Años · Cumpleaños · Eventos Empresariales
                    <br />
                    Dirección musical, diseño sonoro y visual de clase mundial.
                </p>

                <div ref={ctaRef} className="hero-cta">
                    <a href="#contacto" className="btn-primary">
                        Cotiza tu Evento
                    </a>
                    <a href="#galeria" className="btn-outline">
                        Ver Galería
                    </a>
                </div>
            </div>

            <div ref={scrollRef} className="scroll-indicator">
                <div className="scroll-line" />
                <span className="scroll-text">SCROLL</span>
            </div>

            <div className="hero-badge">
                <span>CDMX · MX</span>
            </div>
        </section>
    );
};

export default Hero;
