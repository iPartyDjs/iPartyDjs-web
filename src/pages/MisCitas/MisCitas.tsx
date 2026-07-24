import { useState } from "react";
import "./MisCitas.css";

type FilterType = "Todas" | "Programadas" | "Realizadas" | "Canceladas";

interface Cita {
    id: string;
    titulo: string;
    dia: string;
    mes: string;
    horaInicio: string;
    horaFin: string;
    anfitrion: string;
    status: "Programada" | "Realizada" | "Cancelada";
    nota?: string;
    link?: string;
}

const CITAS: Cita[] = [
    {
        id: "1",
        titulo: "Cita de negociación — Boda Reyes & López",
        dia: "28",
        mes: "Jun",
        horaInicio: "11:00 a.m.",
        horaFin: "12:00 p.m.",
        anfitrion: "Arturo Ramírez",
        status: "Programada",
        link: "meet.google.com/abc-xyz-1234",
    },
    {
        id: "2",
        titulo: "Cita de negociación — XV años Sofía R.",
        dia: "10",
        mes: "Jun",
        horaInicio: "10:00 a.m.",
        horaFin: "11:00 a.m.",
        anfitrion: "Arturo Ramírez",
        status: "Realizada",
        nota: "Cita concluida — evento en proceso de confirmación",
    },
    {
        id: "3",
        titulo: "Cita de negociación — Cumpleaños corporativo",
        dia: "02",
        mes: "May",
        horaInicio: "3:00 p.m.",
        horaFin: "4:00 p.m.",
        anfitrion: "Arturo Ramírez",
        status: "Cancelada",
        nota: "Cita cancelada por el administrador",
    },
];

const FILTERS: FilterType[] = [
    "Todas",
    "Programadas",
    "Realizadas",
    "Canceladas",
];

const STATUS_MAP: Record<string, string> = {
    Programada: "badge-gold",
    Realizada: "badge-gray",
    Cancelada: "badge-red",
};

const MisCitas = () => {
    const [filter, setFilter] = useState<FilterType>("Todas");

    // Filtrado limpio y tipado para Próximas
    const filteredProximas = CITAS.filter(
        (c) =>
            c.status === "Programada" &&
            (filter === "Todas" || filter === "Programadas"),
    );

    // Filtrado limpio y tipado para Historial
    const filteredHistorial = CITAS.filter((c) => {
        if (c.status === "Programada") return false;
        if (filter === "Todas") return true;
        if (filter === "Realizadas") return c.status === "Realizada";
        if (filter === "Canceladas") return c.status === "Cancelada";
        return false;
    });

    return (
        <div className="mc-layout">
            {/* ── Sidebar ── */}
            <aside className="mc-sidebar">
                <div className="mc-logo">
                    <span>iParty</span>
                    <span className="mc-logo-gold">DJs</span>
                    <div className="mc-logo-sub">Portal del cliente</div>
                </div>

                <div className="mc-nav-group">
                    <div className="mc-nav-label">Mi cuenta</div>
                    {[
                        "Dashboard",
                        "Mis solicitudes",
                        "Mis citas",
                        "Mis eventos",
                        "Mis reseñas",
                    ].map((item) => (
                        <a
                            key={item}
                            href="#"
                            className={`mc-nav-item ${item === "Mis citas" ? "active" : ""}`}
                        >
                            {item}
                        </a>
                    ))}
                </div>

                <div className="mc-nav-group">
                    <div className="mc-nav-label">Plataforma</div>
                    {["Galería", "Contacto"].map((item) => (
                        <a key={item} href="#" className="mc-nav-item">
                            {item}
                        </a>
                    ))}
                </div>

                <div className="mc-sidebar-footer">
                    <div className="mc-avatar">MR</div>
                    <div>
                        <div className="mc-user-name">Mariana Reyes</div>
                        <div className="mc-user-role">Cliente</div>
                    </div>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="mc-main">
                {/* Header */}
                <div className="mc-header">
                    <h1 className="mc-title">Mis citas</h1>
                    <p className="mc-subtitle">
                        Reuniones virtuales programadas con el equipo de iParty
                        DJs
                    </p>
                </div>

                {/* Filters */}
                <div className="mc-filters">
                    <span className="mc-filter-label">Filtrar por:</span>
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            className={`mc-filter-btn ${filter === f ? "active" : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Próximas */}
                {filteredProximas.length > 0 && (
                    <>
                        <div className="mc-section-label">Próximas</div>
                        <div className="mc-list">
                            {filteredProximas.map((cita) => (
                                <div
                                    key={cita.id}
                                    className="mc-item mc-item-proxima"
                                >
                                    <div className="mc-date-col">
                                        <span className="mc-dia">
                                            {cita.dia}
                                        </span>
                                        <span className="mc-mes">
                                            {cita.mes}
                                        </span>
                                    </div>
                                    <div className="mc-accent-bar" />
                                    <div className="mc-content">
                                        <div className="mc-cita-title">
                                            {cita.titulo}
                                        </div>
                                        <div className="mc-cita-meta">
                                            <span>
                                                {cita.horaInicio} —{" "}
                                                {cita.horaFin}
                                            </span>
                                            <span className="mc-anfitrion">
                                                {cita.anfitrion}
                                            </span>
                                        </div>
                                        {cita.link && (
                                            <a
                                                href={`https://${cita.link}`}
                                                className="mc-btn-join"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Unirse a la videollamada
                                            </a>
                                        )}
                                    </div>
                                    <span
                                        className={`mc-badge ${STATUS_MAP[cita.status]}`}
                                    >
                                        {cita.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Historial */}
                {filteredHistorial.length > 0 && (
                    <>
                        <div className="mc-section-label mc-section-label-mt">
                            Historial
                        </div>
                        <div className="mc-list">
                            {filteredHistorial.map((cita) => (
                                <div key={cita.id} className="mc-item">
                                    <div className="mc-date-col">
                                        <span className="mc-dia">
                                            {cita.dia}
                                        </span>
                                        <span className="mc-mes">
                                            {cita.mes}
                                        </span>
                                    </div>
                                    <div className="mc-content">
                                        <div className="mc-cita-title">
                                            {cita.titulo}
                                        </div>
                                        <div className="mc-cita-meta">
                                            <span>
                                                {cita.horaInicio} —{" "}
                                                {cita.horaFin}
                                            </span>
                                            <span className="mc-anfitrion">
                                                {cita.anfitrion}
                                            </span>
                                        </div>
                                        {cita.nota && (
                                            <div className="mc-nota">
                                                {cita.nota}
                                            </div>
                                        )}
                                    </div>
                                    <span
                                        className={`mc-badge ${STATUS_MAP[cita.status]}`}
                                    >
                                        {cita.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {filteredProximas.length === 0 &&
                    filteredHistorial.length === 0 && (
                        <div className="mc-empty">
                            No hay citas en esta categoría.
                        </div>
                    )}
            </main>
        </div>
    );
};

export default MisCitas;
