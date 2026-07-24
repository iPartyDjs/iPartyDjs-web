import { useState } from "react";

type Status =
    | "Todas"
    | "Pendiente"
    | "En proceso"
    | "Confirmado"
    | "Realizado"
    | "Rechazado";

interface Solicitud {
    id: string;
    tipo: string;
    fecha: string;
    lugar: string;
    enviada: string;
    status: Exclude<Status, "Todas">;
    hora?: string;
    invitados?: string;
    notas?: string;
    folio?: string;
    cita?: {
        titulo: string;
        fecha: string;
        hora: string;
        link: string;
    };
    timeline: { label: string; date: string; done: boolean }[];
}

const SOLICITUDES: Solicitud[] = [
    {
        id: "1",
        tipo: "Boda",
        fecha: "12 jul 2025",
        lugar: "Salón Premier",
        enviada: "3 jun 2025",
        status: "Confirmado",
        hora: "7:00 pm",
        invitados: "50 – 150 personas",
        notas: "Música variada: salsa, merengue, pop en español.",
        folio: "#SOL-00123",
        cita: {
            titulo: "Cita · Boda Sofía & Marco",
            fecha: "Viernes 13 de junio",
            hora: "10:00 am",
            link: "meet.google.com/abc-xyz-1234",
        },
        timeline: [
            {
                label: "Solicitud recibida",
                date: "3 jun · Admin notificado",
                done: true,
            },
            {
                label: "Cita agendada",
                date: "10 jun · 13 jun 10:00 am",
                done: true,
            },
            { label: "Cita realizada", date: "Pendiente", done: false },
            { label: "Evento confirmado", date: "12 jul 2025", done: false },
        ],
    },
    {
        id: "2",
        tipo: "Cumpleaños",
        fecha: "20 sep 2025",
        lugar: "Terraza El Lago",
        enviada: "8 jun 2025",
        status: "Pendiente",
        timeline: [
            {
                label: "Solicitud recibida",
                date: "8 jun · Admin notificado",
                done: true,
            },
            { label: "Cita agendada", date: "Pendiente", done: false },
            { label: "Cita realizada", date: "—", done: false },
            { label: "Evento confirmado", date: "—", done: false },
        ],
    },
    {
        id: "3",
        tipo: "XV años",
        fecha: "15 may 2025",
        lugar: "Salón Versalles",
        enviada: "10 abr 2025",
        status: "Rechazado",
        timeline: [
            {
                label: "Solicitud recibida",
                date: "10 abr · Admin notificado",
                done: true,
            },
            { label: "Solicitud rechazada", date: "12 abr", done: true },
        ],
    },
];

const STATUS_COLOR: Record<string, string> = {
    Confirmado: "badge-green",
    Pendiente: "badge-gold",
    Rechazado: "badge-red",
    "En proceso": "badge-blue",
    Realizado: "badge-gray",
    Programada: "badge-blue",
};

const FILTERS: Status[] = [
    "Todas",
    "Pendiente",
    "En proceso",
    "Confirmado",
    "Realizado",
    "Rechazado",
];

const MySolicitudes = () => {
    const [filter, setFilter] = useState<Status>("Todas");
    const [selected, setSelected] = useState<Solicitud>(SOLICITUDES[0]);

    const filtered = SOLICITUDES.filter(
        (s) => filter === "Todas" || s.status === filter,
    );
    const citas = SOLICITUDES.filter((s) => s.cita);

    return (
        <div className="ms-layout">
            {/* ── Sidebar ── */}
            <aside className="ms-sidebar">
                <div className="ms-logo">
                    <span className="ms-logo-p">i</span>PartyDJs
                </div>
                <nav className="ms-nav">
                    {[
                        "Inicio",
                        "Nueva solicitud",
                        "Mis solicitudes",
                        "Mis citas",
                        "Mis reseñas",
                    ].map((item) => (
                        <a
                            key={item}
                            href="#"
                            className={`ms-nav-item ${item === "Mis solicitudes" ? "active" : ""}`}
                        >
                            {item}
                        </a>
                    ))}
                </nav>
                <div className="ms-sidebar-footer">
                    <div className="ms-user">
                        <div className="ms-avatar ms-avatar-admin">AR</div>
                        <div>
                            <div className="ms-user-name">Arturo Ramírez</div>
                            <div className="ms-user-role">SuperAdmin</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="ms-main">
                {/* Header */}
                <div className="ms-topbar">
                    <div>
                        <h1 className="ms-title">Mis solicitudes y citas</h1>
                        <p className="ms-subtitle">
                            Historial completo y detalle de cada solicitud.
                        </p>
                    </div>
                    <a href="/solicitud" className="ms-btn-new">
                        Nueva solicitud
                    </a>
                </div>

                {/* Filters */}
                <div className="ms-filters">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            className={`ms-filter-btn ${filter === f ? "active" : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="ms-body">
                    {/* Left column */}
                    <div className="ms-left">
                        {/* Solicitudes */}
                        <div className="ms-section-label">
                            Solicitudes ({filtered.length})
                        </div>
                        <div className="ms-list">
                            {filtered.map((s) => (
                                <div
                                    key={s.id}
                                    className={`ms-card ${selected.id === s.id ? "ms-card-active" : ""}`}
                                    onClick={() => setSelected(s)}
                                >
                                    <div className="ms-card-top">
                                        <span className="ms-card-tipo">
                                            {s.tipo}
                                        </span>
                                        <span
                                            className={`ms-badge ${STATUS_COLOR[s.status]}`}
                                        >
                                            {s.status}
                                        </span>
                                    </div>
                                    <div className="ms-card-meta">
                                        <span>{s.fecha}</span>
                                        <span className="ms-dot">·</span>
                                        <span>{s.lugar}</span>
                                    </div>
                                    <div className="ms-card-enviada">
                                        Enviada el {s.enviada}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Citas */}
                        {citas.length > 0 && (
                            <>
                                <div className="ms-section-label ms-section-label-mt">
                                    Mis citas
                                </div>
                                <div className="ms-list">
                                    {citas.map(
                                        (s) =>
                                            s.cita && (
                                                <div
                                                    key={s.id}
                                                    className="ms-card ms-cita-card"
                                                >
                                                    <div className="ms-card-top">
                                                        <span className="ms-card-tipo">
                                                            {s.cita.titulo}
                                                        </span>
                                                        <span className="ms-badge badge-blue">
                                                            Programada
                                                        </span>
                                                    </div>
                                                    <div className="ms-card-meta">
                                                        <span>
                                                            {s.cita.fecha}
                                                        </span>
                                                        <span className="ms-dot">
                                                            ·
                                                        </span>
                                                        <span>
                                                            {s.cita.hora}
                                                        </span>
                                                    </div>
                                                    <a
                                                        href={`https://${s.cita.link}`}
                                                        className="ms-link-video"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Unirme a la videollamada
                                                    </a>
                                                </div>
                                            ),
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right panel — detail */}
                    <div className="ms-detail">
                        <div className="ms-detail-header">
                            <div>
                                <div className="ms-detail-tag">
                                    Detalle: {selected.tipo} · {selected.lugar}
                                </div>
                                <h2 className="ms-detail-title">
                                    {selected.tipo} — Sofía &amp; Marco
                                </h2>
                                {selected.folio && (
                                    <div className="ms-detail-folio">
                                        Solicitud {selected.folio} · Enviada el{" "}
                                        {selected.enviada}
                                    </div>
                                )}
                            </div>
                            <span
                                className={`ms-badge ${STATUS_COLOR[selected.status]}`}
                            >
                                {selected.status}
                            </span>
                        </div>

                        <div className="ms-detail-rows">
                            <div className="ms-detail-row">
                                <span className="ms-detail-key">
                                    Tipo de evento
                                </span>
                                <span className="ms-detail-val">
                                    {selected.tipo}
                                </span>
                            </div>
                            <div className="ms-detail-row">
                                <span className="ms-detail-key">Fecha</span>
                                <span className="ms-detail-val">
                                    {selected.fecha}
                                </span>
                            </div>
                            {selected.hora && (
                                <div className="ms-detail-row">
                                    <span className="ms-detail-key">Hora</span>
                                    <span className="ms-detail-val">
                                        {selected.hora}
                                    </span>
                                </div>
                            )}
                            <div className="ms-detail-row">
                                <span className="ms-detail-key">Lugar</span>
                                <span className="ms-detail-val">
                                    {selected.lugar}
                                </span>
                            </div>
                            {selected.invitados && (
                                <div className="ms-detail-row">
                                    <span className="ms-detail-key">
                                        Invitados
                                    </span>
                                    <span className="ms-detail-val">
                                        {selected.invitados}
                                    </span>
                                </div>
                            )}
                            {selected.notas && (
                                <div className="ms-detail-row">
                                    <span className="ms-detail-key">Notas</span>
                                    <span className="ms-detail-val ms-detail-val-notes">
                                        {selected.notas}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Cita card */}
                        {selected.cita && (
                            <div className="ms-cita-detail">
                                <div className="ms-cita-badge">
                                    Cita programada
                                </div>
                                <div className="ms-cita-info">
                                    <div className="ms-cita-fecha">
                                        {selected.cita.fecha} ·{" "}
                                        {selected.cita.hora}
                                    </div>
                                    <div className="ms-cita-sub">
                                        Videollamada para definir detalles
                                    </div>
                                    <a
                                        href={`https://${selected.cita.link}`}
                                        className="ms-cita-link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {selected.cita.link}
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="ms-timeline-label">Seguimiento</div>
                        <div className="ms-timeline">
                            {selected.timeline.map((t, i) => (
                                <div
                                    key={i}
                                    className={`ms-timeline-item ${t.done ? "done" : ""}`}
                                >
                                    <div className="ms-tl-dot" />
                                    {i < selected.timeline.length - 1 && (
                                        <div className="ms-tl-line" />
                                    )}
                                    <div className="ms-tl-content">
                                        <div className="ms-tl-label">
                                            {t.label}
                                        </div>
                                        <div className="ms-tl-date">
                                            {t.date}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MySolicitudes;
