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
  topAndBottom,
  eventosObservacion,
} from "../utils/statsUtils";
import type { ReportData } from "../types";

export function generateEventReportPDF(data: ReportData): void {
  const doc = createDoc();
  let y = 24;

  y = drawSectionTitle(doc, "Reservas por Tipo de Evento", y);

  const conPct = withPercentages(data.reservasPorTipo);
  const { top, bottom } = topAndBottom(data.reservasPorTipo);
  const total = conPct.reduce((a, i) => a + i.cantidad, 0);

  y = drawKpiCards(
    doc,
    [
      { label: "Total de reservas", value: String(total) },
      { label: "Evento más solicitado", value: top?.tipo ?? "—" },
      { label: "Evento menos solicitado", value: bottom?.tipo ?? "—" },
    ],
    y,
  );

  y = ensureSpace(doc, y, 60);
  y = drawTable(doc, {
    head: [["Tipo de evento", "Cantidad", "Porcentaje"]],
    body: conPct.map((i) => [i.tipo, String(i.cantidad), `${i.porcentaje}%`]),
    startY: y,
  });

  y = ensureSpace(doc, y, 30);
  drawObservation(doc, eventosObservacion(data.reservasPorTipo), y);

  drawFooter(doc);
  doc.save(`reservas-por-evento-${data.mes}-${data.anio}.pdf`);
}
