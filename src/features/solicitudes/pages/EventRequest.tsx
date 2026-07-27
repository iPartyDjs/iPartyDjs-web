import { useState } from "react";

const TIPOS_EVENTO = [
    "Boda",
    "XV años",
    "Cumpleaños",
    "Empresarial",
    "Graduación",
    "Otro",
];

const STEPS = [
    "Tipo de evento",
    "Detalles",
    "Información adicional",
    "Confirmación",
];

interface FormData {
    tipo: string;
    fecha: string;
    hora: string;
    lugar: string;
    invitados: string;
    info: string;
}

const EventRequest = () => {
    const [step, setStep] = useState(1);
    const [sent, setSent] = useState(false);
    const [form, setForm] = useState<FormData>({
        tipo: "Boda",
        fecha: "12 / 07 / 2025",
        hora: "07:00",
        lugar: "Salón Premier, Cuernavaca, Morelos",
        invitados: "50 – 150",
        info: "",
    });

    const handleChange = (field: keyof FormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleContinue = () => {
        if (step < 4) setStep(step + 1);
        else setSent(true);
    };

    return (
        <div className="er-layout">
            {/* ── Main ── */}
            <main className="">
                {/* Header */}
                <div className="er-header">
                    <span className="er-eyebrow">SOLICITUD DE EVENTO</span>
                    <h1 className="er-title">
                        ¿Qué tipo de evento tienes en mente?
                    </h1>
                </div>

                {/* Stepper */}
                <div className="er-stepper">
                    {STEPS.map((label, i) => (
                        <div
                            key={label}
                            className={`er-step ${step === i + 1 ? "active" : ""} ${step > i + 1 ? "done" : ""}`}
                        >
                            <div className="er-step-circle">{i + 1}</div>
                            <span className="er-step-label">{label}</span>
                            {i < STEPS.length - 1 && (
                                <div className="er-step-line" />
                            )}
                        </div>
                    ))}
                </div>

                <div className="er-body">
                    {/* Form card */}
                    <div className="er-card">
                        {!sent ? (
                            <>
                                <div className="er-card-header">
                                    <h2 className="er-card-title">
                                        Detalles del evento
                                    </h2>
                                    <p className="er-card-sub">
                                        Completa la información básica. Podrás
                                        dar más detalles en la videollamada.
                                    </p>
                                </div>

                                {/* Tipo de evento */}
                                <div className="er-field">
                                    <label className="er-label">
                                        Tipo de evento{" "}
                                        <span className="er-req">*</span>
                                    </label>
                                    <div className="er-type-grid">
                                        {TIPOS_EVENTO.map((tipo) => (
                                            <button
                                                key={tipo}
                                                className={`er-type-btn ${form.tipo === tipo ? "selected" : ""}`}
                                                onClick={() =>
                                                    handleChange("tipo", tipo)
                                                }
                                            >
                                                {tipo}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Fecha y Hora */}
                                <div className="er-row">
                                    <div className="er-field">
                                        <label className="er-label">
                                            Fecha del evento{" "}
                                            <span className="er-req">*</span>
                                        </label>
                                        <input
                                            className="er-input"
                                            type="text"
                                            placeholder="DD / MM / AAAA"
                                            value={form.fecha}
                                            onChange={(e) =>
                                                handleChange(
                                                    "fecha",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="er-field">
                                        <label className="er-label">
                                            Hora aproximada
                                        </label>
                                        <div className="er-time-row">
                                            <input
                                                className="er-input er-time-input"
                                                type="time"
                                                value={form.hora}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "hora",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <span className="er-time-suffix">
                                                p.m.
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Lugar */}
                                <div className="er-field">
                                    <label className="er-label">
                                        Lugar del evento{" "}
                                        <span className="er-req">*</span>
                                    </label>
                                    <input
                                        className="er-input"
                                        type="text"
                                        placeholder="Salón, jardín, ciudad..."
                                        value={form.lugar}
                                        onChange={(e) =>
                                            handleChange(
                                                "lugar",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                {/* Invitados */}
                                <div className="er-field">
                                    <label className="er-label">
                                        Número aproximado de invitados
                                    </label>
                                    <input
                                        className="er-input"
                                        type="text"
                                        placeholder="Ej. 50 – 150"
                                        value={form.invitados}
                                        onChange={(e) =>
                                            handleChange(
                                                "invitados",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                {/* Info adicional */}
                                <div className="er-field">
                                    <label className="er-label">
                                        Información adicional
                                    </label>
                                    <textarea
                                        className="er-input er-textarea"
                                        rows={4}
                                        placeholder="Cuéntanos más sobre tu evento..."
                                        value={form.info}
                                        onChange={(e) =>
                                            handleChange("info", e.target.value)
                                        }
                                    />
                                </div>

                                {/* Actions */}
                                <div className="er-actions">
                                    <button
                                        className="er-btn-back"
                                        onClick={() =>
                                            setStep(Math.max(1, step - 1))
                                        }
                                        disabled={step === 1}
                                    >
                                        ← Atrás
                                    </button>
                                    <button
                                        className="er-btn-continue"
                                        onClick={handleContinue}
                                    >
                                        {step === 4
                                            ? "Enviar solicitud"
                                            : "Continuar →"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="er-success">
                                <div className="er-success-icon">✓</div>
                                <h3>¡Solicitud enviada con éxito!</h3>
                                <p>
                                    Recibirás una notificación cuando el equipo
                                    de iParty DJs programe tu cita de
                                    seguimiento.
                                </p>
                                <button
                                    className="er-btn-continue"
                                    onClick={() => {
                                        setSent(false);
                                        setStep(1);
                                    }}
                                >
                                    Ver mis solicitudes
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Summary panel */}
                    <aside className="er-summary">
                        <h3 className="er-summary-title">
                            Resumen de solicitud
                        </h3>
                        <div className="er-summary-list">
                            <div className="er-summary-row">
                                <span className="er-summary-key">Tipo</span>
                                <span className="er-summary-val">
                                    {form.tipo || "—"}
                                </span>
                            </div>
                            <div className="er-summary-row">
                                <span className="er-summary-key">Fecha</span>
                                <span className="er-summary-val">
                                    {form.fecha || "—"}
                                </span>
                            </div>
                            <div className="er-summary-row">
                                <span className="er-summary-key">Hora</span>
                                <span className="er-summary-val">
                                    {form.hora ? `${form.hora} pm` : "—"}
                                </span>
                            </div>
                            <div className="er-summary-row">
                                <span className="er-summary-key">Lugar</span>
                                <span className="er-summary-val er-summary-val-right">
                                    {form.lugar || "—"}
                                </span>
                            </div>
                            <div className="er-summary-row">
                                <span className="er-summary-key">
                                    Invitados
                                </span>
                                <span className="er-summary-val">
                                    {form.invitados || "—"}
                                </span>
                            </div>
                            <div className="er-summary-row">
                                <span className="er-summary-key">Estado</span>
                                <span className="er-badge">Pendiente</span>
                            </div>
                        </div>
                        <p className="er-summary-note">
                            Al enviar tu solicitud, el equipo de iParty DJs la
                            revisará y te agendará una cita virtual para definir
                            todos los detalles.
                        </p>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default EventRequest;
