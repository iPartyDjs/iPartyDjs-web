import { useProfile } from "@/features/profile/hooks/useProfile";
import React from "react";

export const ClientDashboard: React.FC = () => {
    const { data: user, isLoading } = useProfile();

    if (isLoading) {
        return <div className="profile-page">Cargando perfil...</div>;
    }

    return (
        <div className="dashboard-container">
            {/* ── CONTENIDO PRINCIPAL ── */}
            <main className="main-content">
                <header className="dashboard-header">
                    <h1 className="welcome-title">Hola, {user?.nombre} 👋</h1>
                    <p className="welcome-subtitle">
                        {new Date().toLocaleDateString()}· Tu próxima cita es en
                        3 días
                    </p>
                </header>

                {/* Métrica / Kpis superiores */}
                <section className="kpi-grid">
                    <div className="kpi-card">
                        <span className="kpi-label">Solicitudes</span>
                        <span className="kpi-value">2</span>
                        <span className="kpi-subtext">
                            1 pendiente · 1 en proceso
                        </span>
                    </div>
                    <div className="kpi-card">
                        <span className="kpi-label">Próxima cita</span>
                        <span className="kpi-value highlight">13 jun</span>
                        <span className="kpi-subtext">
                            10:00 am · Videollamada
                        </span>
                    </div>
                    <div className="kpi-card">
                        <span className="kpi-label">Mi evento</span>
                        <span className="kpi-status-text status-confirmed">
                            Confirmado
                        </span>
                        <span className="kpi-subtext">
                            Boda · 12 de julio de 2025
                        </span>
                    </div>
                    <div className="kpi-card">
                        <span className="kpi-label">Reseña</span>
                        <span className="kpi-status-text status-pending">
                            Pendiente
                        </span>
                        <span className="kpi-subtext">
                            Disponible tras el evento
                        </span>
                    </div>
                </section>

                {/* Sección de Bloques principales (Cita y Estado) */}
                <section className="content-grid">
                    {/* Tarjeta de Próxima Cita */}
                    <div className="dashboard-card main-appointment-card">
                        <div className="card-header">
                            <h2>Próxima cita</h2>
                            <span className="badge-status">Programada</span>
                        </div>
                        <div className="appointment-body">
                            <h3 className="appointment-date">
                                Viernes 13 jun · 10:00 am
                            </h3>
                            <p className="appointment-desc">
                                Videollamada para definir detalles de la boda
                            </p>

                            <div className="meet-link-container">
                                <label>Enlace Meet disponible</label>
                                <input
                                    type="text"
                                    readOnly
                                    value="meet.google.com/abc-xyz-123"
                                    className="meet-input"
                                />
                            </div>
                            <button className="btn-primary-gold">
                                Unirme a la videollamada
                            </button>
                        </div>
                    </div>

                    {/* Tarjeta de Estado del Evento */}
                    <div className="dashboard-card event-status-card">
                        <div className="card-header">
                            <h2>Estado de mi evento</h2>
                            <a href="#ver-detalle" className="link-detail">
                                Ver detalle →
                            </a>
                        </div>

                        <div className="event-details-list">
                            <div className="status-badge-row">
                                <span className="badge-pill-green">
                                    ● Confirmado
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Tipo</span>
                                <span className="detail-value">Boda</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">
                                    Fecha del evento
                                </span>
                                <span className="detail-value">
                                    12 de julio - 2025
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Lugar</span>
                                <span className="detail-value">
                                    Salón Premier, Cuernavaca
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Cliente</span>
                                <span className="detail-value">
                                    María González
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Progreso</span>
                                <div className="progress-bar-container">
                                    <div className="progress-segment active"></div>
                                    <div className="progress-segment active"></div>
                                    <div className="progress-segment"></div>
                                </div>
                            </div>

                            <hr className="card-divider" />

                            {/* Línea de tiempo */}
                            <div className="timeline-section">
                                <h3>Línea de tiempo</h3>
                                <div className="timeline">
                                    <div className="timeline-item done">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-info">
                                            <p className="timeline-title">
                                                Solicitud enviada
                                            </p>
                                            <span className="timeline-date">
                                                3 jun 2025
                                            </span>
                                        </div>
                                    </div>
                                    <div className="timeline-item done">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-info">
                                            <p className="timeline-title">
                                                Cita programada
                                            </p>
                                            <span className="timeline-date">
                                                10 jun 2025
                                            </span>
                                        </div>
                                    </div>
                                    <div className="timeline-item pending">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-info">
                                            <p className="timeline-title">
                                                Cita realizada
                                            </p>
                                            <span className="timeline-date">
                                                Pendiente
                                            </span>
                                        </div>
                                    </div>
                                    <div className="timeline-item future">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-info">
                                            <p className="timeline-title">
                                                Evento realizado
                                            </p>
                                            <span className="timeline-date">
                                                12 jul 2025
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};
