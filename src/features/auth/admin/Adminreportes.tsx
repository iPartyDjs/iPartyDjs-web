import { useEffect, useState } from "react";
import AdminPageShell from "./AdminPageShell";
import { reporteService } from "./reportes/services/reporte.service";
import {
    mapReporteMensualDTOToReportData,
    type ReportData,
} from "./reportes/types";
import ReportTabs, {
    type ReportTabKey,
} from "./reportes/components/ReportTabs";
import ReservasPorEventoPanel from "./reportes/panels/ReservasPorEventoPanel";
import SolicitudesPorEstadoPanel from "./reportes/panels/SolicitudesPorEstadoPanel";
import CalificacionesPanel from "./reportes/panels/CalificacionesPanel";
import { generateEventReportPDF } from "./reportes/pdf/generateEventReportPDF";
import { generateRequestStatusPDF } from "./reportes/pdf/generateRequestStatusPDF";
import { generateRatingsPDF } from "./reportes/pdf/generateRatingsPDF";
import { generateFullExecutiveReportPDF } from "./reportes/pdf/generateFullExecutiveReportPDF";
import "./Adminreportes.css";
import "./reportes/components/ReportTabs.css";
import "./reportes/components/ReportPanels.css";

const MESES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];

export default function AdminReportes() {
    const now = new Date();
    const [mes, setMes] = useState(now.getMonth() + 1);
    const [anio, setAnio] = useState(now.getFullYear());
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ReportTabKey>("eventos");

    useEffect(() => {
        let isMounted = true;

        async function fetchReporte() {
            try {
                setLoading(true);
                setError(null);
                const dto = await reporteService.generateMonthly(mes, anio);
                if (isMounted) {
                    setData(mapReporteMensualDTOToReportData(dto));
                }
            } catch (err: unknown) {
                if (isMounted) {
                    const errorObj = err as { message?: string };
                    setError(errorObj.message || "Error al generar el reporte");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchReporte();

        return () => {
            isMounted = false;
        };
    }, [mes, anio]);

    const rangoAnalizado = `${MESES[mes - 1]} ${anio}`;
    const fechaGeneracion = new Date().toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    return (
        <AdminPageShell topbarTitle="Reportes" navKey="reportes">
            <div className="ipdj-rep-printable">
                {/* Encabezado de marca — solo visible al imprimir/exportar */}
                <div className="ipdj-rep-print-header">
                    <span className="ipdj-rep-print-brand">
                        iParty<span>DJs</span>
                    </span>
                    <span className="ipdj-rep-print-meta">
                        Centro de reportes · Generado el {fechaGeneracion}
                    </span>
                </div>

                {/* Encabezado con selector de periodo y exportación completa */}
                <div className="ipdj-rep-header">
                    <div>
                        <h2 className="ipdj-rep-header-titulo">
                            Centro de Reportes
                        </h2>
                        <p className="ipdj-rep-header-subtitulo">
                            Reservas, solicitudes y reseñas de iPartyDJs —{" "}
                            {rangoAnalizado}
                        </p>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <select
                            className="ipdj-filter-select"
                            value={mes}
                            onChange={(e) => setMes(Number(e.target.value))}
                        >
                            {MESES.map((m, i) => (
                                <option key={m} value={i + 1}>
                                    {m}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            className="ipdj-filter-select"
                            value={anio}
                            onChange={(e) => setAnio(Number(e.target.value))}
                            style={{ width: 90 }}
                        />
                        <button
                            type="button"
                            className="ipdj-rep-btn-pdf"
                            onClick={() =>
                                data && generateFullExecutiveReportPDF(data)
                            }
                            disabled={!data}
                        >
                            <span className="ipdj-rep-btn-pdf-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    width={14}
                                    height={14}
                                >
                                    <path d="M12 3v12" />
                                    <path d="M7 10l5 5 5-5" />
                                    <path d="M4 19h16" />
                                </svg>
                            </span>
                            Exportar Reporte Completo
                        </button>
                    </div>
                </div>

                {error && (
                    <div
                        className="ipdj-error-banner"
                        style={{ color: "red", marginBottom: "1rem" }}
                    >
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="ipdj-loading">Generando reporte...</div>
                )}

                {!loading && data && (
                    <>
                        <ReportTabs
                            active={activeTab}
                            onChange={setActiveTab}
                        />

                        {activeTab === "eventos" && (
                            <ReservasPorEventoPanel
                                data={data}
                                onExport={() => generateEventReportPDF(data)}
                            />
                        )}
                        {activeTab === "solicitudes" && (
                            <SolicitudesPorEstadoPanel
                                data={data}
                                onExport={() => generateRequestStatusPDF(data)}
                            />
                        )}
                        {activeTab === "resenias" && (
                            <CalificacionesPanel
                                data={data}
                                onExport={() => generateRatingsPDF(data)}
                            />
                        )}
                    </>
                )}
            </div>
        </AdminPageShell>
    );
}
