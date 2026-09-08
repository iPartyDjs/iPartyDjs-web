import { useEffect, useRef, useState } from "react";

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

export default function ProcesoV2() {
  const [open, setOpen] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="proceso" ref={sectionRef} className="bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-6 lg:flex lg:gap-12">
        <div className="lg:w-1/3">
          <span className="text-gold uppercase tracking-widest">— Proceso —</span>
          <h2 className="mt-4 text-3xl font-semibold">Trabajaremos<br/><em>contigo desde</em><br/>el diseño hasta la producción.</h2>
          <p className="mt-3 text-gray-700">Cinco etapas cuidadosamente diseñadas para transformar tu idea en una experiencia que supere todas las expectativas.</p>
        </div>

        <div className="mt-8 grid gap-4 lg:mt-0 lg:w-2/3">
          {steps.map((step, i) => (
            <div key={step.num} className={`rounded-lg border bg-white p-4 ${visible ? 'shadow-md' : ''}`} style={{transitionDelay: `${i*80}ms`}}>
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-mono text-gold">{step.num}</div>
                  <div>
                    <div className="text-lg font-semibold text-black">{step.title}</div>
                    <div className="text-sm text-gray-600">{step.subtitle}</div>
                  </div>
                </div>
                <div className="text-2xl">{open === i ? '−' : '+'}</div>
              </button>
              {open === i && <div className="mt-3 text-gray-700">{step.desc}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
