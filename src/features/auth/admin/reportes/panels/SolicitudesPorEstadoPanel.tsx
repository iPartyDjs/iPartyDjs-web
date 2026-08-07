import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ReportData, EstadoSolicitudReporte } from "../types";
import {
  withPercentages,
  solicitudesTasas,
  solicitudesObservacion,
} from "../utils/statsUtils";
import KpiCard from "../components/KpiCard";

const COLOR_GRAY = "#8a8a8a";

const COLORES_ESTADO: Record<EstadoSolicitudReporte, string> = {
  Aprobadas: "#6fd196",
  Rechazadas: "#e08787",
  Pendientes: "#c9a84c",
};

interface SolicitudesPorEstadoPanelProps {
  data: ReportData;
  onExport: () => void;
}

export default function SolicitudesPorEstadoPanel({
  data,
  onExport,
}: SolicitudesPorEstadoPanelProps) {
  const conPct = withPercentages(data.solicitudesPorEstado);
  const { total, tasaAceptacion, tasaRechazo } = solicitudesTasas(
    data.solicitudesPorEstado,
  );

  return (
    <div className="ipdj-rep-tabpanel">
      <div className="ipdj-rep-panel-actions">
        <h3 className="ipdj-rep-panel-titulo">Solicitudes por estado</h3>
        <button type="button" className="ipdj-rep-btn-pdf" onClick={onExport}>
          Exportar Reporte Actual
        </button>
      </div>

      <div className="ipdj-rep-kpis" style={{ marginBottom: 16 }}>
        <KpiCard label="Solicitudes totales" valor={total} />
        <KpiCard
          label="Tasa de aceptación"
          valor={`${tasaAceptacion}%`}
          destacado
        />
        <KpiCard label="Tasa de rechazo" valor={`${tasaRechazo}%`} />
      </div>

      <div className="ipdj-rep-panel">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data.solicitudesPorEstado}
              dataKey="cantidad"
              nameKey="estado"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {data.solicitudesPorEstado.map((entrada) => (
                <Cell
                  key={entrada.estado}
                  fill={COLORES_ESTADO[entrada.estado]}
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

      <p className="ipdj-rep-observacion">
        {solicitudesObservacion(data.solicitudesPorEstado)}
      </p>

      {/* Tabla de apoyo visual — la misma data que va al PDF */}
      <table className="ipdj-rep-mini-table">
        <thead>
          <tr>
            <th>Estado</th>
            <th>Cantidad</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {conPct.map((i) => (
            <tr key={i.estado}>
              <td>{i.estado}</td>
              <td>{i.cantidad}</td>
              <td>{i.porcentaje}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
