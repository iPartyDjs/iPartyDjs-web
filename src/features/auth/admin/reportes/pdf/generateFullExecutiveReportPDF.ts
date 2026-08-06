import {
  createDoc,
  drawCoverPage,
  addPage,
  drawSectionTitle,
  drawKpiCards,
  drawTable,
  drawObservation,
  drawBulletList,
  drawFooter,
  ensureSpace,
} from "./pdfPrimitives";
import {
  withPercentages,
  topAndBottom,
  solicitudesTasas,
  eventosObservacion,
  solicitudesObservacion,
  reseniasObservacion,
  generarConclusiones,
} from "../utils/statsUtils";
import type { ReportData } from "../types";

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

export function generateFullExecutiveReportPDF(data: ReportData): void {
  const doc = createDoc();
  const rango = `${MESES[data.mes - 1]} ${data.anio}`;

  /* ---------------------------------------------------------------- */
  /* 1. Portada                                                        */
  /* ---------------------------------------------------------------- */
  drawCoverPage(doc, {
    titulo: "Reporte Ejecutivo Mensual",
    subtitulo: "Reservas, solicitudes y reseñas de iPartyDJs",
    rango,
    generadoEn: new Date(data.generadoEn),
  });

  /* ---------------------------------------------------------------- */
  /* 2. Resumen ejecutivo                                              */
  /* ---------------------------------------------------------------- */
  let y = addPage(doc);
  y = drawSectionTitle(doc, "Resumen Ejecutivo", y);
  y = drawKpiCards(
    doc,
    [
      {
        label: "Eventos realizados",
        value: String(data.kpis.eventosRealizados),
      },
      {
        label: "Solicitudes recibidas",
        value: String(data.kpis.solicitudesRecibidas),
      },
      {
        label: "Tasa de aceptación",
        value: `${Math.round(data.kpis.tasaAceptacion)}%`,
      },
      {
        label: "Calificación promedio",
        value:
          data.kpis.calificacionPromedio !== null
            ? data.kpis.calificacionPromedio.toFixed(1)
            : "—",
        icon: data.kpis.calificacionPromedio !== null ? "star" : undefined,
      },
    ],
    y,
  );

  /* ---------------------------------------------------------------- */
  /* 3. Reservas por Tipo de Evento                                    */
  /* ---------------------------------------------------------------- */
  y = ensureSpace(doc, y, 80);
  y = drawSectionTitle(doc, "1. Reservas por Tipo de Evento", y);

  const eventosPct = withPercentages(data.reservasPorTipo);
  const { top: topEvento, bottom: bottomEvento } = topAndBottom(
    data.reservasPorTipo,
  );

  y = drawKpiCards(
    doc,
    [
      {
        label: "Total de reservas",
        value: String(eventosPct.reduce((a, i) => a + i.cantidad, 0)),
      },
      { label: "Más solicitado", value: topEvento?.tipo ?? "—" },
      { label: "Menos solicitado", value: bottomEvento?.tipo ?? "—" },
    ],
    y,
  );

  y = ensureSpace(doc, y, 60);
  y = drawTable(doc, {
    head: [["Tipo de evento", "Cantidad", "Porcentaje"]],
    body: eventosPct.map((i) => [
      i.tipo,
      String(i.cantidad),
      `${i.porcentaje}%`,
    ]),
    startY: y,
  });

  y = ensureSpace(doc, y, 30);
  y = drawObservation(doc, eventosObservacion(data.reservasPorTipo), y);

  /* ---------------------------------------------------------------- */
  /* 4. Solicitudes por Estado                                         */
  /* ---------------------------------------------------------------- */
  y = ensureSpace(doc, y, 80);
  y = drawSectionTitle(doc, "2. Solicitudes por Estado", y);

  const solicitudesPct = withPercentages(data.solicitudesPorEstado);
  const {
    total: totalSolicitudes,
    tasaAceptacion,
    tasaRechazo,
  } = solicitudesTasas(data.solicitudesPorEstado);

  y = drawKpiCards(
    doc,
    [
      { label: "Solicitudes totales", value: String(totalSolicitudes) },
      { label: "Tasa de aceptación", value: `${tasaAceptacion}%` },
      { label: "Tasa de rechazo", value: `${tasaRechazo}%` },
    ],
    y,
  );

  y = ensureSpace(doc, y, 60);
  y = drawTable(doc, {
    head: [["Estado", "Cantidad", "Porcentaje"]],
    body: solicitudesPct.map((i) => [
      i.estado,
      String(i.cantidad),
      `${i.porcentaje}%`,
    ]),
    startY: y,
  });

  y = ensureSpace(doc, y, 30);
  y = drawObservation(
    doc,
    solicitudesObservacion(data.solicitudesPorEstado),
    y,
  );

  /* ---------------------------------------------------------------- */
  /* 5. Distribución de Calificaciones                                 */
  /* ---------------------------------------------------------------- */
  y = ensureSpace(doc, y, 80);
  y = drawSectionTitle(doc, "3. Distribución de Calificaciones", y);

  const reseniasPct = withPercentages(data.reseniasPorModeracion);
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
    body: reseniasPct.map((i) => [
      i.estado,
      String(i.cantidad),
      `${i.porcentaje}%`,
    ]),
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
  y = drawObservation(
    doc,
    "Nota: el backend actual no expone un desglose de calificaciones por número de estrellas (de 1 a 5), solo el promedio general y el estado de moderación de cada reseña.",
    y,
  );

  /* ---------------------------------------------------------------- */
  /* 6. Conclusiones automáticas                                       */
  /* ---------------------------------------------------------------- */
  y = ensureSpace(doc, y, 80);
  y = drawSectionTitle(doc, "Conclusiones", y);

  const conclusiones = generarConclusiones({
    reservasPorTipo: data.reservasPorTipo,
    solicitudesPorEstado: data.solicitudesPorEstado,
    reseniasPorModeracion: data.reseniasPorModeracion,
    calificacionPromedio: data.kpis.calificacionPromedio,
  });

  drawBulletList(doc, conclusiones, y);

  drawFooter(doc);
  doc.save(`reporte-ejecutivo-${data.mes}-${data.anio}.pdf`);
}
