import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import AdminPageShell from "./AdminPageShell";
import "./Adminreportes.css";

/* ------------------------------------------------------------------ */
/* Paleta usada dentro de los charts (Recharts no lee CSS vars)        */
/* ------------------------------------------------------------------ */

const COLOR_GOLD_SOFT = "#8f7a3a";
const COLOR_GRAY = "#8a8a8a";
const COLOR_GRID = "rgba(201, 168, 76, 0.12)";

const COLORES_ESTADO = {
  pendiente: "#c9a84c",
  en_revision: "#85acdf",
  aceptada: "#6fd196",
  rechazada: "#e08787",
};

const COLORES_EVENTO = ["#c9a84c", "#8f7a3a", "#6fd196", "#85acdf", "#e08787"];

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

interface PuntoTipoEvento {
  tipo: string;
  reservas: number;
}

interface PuntoEstadoSolicitud {
  estado: string;
  valor: number;
  key: keyof typeof COLORES_ESTADO;
}

interface PuntoCalificacion {
  calificacion: string;
  cantidad: number;
}

/* ------------------------------------------------------------------ */
/* Datos de ejemplo (reemplazar por fetch/React Query en integración)  */
/* ------------------------------------------------------------------ */

const RESERVAS_POR_TIPO: PuntoTipoEvento[] = [
  { tipo: "Boda", reservas: 18 },
  { tipo: "XV Años", reservas: 14 },
  { tipo: "Corporativo", reservas: 9 },
  { tipo: "Cumpleaños", reservas: 11 },
  { tipo: "Otro", reservas: 4 },
];

const SOLICITUDES_POR_ESTADO: PuntoEstadoSolicitud[] = [
  { estado: "Pendiente", valor: 12, key: "pendiente" },
  { estado: "En revisión", valor: 6, key: "en_revision" },
  { estado: "Aceptada", valor: 27, key: "aceptada" },
  { estado: "Rechazada", valor: 8, key: "rechazada" },
];

const RESENAS_POR_CALIFICACION: PuntoCalificacion[] = [
  { calificacion: "1★", cantidad: 3 },
  { calificacion: "2★", cantidad: 4 },
  { calificacion: "3★", cantidad: 9 },
  { calificacion: "4★", cantidad: 21 },
  { calificacion: "5★", cantidad: 38 },
];

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function AdminReportes() {
  const kpis = useMemo(() => {
    const totalReservas = RESERVAS_POR_TIPO.reduce((a, p) => a + p.reservas, 0);

    const totalSolicitudes = SOLICITUDES_POR_ESTADO.reduce(
      (a, p) => a + p.valor,
      0,
    );
    const aceptadas =
      SOLICITUDES_POR_ESTADO.find((p) => p.key === "aceptada")?.valor ?? 0;
    const tasaConversion =
      totalSolicitudes === 0 ? 0 : (aceptadas / totalSolicitudes) * 100;

    const totalResenas = RESENAS_POR_CALIFICACION.reduce(
      (a, p) => a + p.cantidad,
      0,
    );
    const sumaCalificaciones = RESENAS_POR_CALIFICACION.reduce(
      (a, p) => a + p.cantidad * Number(p.calificacion.charAt(0)),
      0,
    );
    const calificacionPromedio =
      totalResenas === 0 ? 0 : sumaCalificaciones / totalResenas;

    return {
      totalReservas,
      totalSolicitudes,
      tasaConversion,
      totalResenas,
      calificacionPromedio,
    };
  }, []);

  const fechaGeneracion = new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <AdminPageShell topbarTitle="Reportes" key="reportes">
      <div className="ipdj-rep-printable">
        {/* Encabezado de marca — solo visible al imprimir/exportar */}
        <div className="ipdj-rep-print-header">
          <span className="ipdj-rep-print-brand">
            iParty<span>DJs</span>
          </span>
          <span className="ipdj-rep-print-meta">
            Reporte de administración · Generado el {fechaGeneracion}
          </span>
        </div>

        {/* Encabezado con acción de exportar */}
        <div className="ipdj-rep-header">
          <div>
            <h2 className="ipdj-rep-header-titulo">Resumen general</h2>
            <p className="ipdj-rep-header-subtitulo">
              Reservas, solicitudes y reseñas de iPartyDJs
            </p>
          </div>
          <button
            type="button"
            className="ipdj-rep-btn-pdf"
            onClick={() => window.print()}
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
            Exportar a PDF
          </button>
        </div>

        {/* KPIs */}
        <div className="ipdj-rep-kpis">
          <KpiCard label="Reservas confirmadas" valor={kpis.totalReservas} />
          <KpiCard label="Solicitudes totales" valor={kpis.totalSolicitudes} />
          <KpiCard
            label="Tasa de conversión"
            valor={`${kpis.tasaConversion.toFixed(0)}%`}
            destacado
          />
          <KpiCard
            label="Calificación promedio"
            valor={`${kpis.calificacionPromedio.toFixed(1)} ★`}
          />
        </div>

        <div className="ipdj-rep-grid-2">
          {/* Reservas por tipo de evento */}
          <div className="ipdj-rep-panel">
            <h3 className="ipdj-rep-panel-titulo">
              Reservas por tipo de evento
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={RESERVAS_POR_TIPO}>
                <CartesianGrid stroke={COLOR_GRID} vertical={false} />
                <XAxis
                  dataKey="tipo"
                  stroke={COLOR_GRAY}
                  tick={{
                    fontSize: 11,
                    fontFamily: "Montserrat, sans-serif",
                  }}
                  axisLine={{ stroke: COLOR_GRID }}
                  tickLine={false}
                />
                <YAxis
                  stroke={COLOR_GRAY}
                  tick={{
                    fontSize: 11,
                    fontFamily: "Montserrat, sans-serif",
                  }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a1a",
                    border: "1px solid rgba(201,168,76,0.35)",
                    borderRadius: 8,
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#f2f2f2" }}
                />
                <Bar
                  dataKey="reservas"
                  fill={COLOR_GOLD_SOFT}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribución de solicitudes */}
          <div className="ipdj-rep-panel">
            <h3 className="ipdj-rep-panel-titulo">Solicitudes por estado</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={SOLICITUDES_POR_ESTADO}
                  dataKey="valor"
                  nameKey="estado"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {SOLICITUDES_POR_ESTADO.map((entrada) => (
                    <Cell
                      key={entrada.key}
                      fill={COLORES_ESTADO[entrada.key]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1a1a1a",
                    border: "1px solid rgba(201,168,76,0.35)",
                    borderRadius: 8,
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 12,
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 11,
                    color: COLOR_GRAY,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución de calificaciones de reseñas */}
        <div className="ipdj-rep-panel">
          <h3 className="ipdj-rep-panel-titulo">
            Distribución de calificaciones
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={RESENAS_POR_CALIFICACION}>
              <CartesianGrid stroke={COLOR_GRID} vertical={false} />
              <XAxis
                dataKey="calificacion"
                stroke={COLOR_GRAY}
                tick={{
                  fontSize: 12,
                  fontFamily: "Montserrat, sans-serif",
                }}
                axisLine={{ stroke: COLOR_GRID }}
                tickLine={false}
              />
              <YAxis
                stroke={COLOR_GRAY}
                tick={{
                  fontSize: 11,
                  fontFamily: "Montserrat, sans-serif",
                }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1a1a",
                  border: "1px solid rgba(201,168,76,0.35)",
                  borderRadius: 8,
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 12,
                }}
                labelStyle={{ color: "#f2f2f2" }}
                formatter={(value: number) => [value ?? 0, "Reseñas"]}
              />
              <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                {RESENAS_POR_CALIFICACION.map((entrada) => (
                  <Cell
                    key={entrada.calificacion}
                    fill={
                      entrada.calificacion === "1★" ||
                      entrada.calificacion === "2★"
                        ? "#e08787"
                        : entrada.calificacion === "3★"
                          ? "#c9a84c"
                          : "#6fd196"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminPageShell>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponentes                                                      */
/* ------------------------------------------------------------------ */

function KpiCard({
  label,
  valor,
  destacado,
}: {
  label: string;
  valor: string | number;
  destacado?: boolean;
}) {
  return (
    <div className={"ipdj-stat-card" + (destacado ? " destacado" : "")}>
      <span className="ipdj-stat-valor">{valor}</span>
      <span className="ipdj-stat-label">{label}</span>
    </div>
  );
}

/* Colores de estado exportados por si RESERVAS_POR_TIPO necesita
   reutilizar la misma paleta en otra pantalla (p. ej. Solicitudes). */
export { COLORES_EVENTO };
