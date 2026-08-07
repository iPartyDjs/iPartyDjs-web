import {
  createDoc,
  drawSectionTitle,
  drawKpiCards,
  drawTable,
  drawObservation,
  drawFooter,
  ensureSpace,
} from "./pdfPrimitives";
import { withPercentages, reseniasObservacion } from "../utils/statsUtils";
import type { ReportData } from "../types";

export function generateRatingsPDF(data: ReportData): void {
  const doc = createDoc();
  let y = 24;

  y = drawSectionTitle(doc, "Distribución de Calificaciones", y);

  const conPct = withPercentages(data.reseniasPorModeracion);
  const promedioTxt =
    data.kpis.calificacionPromedio !== null
      ? data.kpis.calificacionPromedio.toFixed(1)
      : "—";

  y = drawKpiCards(
    doc,
    [
      { label: "Total de reseñas", value: String(data.totalResenias) },
      {
        label: "Calificación promedio",
        value: promedioTxt,
        icon: data.kpis.calificacionPromedio !== null ? "star" : undefined,
      },
    ],
    y,
  );

  y = ensureSpace(doc, y, 60);
  y = drawTable(doc, {
    head: [["Estado de moderación", "Cantidad", "Porcentaje"]],
    body: conPct.map((i) => [i.estado, String(i.cantidad), `${i.porcentaje}%`]),
    startY: y,
  });

  y = ensureSpace(doc, y, 40);
  y = drawObservation(
    doc,
    reseniasObservacion(
      data.reseniasPorModeracion,
      data.kpis.calificacionPromedio,
    ),
    y,
  );

  y = ensureSpace(doc, y, 20);
  drawObservation(
    doc,
    "Nota: el backend actual no expone un desglose de calificaciones por número de estrellas (de 1 a 5), solo el promedio general y el estado de moderación de cada reseña. Este reporte se actualizará automáticamente cuando ese endpoint exista.",
    y,
  );

  drawFooter(doc);
  doc.save(`calificaciones-${data.mes}-${data.anio}.pdf`);
}
