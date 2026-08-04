import { useState, useRef, useEffect } from "react";
import { useContact } from "../../../core/hooks/useContact";
import type { CreateContactInput } from "@ipartydjs/shared";

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  // Hook de React Query conectado a tu apiClient
  const { mutate, isPending, isSuccess, isError, error, reset } = useContact();

  const [form, setForm] = useState<CreateContactInput>({
    nombre: "",
    email: "",
    telefono: "",
    tipo_evento: "boda",
    fecha_deseada: undefined,
    lugar: "",
    mensaje: "",
  });

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateContactInput = {
      ...form,
      telefono: form.telefono?.trim() || undefined,
      lugar: form.lugar?.trim() || undefined,
      fecha_deseada: form.fecha_deseada
        ? new Date(form.fecha_deseada)
        : undefined,
    };
    mutate(payload);
  };

  return (
    <section id="contacto" ref={sectionRef} className="contact">
      <div className="contact-inner">
        <div className={`contact-left ${visible ? "visible" : ""}`}>
          <span className="section-tag">— Contacto —</span>
          <h2 className="section-title">
            Hablemos.
            <br />
            <em>Tu evento comienza aquí.</em>
          </h2>
          <p className="section-desc">
            Cuéntanos tu idea. Nosotros la convertimos en una experiencia que
            nadie olvidará.
          </p>

          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">◎</span>
              <div>
                <span className="contact-label">Ubicación</span>
                <span className="contact-value">Cuernavaca-Morelos</span>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">◈</span>
              <div>
                <a
                  href="https://wa.me/527775102313"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-label"
                >
                  WhatsApp
                </a>
                <span className="contact-value">+52 777 510 23 13</span>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">✦</span>
              <div>
                <a
                  href="https://www.instagram.com/iparty_djs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-label"
                >
                  Instagram
                </a>
                <span className="contact-value">iparty_djs</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`contact-right ${visible ? "visible" : ""}`}>
          {isSuccess ? (
            <div className="contact-success">
              <div className="success-icon">✓</div>
              <h3>¡Mensaje enviado!</h3>
              <p>Nos pondremos en contacto contigo a la brevedad.</p>
              <button className="btn-gold" onClick={() => reset()}>
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="nombre">Nombre completo</label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="telefono">Teléfono / WhatsApp</label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    placeholder="+52 55 0000 0000"
                    value={form.telefono}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="tipoEvento">Tipo de evento</label>
                  <select
                    id="tipoEvento"
                    name="tipo_evento"
                    value={form.tipo_evento}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Selecciona...
                    </option>
                    <option value="boda">Boda</option>
                    <option value="xv_anos">XV Años</option>
                    <option value="cumpleanos">Cumpleaños</option>
                    <option value="corporativo">Evento Empresarial</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="fecha">Fecha tentativa del evento</label>
                  <input
                    id="fecha"
                    name="fecha_deseada"
                    type="date"
                    value={
                      form.fecha_deseada
                        ? new Date(form.fecha_deseada)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={handleChange}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="lugar">Lugar del evento</label>
                  <input
                    id="lugar"
                    name="lugar"
                    type="text"
                    placeholder="Salón, jardín, ciudad..."
                    value={form.lugar || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-field full">
                <label htmlFor="mensaje">Cuéntanos sobre tu evento</label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows={4}
                  placeholder="Describe tu visión, número de invitados, servicios que te interesan..."
                  value={form.mensaje}
                  onChange={handleChange}
                />
              </div>

              {isError && (
                <p
                  className="error-message"
                  style={{ color: "#ff4d4d", marginTop: "1rem" }}
                >
                  {error?.message ||
                    "Ocurrió un error al enviar el formulario."}
                </p>
              )}

              <button type="submit" className="btn-submit" disabled={isPending}>
                <span>{isPending ? "Enviando..." : "Enviar Solicitud"}</span>
                <span className="btn-arrow">→</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
