import { useState, useRef, useEffect } from "react";

const steps = [
    {
        num: "1.0",
        title: "Discovery",
        subtitle: "Primer acercamiento con el cliente.",
        desc: "Nos sentamos contigo, hacemos las preguntas correctas y entendemos a fondo la visión de tu evento. Cada detalle importa desde el primer momento.",
    },
    {
        num: "2.0",
        title: "Creative Direction",
        subtitle: "Mood, personalidad musical y visión estética.",
        desc: "Definimos el concepto creativo, la atmósfera, la paleta sonora y el universo visual que hará único a tu evento.",
    },
    {
        num: "3.0",
        title: "Experience Design",
        subtitle: "Diseño de la experiencia sonora y visual.",
        desc: "Construimos minuto a minuto el recorrido emocional de tu evento: cada transición, efecto e instalación audiovisual perfectamente orquestada.",
    },
    {
        num: "4.0",
        title: "Production Planning",
        subtitle: "Planeación técnica y coordinación.",
        desc: "Trabajo práctico y detallado: selección de equipo, coordinación logística, pruebas técnicas y gestión de todos los proveedores.",
    },
    {
        num: "5.0",
        title: "Celebration",
        subtitle: "La experiencia sucede.",
        desc: "El día llega y nosotros lo ejecutamos con precisión absoluta. Tú te enfocas en disfrutar, nosotros nos encargamos del resto.",
    },
];

const Process = () => {
    const [open, setOpen] = useState<number | null>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

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
        <section id="proceso" ref={sectionRef} className="process">
            <div className="process-inner">
                <div className="process-left">
                    <span className="section-tag">— Proceso —</span>
                    <h2 className="section-title">
                        <em>Trabajaremos</em>
                        <br />
                        contigo desde
                        <br />
                        el diseño hasta
                        <br />
                        la producción.
                    </h2>
                    <p className="section-desc">
                        Cinco etapas cuidadosamente diseñadas para transformar
                        tu idea en una experiencia que supere todas las
                        expectativas.
                    </p>
                </div>

                <div className="process-right">
                    {steps.map((step, i) => (
                        <div
                            key={step.num}
                            className={`process-step ${open === i ? "active" : ""} ${visible ? "visible" : ""}`}
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            <button
                                className="step-header"
                                onClick={() => setOpen(open === i ? null : i)}
                            >
                                <span className="step-num">{step.num}</span>
                                <div className="step-titles">
                                    <span className="step-title">
                                        {step.title}
                                    </span>
                                    <span className="step-subtitle">
                                        {step.subtitle}
                                    </span>
                                </div>
                                <span className="step-arrow">
                                    {open === i ? "−" : "+"}
                                </span>
                            </button>
                            <div className="step-content">
                                <p>{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Process;
