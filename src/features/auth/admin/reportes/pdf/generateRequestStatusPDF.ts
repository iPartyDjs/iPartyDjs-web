import {
  createDoc,
  drawSectionTitle,
  drawKpiCards,
  drawTable,
  drawObservation,
  drawFooter,
  ensureSpace,
} from "./pdfPrimitives";
import {
  withPercentages,
  solicitudesTasas,
  solicitudesObservacion,
} from "../utils/statsUtils";
import type { ReportData } from "../types";

export function generateRequestStatusPDF(data: ReportData): void {
  const doc = createDoc();
  let y = 24;

  y = drawSectionTitle(doc, "Solicitudes por Estado", y);

  const conPct = withPercentages(data.solicitudesPorEstado);
  const { total, tasaAceptacion, tasaRechazo } = solicitudesTasas(
    data.solicitudesPorEstado,
  );

  y = drawKpiCards(
    doc,
    [
      { label: "Solicitudes totales", value: String(total) },
      { label: "Tasa de aceptación", value: `${tasaAceptacion}%` },
      { label: "Tasa de rechazo", value: `${tasaRechazo}%` },
    ],
    y,
  );

  y = ensureSpace(doc, y, 60);
  y = drawTable(doc, {
    head: [["Estado", "Cantidad", "Porcentaje"]],
    body: conPct.map((i) => [i.estado, String(i.cantidad), `${i.porcentaje}%`]),
    startY: y,
  });

  y = ensureSpace(doc, y, 30);
  drawObservation(doc, solicitudesObservacion(data.solicitudesPorEstado), y);

  drawFooter(doc);
  doc.save(`solicitudes-por-estado-${data.mes}-${data.anio}.pdf`);
}
