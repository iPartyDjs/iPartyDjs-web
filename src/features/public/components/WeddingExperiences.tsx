import { useRef } from "react";
import { motion, useInView } from "motion/react";

type CardKind = "base" | "signature" | "addon" | "guaranteed";

interface ExperienceCard {
  id: string;
  kind: CardKind;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  cta: string;
}

const cards: ExperienceCard[] = [
  {
    id: "signature-experience",
    kind: "base",
    badge: "Base",
    title: "Signature Experience",
    tagline: "El punto de entrada a la experiencia iParty Club.",
    description:
      "DJ & Consola Musical de alta calidad, Diseño Sonoro Personalizado y Coordinación de Momentos Clave. Ideal para toda boda que busca una pista llena de energía y ritmo.",
    features: [
      "DJ & Consola Musical",
      "Audio D&B, RCF o Nexo",
      "Diseño Sonoro Personalizado",
      "Coordinación de Momentos Clave",
      "Hasta 250 invitados",
    ],
    cta: "Reservar experiencia",
  },
  {
    id: "wedding-boiler-room",
    kind: "signature",
    badge: "Signature",
    title: "Wedding Boiler Room",
    tagline: "Bodas que se convierten en LEYENDAS.",
    description:
      "Una experiencia inmersiva e inolvidable, con interacción en cabina con nuestros DJs. La fiesta trasciende el escenario y se convierte en un evento de talla mundial.",
    features: [
      "Interacción en Cabina",
      "Set en vivo tipo Boiler Room",
      "Energía de Festival",
      "Experiencia Inmersiva Total",
      "Concepto Fotográfico",
    ],
    cta: "Reservar experiencia",
  },
  {
    id: "visual-experience",
    kind: "addon",
    badge: "Add-on",
    title: "Visual Experience",
    tagline: "Cada momento cobra vida en tiempo real.",
    description:
      "Pantallas LED de alta definición operadas por VJ Profesional. Desde visuales elegantes y minimalistas hasta experiencias tipo festival que elevan la energía de la celebración.",
    features: [
      "Pantallas LED Gran Formato (2.6mm)",
      "VJ Profesional en tiempo real",
      "Contenido sincronizado",
      "Diseño visual personalizado",
      "Synergize a tiempo con la música",
    ],
    cta: "Reservar experiencia",
  },
  {
    id: "360-lighting-experience",
    kind: "addon",
    badge: "Add-on",
    title: "360° Lighting Experience",
    tagline:
      "Los momentos más importantes merecen verse desde todos los ángulos.",
    description:
      "Iluminación envolvente que cubre por completo la pista. Cada momento se vive con claridad y profundidad cinematográfica de nivel mundial. La novia se ve espectacular.",
    features: [
      "Iluminación 360° perimetral",
      "Mejora fotos y videos",
      "Acceso arquitectónico y elegante",
      "Diseño de iluminación de alto nivel",
      "Cobertura total de la pista",
    ],
    cta: "Reservar experiencia",
  },
  {
    id: "atmosphere-fx",
    kind: "addon",
    badge: "Add-on",
    title: "Atmosphere FX",
    tagline: "La pista se convierte en una experiencia visual envolvente.",
    description:
      "Niebla ligera sin saturar todo tu evento. Los efectos de iluminación crean láser que proyectan con mayor intensidad, profundidad y definición. Estilo festival.",
    features: [
      "Niebla ligera tipo evento",
      "Interfaces visuales de luz",
      "Diseño dual disponible",
      "Ambiente estilo festival",
      "Cinematográfico y estético",
    ],
    cta: "Reservar experiencia",
  },
  {
    id: "ceremony-experience",
    kind: "guaranteed",
    badge: "Garantizado",
    title: "Ceremony Experience",
    tagline: "Cada palabra se escucha con claridad y elegancia.",
    description:
      "Audio discreto y de alta fidelidad para la ceremonia, con micrófonos modernos. Sonorización Completa donde cuidamos y aseguramos cada momento musical.",
    features: [
      "Audio discreto de alta fidelidad",
      "Micrófono inalámbrico profesional",
      "Opción de Musicalización Completa",
      "Desde llegada hasta salida de novios",
      "Perfectamente sincronizado",
    ],
    cta: "Reservar experiencia",
  },
];

/**
 * Hace scroll suave hasta el formulario de contacto (id="contacto",
 * mismo ancla que ya usa el link "CONTACTO" de la navbar).
 */
function scrollToContacto() {
  document.getElementById("contacto")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function ExperienceCardItem({
  card,
  index,
}: {
  card: ExperienceCard;
  index: number;
}) {
  return (
    <motion.article
      className={`we-card we-card--${card.kind}`}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <header className="we-card__header">
        <span className="we-card__badge">
          {card.kind === "guaranteed" && (
            <span className="we-card__badge-dot" aria-hidden="true" />
          )}
          {card.badge}
        </span>
        {card.kind === "base" && (
          <span className="we-card__icon" aria-hidden="true">
            ↗
          </span>
        )}
      </header>

      <h3 className="we-card__title">{card.title}</h3>
      <p className="we-card__tagline">{card.tagline}</p>
      <p className="we-card__description">{card.description}</p>

      <ul className="we-card__features">
        {card.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      <button type="button" className="we-card__cta" onClick={scrollToContacto}>
        {card.cta}
      </button>
    </motion.article>
  );
}

export default function WeddingExperiences() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.6 });

  return (
    <section className="wedding-experiences" id="experiencias-de-autor">
      <div className="wedding-experiences__inner">
        <motion.div
          ref={headerRef}
          className="we-header"
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="we-header__title">
            Experiencias de
            <br />
            <span className="we-header__title-accent">Bodas de Autor</span>
          </h2>
          <p className="we-header__subtitle">
            Más que servicios adicionales, diseñamos experiencias que
            transforman cada momento de tu boda en algo verdaderamente
            inolvidable.
          </p>
        </motion.div>

        <div className="we-grid">
          {cards.map((card, index) => (
            <ExperienceCardItem key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
