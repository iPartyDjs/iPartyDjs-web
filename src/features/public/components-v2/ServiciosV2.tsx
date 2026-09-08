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

export default function ServiciosV2() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="servicios" ref={sectionRef} className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 text-center">
          <span className="text-gold uppercase tracking-widest">— Servicios —</span>
          <h2 className="mt-4 text-3xl font-semibold text-black">Producción de eventos<br/><em className="not-italic">como ningún otro.</em></h2>
          <p className="mt-3 text-gray-700">Trabajamos con los mejores organizadores de eventos para crear experiencias que tú y tus invitados nunca olvidarán.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <div key={s.title} className={`rounded-lg border p-6 shadow-sm bg-white ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{transitionDelay: `${i * 120}ms`}}>
              <div className="mb-4 text-3xl">{s.icon}</div>
              <h3 className="mb-2 text-xl font-semibold text-black">{s.title}</h3>
              <p className="text-gray-700">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-gray-700">
          <div className="mb-3 font-medium">Especialistas en</div>
          <div className="flex flex-wrap justify-center gap-3">
            {['Bodas','XV Años','Cumpleaños','Eventos Empresariales','Fiestas Privadas'].map(e=> (
              <span key={e} className="rounded-full border px-3 py-1 text-sm">{e}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
