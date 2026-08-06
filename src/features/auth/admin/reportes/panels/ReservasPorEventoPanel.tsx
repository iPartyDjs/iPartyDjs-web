import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ReportData } from "../types";
import {
  withPercentages,
  topAndBottom,
  eventosObservacion,
} from "../utils/statsUtils";
import KpiCard from "../components/KpiCard";

const COLOR_GOLD_SOFT = "#8f7a3a";
const COLOR_GRAY = "#8a8a8a";
const COLOR_GRID = "rgba(201, 168, 76, 0.12)";

interface ReservasPorEventoPanelProps {
  data: ReportData;
  onExport: () => void;
}

export default function ReservasPorEventoPanel({
  data,
  onExport,
}: ReservasPorEventoPanelProps) {
  const conPct = withPercentages(data.reservasPorTipo);
  const { top, bottom } = topAndBottom(data.reservasPorTipo);
  const total = conPct.reduce((a, i) => a + i.cantidad, 0);

  return (
    <div className="ipdj-rep-tabpanel">
      <div className="ipdj-rep-panel-actions">
        <h3 className="ipdj-rep-panel-titulo">Reservas por tipo de evento</h3>
        <button type="button" className="ipdj-rep-btn-pdf" onClick={onExport}>
          Exportar Reporte Actual
        </button>
      </div>

      <div className="ipdj-rep-kpis" style={{ marginBottom: 16 }}>
        <KpiCard label="Total de reservas" valor={total} />
        <KpiCard label="Más solicitado" valor={top?.tipo ?? "—"} destacado />
        <KpiCard label="Menos solicitado" valor={bottom?.tipo ?? "—"} />
      </div>

      <div className="ipdj-rep-panel">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={conPct}>
            <CartesianGrid stroke={COLOR_GRID} vertical={false} />
            <XAxis
              dataKey="tipo"
              stroke={COLOR_GRAY}
              tick={{ fontSize: 11, fontFamily: "Montserrat, sans-serif" }}
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
              labelStyle={{ color: "#f2f2f2" }}
            />
            <Bar
              dataKey="cantidad"
              fill={COLOR_GOLD_SOFT}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="ipdj-rep-observacion">
        {eventosObservacion(data.reservasPorTipo)}
      </p>
    </div>
  );
}
