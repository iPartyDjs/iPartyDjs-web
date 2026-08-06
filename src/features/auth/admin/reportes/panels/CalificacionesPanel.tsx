import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ReportData, EstadoModeracionResenia } from "../types";
import { withPercentages, reseniasObservacion } from "../utils/statsUtils";
import KpiCard from "../components/KpiCard";

const COLOR_GRAY = "#8a8a8a";
const COLOR_GRID = "rgba(201, 168, 76, 0.12)";

const COLORES_MODERACION: Record<EstadoModeracionResenia, string> = {
  Pendientes: "#c9a84c",
  Aprobadas: "#6fd196",
  Rechazadas: "#e08787",
};

interface CalificacionesPanelProps {
  data: ReportData;
  onExport: () => void;
}

export default function CalificacionesPanel({
  data,
  onExport,
}: CalificacionesPanelProps) {
  const conPct = withPercentages(data.reseniasPorModeracion);
  const promedioTxt =
    data.kpis.calificacionPromedio !== null
      ? `${data.kpis.calificacionPromedio.toFixed(1)} ★`
      : "—";

  return (
    <div className="ipdj-rep-tabpanel">
      <div className="ipdj-rep-panel-actions">
        <h3 className="ipdj-rep-panel-titulo">
          Distribución de calificaciones
        </h3>
        <button type="button" className="ipdj-rep-btn-pdf" onClick={onExport}>
          Exportar Reporte Actual
        </button>
      </div>

      <div className="ipdj-rep-kpis" style={{ marginBottom: 16 }}>
        <KpiCard label="Total de reseñas" valor={data.totalResenias} />
        <KpiCard label="Calificación promedio" valor={promedioTxt} destacado />
      </div>

      <div className="ipdj-rep-panel">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data.reseniasPorModeracion}>
            <CartesianGrid stroke={COLOR_GRID} vertical={false} />
            <XAxis
              dataKey="estado"
              stroke={COLOR_GRAY}
              tick={{ fontSize: 12, fontFamily: "Montserrat, sans-serif" }}
              axisLine={{ stroke: COLOR_GRID }}
              tickLine={false}
            />
            <YAxis
              stroke={COLOR_GRAY}
              tick={{ fontSize: 11, fontFamily: "Montserrat, sans-serif" }}
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
            />
            <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
              {data.reseniasPorModeracion.map((entrada) => (
                <Cell
                  key={entrada.estado}
                  fill={COLORES_MODERACION[entrada.estado]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="ipdj-rep-observacion">
        {reseniasObservacion(
          data.reseniasPorModeracion,
          data.kpis.calificacionPromedio,
        )}
      </p>

      <p className="ipdj-rep-nota">
        ⚠️ El backend actual no expone un desglose por número de estrellas
        (1★-5★), solo el promedio general y el estado de moderación de cada
        reseña (pendiente / aprobada / rechazada). Este panel se actualizará
        cuando exista ese endpoint.
      </p>

      <table className="ipdj-rep-mini-table">
        <thead>
          <tr>
            <th>Estado de moderación</th>
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
