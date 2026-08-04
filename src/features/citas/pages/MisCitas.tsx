import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import type { CitaDTO } from "@ipartydjs/shared";
import { useMisSolicitudes } from "@/features/solicitudes/hooks/useSolicitudes";
import { citaService } from "@/features/citas/services/cita.service";

type FilterType = "Todas" | "Programadas" | "Realizadas" | "Canceladas";

interface CitaEnriquecida extends CitaDTO {
    tituloSolicitud: string;
}

const FILTERS: FilterType[] = [
    "Todas",
    "Programadas",
    "Realizadas",
    "Canceladas",
];

const STATUS_MAP: Record<CitaDTO["estado"], string> = {
    programada: "badge-gold",
    realizada: "badge-gray",
    cancelada: "badge-red",
};

const STATUS_LABEL: Record<CitaDTO["estado"], string> = {
    programada: "Programada",
    realizada: "Realizada",
    cancelada: "Cancelada",
};

const TIPO_EVENTO_LABEL: Record<string, string> = {
    boda: "Boda",
    xv_anos: "XV años",
    cumpleanos: "Cumpleaños",
    corporativo: "Corporativo",
    otro: "Evento",
};

function formatDia(iso: string): string {
    return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit" });
}

function formatMes(iso: string): string {
    const mes = new Date(iso).toLocaleDateString("es-MX", { month: "short" });
    return mes.charAt(0).toUpperCase() + mes.slice(1).replace(".", "");
}

function formatHora(iso: string): string {
    return new Date(iso).toLocaleTimeString("es-MX", {
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function MisCitas() {
    const [filter, setFilter] = useState<FilterType>("Todas");
    const { data: solicitudes, isLoading: loadingSolicitudes } =
        useMisSolicitudes();

    const solicitudIds = solicitudes?.map((s) => s.id_solicitud) ?? [];

    // Mismo queryKey que useCitasBySolicitud (['citas','solicitud', id]) para
    // compartir caché e invalidación con el resto del módulo.
    const citasQueries = useQueries({
        queries: solicitudIds.map((id) => ({
            queryKey: ["citas", "solicitud", id],
            queryFn: () => citaService.getBySolicitud(id),
            enabled: Boolean(id),
        })),
    });

    const loadingCitas = citasQueries.some((q) => q.isLoading);

    const citasEnriquecidas = useMemo<CitaEnriquecida[]>(() => {
        if (!solicitudes) return [];
        const resultado: CitaEnriquecida[] = [];
        solicitudes.forEach((solicitud, index) => {
            const citas = citasQueries[index]?.data ?? [];
            const label =
                TIPO_EVENTO_LABEL[solicitud.tipo_evento] ??
                solicitud.tipo_evento;
            citas.forEach((cita) => {
                resultado.push({
                    ...cita,
                    tituloSolicitud: `Cita de negociación — ${label}`,
                });
            });
        });
        return resultado;
    }, [solicitudes, citasQueries]);

    const filteredProximas = citasEnriquecidas.filter(
        (c) =>
            c.estado === "programada" &&
            (filter === "Todas" || filter === "Programadas"),
    );

    const filteredHistorial = citasEnriquecidas.filter((c) => {
        if (c.estado === "programada") return false;
        if (filter === "Todas") return true;
        if (filter === "Realizadas") return c.estado === "realizada";
        if (filter === "Canceladas") return c.estado === "cancelada";
        return false;
    });

    const isLoading = loadingSolicitudes || loadingCitas;

    return (
        <div className="mc-layout">
            <main className="mc-main">
                <div className="mc-header">
                    <h1>Mis citas</h1>
                    <p className="mc-subtitle">
                        Reuniones virtuales programadas con el equipo de iParty
                        DJs
                    </p>
                </div>

                <div className="mc-filters">
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

                {isLoading && <p>Cargando citas...</p>}

                {!isLoading && filteredProximas.length > 0 && (
                    <>
                        <div className="mc-section-label">Próximas</div>
                        <div className="mc-list">
                            {filteredProximas.map((cita) => (
                                <div
                                    key={cita.id_cita}
                                    className="ms-card mc-item"
                                >
                                    <div className="mc-date-col">
                                        <span className="mc-dia">
                                            {formatDia(cita.fecha_hora)}
                                        </span>
                                        <span className="mc-mes">
                                            {formatMes(cita.fecha_hora)}
                                        </span>
                                    </div>
                                    <div className="mc-accent-bar" />
                                    <div className="mc-content">
                                        <div className="mc-cita-title">
                                            {cita.tituloSolicitud}
                                        </div>
                                        <div className="mc-cita-meta">
                                            <span>
                                                {formatHora(cita.fecha_hora)}
                                            </span>
                                        </div>
                                        <a
                                            href={cita.enlace_videollamada}
                                            className="mc-btn-join"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Unirse a la videollamada
                                        </a>
                                    </div>
                                    <span
                                        className={`mc-badge ${STATUS_MAP[cita.estado]}`}
                                    >
                                        {STATUS_LABEL[cita.estado]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!isLoading && filteredHistorial.length > 0 && (
                    <>
                        <div className="mc-section-label mc-section-label-mt">
                            Historial
                        </div>
                        <div className="mc-list">
                            {filteredHistorial.map((cita) => (
                                <div key={cita.id_cita} className="mc-item">
                                    <div className="mc-date-col">
                                        <span className="mc-dia">
                                            {formatDia(cita.fecha_hora)}
                                        </span>
                                        <span className="mc-mes">
                                            {formatMes(cita.fecha_hora)}
                                        </span>
                                    </div>
                                    <div className="mc-content">
                                        <div className="mc-cita-title">
                                            {cita.tituloSolicitud}
                                        </div>
                                        <div className="mc-cita-meta">
                                            <span>
                                                {formatHora(cita.fecha_hora)}
                                            </span>
                                        </div>
                                        {cita.observaciones && (
                                            <div className="mc-nota">
                                                {cita.observaciones}
                                            </div>
                                        )}
                                    </div>
                                    <span
                                        className={`mc-badge ${STATUS_MAP[cita.estado]}`}
                                    >
                                        {STATUS_LABEL[cita.estado]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!isLoading &&
                    filteredProximas.length === 0 &&
                    filteredHistorial.length === 0 && (
                        <div className="mc-empty">
                            No hay citas en esta categoría.
                        </div>
                    )}
            </main>
        </div>
    );
}
