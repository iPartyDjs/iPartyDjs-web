import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PDF_COLORS, PDF_FONT, type RGB } from "./pdfTheme";

const PAGE_W = 210; // A4 en mm
const PAGE_H = 297;
const MARGIN = 16;

export const PDF_LAYOUT = { PAGE_W, PAGE_H, MARGIN };

export function createDoc(): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  fillPageBackground(doc);

  // Parchamos addPage para que CUALQUIER página nueva (creada por nuestro
  // propio addPage() de abajo, o internamente por autoTable cuando una
  // tabla no cabe en una sola página) se rellene de negro EN EL MOMENTO
  // DE CREARSE, antes de que se dibuje nada encima. Antes rellenábamos el
  // fondo de forma reactiva dentro de drawTable() -> didDrawPage, pero ese
  // callback se dispara DESPUÉS de dibujar la página completa (título,
  // KPI cards, tabla incluida), así que terminaba pintando un rectángulo
  // negro ENCIMA de todo lo ya dibujado y lo borraba por completo.
  const originalAddPage = doc.addPage.bind(doc);
  doc.addPage = (...args: Parameters<typeof originalAddPage>) => {
    const result = originalAddPage(...args);
    fillPageBackground(doc);
    return result;
  };

  return doc;
}

export function fillPageBackground(doc: jsPDF): void {
  doc.setFillColor(...PDF_COLORS.bgDark);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
}

/** Agrega una página nueva (el fondo oscuro ya se rellena automáticamente, ver createDoc). Devuelve el Y inicial sugerido. */
export function addPage(doc: jsPDF): number {
  doc.addPage();
  return MARGIN + 10;
}

export function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - MARGIN - 15) {
    return addPage(doc);
  }
  return y;
}

export function drawCoverPage(
  doc: jsPDF,
  opts: { titulo: string; subtitulo: string; rango: string; generadoEn: Date },
): void {
  fillPageBackground(doc);

  doc.setFont(PDF_FONT, "bold");
  doc.setFontSize(30);
  doc.setTextColor(...PDF_COLORS.gold);
  doc.text("iParty", MARGIN, 90);
  const w = doc.getTextWidth("iParty");
  doc.setTextColor(...PDF_COLORS.textLight);
  doc.text("DJs", MARGIN + w, 90);

  doc.setDrawColor(...PDF_COLORS.gold);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, 100, PAGE_W - MARGIN, 100);

  doc.setFont(PDF_FONT, "bold");
  doc.setFontSize(22);
  doc.setTextColor(...PDF_COLORS.textLight);
  doc.text(opts.titulo, MARGIN, 130);

  doc.setFont(PDF_FONT, "normal");
  doc.setFontSize(12);
  doc.setTextColor(...PDF_COLORS.textMuted);
  doc.text(opts.subtitulo, MARGIN, 140);

  const fechaTxt = opts.generadoEn.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const horaTxt = opts.generadoEn.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const metaRows: [string, string][] = [
    ["RANGO ANALIZADO", opts.rango],
    ["FECHA DE GENERACIÓN", fechaTxt],
    ["HORA DE GENERACIÓN", horaTxt],
  ];

  let y = 170;
  metaRows.forEach(([label, value]) => {
    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_COLORS.gold);
    doc.text(label, MARGIN, y);
    doc.setFont(PDF_FONT, "normal");
    doc.setFontSize(11);
    doc.setTextColor(...PDF_COLORS.textLight);
    doc.text(value, MARGIN, y + 6);
    y += 20;
  });

  doc.setFont(PDF_FONT, "normal");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.textMuted);
  doc.text(
    "Documento generado automáticamente por el panel de administración de iPartyDJs.",
    MARGIN,
    PAGE_H - 20,
  );
}

export function drawSectionTitle(
  doc: jsPDF,
  titulo: string,
  y: number,
): number {
  doc.setFont(PDF_FONT, "bold");
  doc.setFontSize(16);
  doc.setTextColor(...PDF_COLORS.gold);
  doc.text(titulo, MARGIN, y);
  doc.setDrawColor(...PDF_COLORS.goldSoft);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y + 3, PAGE_W - MARGIN, y + 3);
  return y + 14;
}

/**
 * Dibuja una estrella de 5 puntas rellena, como forma vectorial (no texto),
 * por eso no depende de que la fuente del PDF soporte el glifo Unicode ★.
 */
export function drawStar(
  doc: jsPDF,
  cx: number,
  cy: number,
  outerRadius: number,
  color: RGB = PDF_COLORS.gold,
): void {
  const innerRadius = outerRadius * 0.42;
  const points: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const angleDeg = -90 + i * 36;
    const angleRad = (angleDeg * Math.PI) / 180;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    points.push([cx + r * Math.cos(angleRad), cy + r * Math.sin(angleRad)]);
  }

  const deltas: number[][] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    deltas.push([x2 - x1, y2 - y1]);
  }

  doc.setFillColor(...color);
  doc.lines(deltas, points[0][0], points[0][1], [1, 1], "F", true);
}

export function drawKpiCards(
  doc: jsPDF,
  kpis: { label: string; value: string; icon?: "star" }[],
  y: number,
): number {
  const gap = 6;
  const cardW = (PAGE_W - MARGIN * 2 - (kpis.length - 1) * gap) / kpis.length;
  const cardH = 24;

  kpis.forEach((kpi, i) => {
    const x = MARGIN + i * (cardW + gap);
    doc.setFillColor(...PDF_COLORS.panelDark);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, "F");
    doc.setDrawColor(...PDF_COLORS.goldSoft);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, "S");

    doc.setFont(PDF_FONT, "bold");
    let valueFontSize = 13;
    doc.setFontSize(valueFontSize);
    const starReserve = kpi.icon === "star" ? 9 : 0;
    const maxValueWidth = cardW - 6 - starReserve;
    // Si el valor no cabe con el tamaño normal, se reduce hasta que
    // quepa en una sola línea, en vez de dejarlo desbordarse.
    while (doc.getTextWidth(kpi.value) > maxValueWidth && valueFontSize > 8) {
      valueFontSize -= 1;
      doc.setFontSize(valueFontSize);
    }
    doc.setTextColor(...PDF_COLORS.gold);

    if (kpi.icon === "star") {
      const textWidth = doc.getTextWidth(kpi.value);
      const starDiameter = 4.4;
      const iconGap = 2.5;
      const totalWidth = textWidth + iconGap + starDiameter;
      const startX = x + cardW / 2 - totalWidth / 2;
      doc.text(kpi.value, startX, y + 11);
      drawStar(
        doc,
        startX + textWidth + iconGap + starDiameter / 2,
        y + 9,
        starDiameter / 2,
      );
    } else {
      doc.text(kpi.value, x + cardW / 2, y + 11, { align: "center" });
    }

    doc.setFont(PDF_FONT, "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...PDF_COLORS.textMuted);
    const lines = doc.splitTextToSize(kpi.label.toUpperCase(), cardW - 4);
    doc.text(lines, x + cardW / 2, y + 17, { align: "center" });
  });

  return y + cardH + 12;
}

export function drawTable(
  doc: jsPDF,
  opts: { head: string[][]; body: (string | number)[][]; startY: number },
): number {
  autoTable(doc, {
    head: opts.head,
    body: opts.body,
    startY: opts.startY,
    margin: { left: MARGIN, right: MARGIN },
    styles: {
      font: PDF_FONT,
      fontSize: 9,
      textColor: PDF_COLORS.textLight,
      fillColor: PDF_COLORS.bgDark,
      lineColor: PDF_COLORS.goldSoft,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: PDF_COLORS.goldSoft,
      textColor: [20, 18, 14],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [20, 18, 16],
    },
  });

  const docWithTable = doc as jsPDF & {
    lastAutoTable?: { finalY: number };
  };
  return (docWithTable.lastAutoTable?.finalY ?? opts.startY) + 10;
}

export function drawObservation(doc: jsPDF, texto: string, y: number): number {
  // IMPORTANTE: la fuente/tamaño debe fijarse ANTES de splitTextToSize,
  // porque esa función mide el ancho del texto usando la fuente que esté
  // activa en el doc en ese momento. Si se llama antes de setFont/
  // setFontSize, mide con la fuente de lo último dibujado (más chica) y
  // calcula mal el corte de línea, causando que el texto se salga de la
  // página al dibujarse con el tamaño real.
  doc.setFont(PDF_FONT, "italic");
  doc.setFontSize(9.5);

  const maxWidth = PAGE_W - MARGIN * 2 - 12;
  const lines = doc.splitTextToSize(texto, maxWidth);
  const boxH = lines.length * 5 + 10;

  doc.setFillColor(...PDF_COLORS.panelDark);
  doc.roundedRect(MARGIN, y, PAGE_W - MARGIN * 2, boxH, 2, 2, "F");
  doc.setDrawColor(...PDF_COLORS.gold);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, MARGIN, y + boxH);

  doc.setFont(PDF_FONT, "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF_COLORS.textLight);
  doc.text(lines, MARGIN + 6, y + 8);

  return y + boxH + 10;
}

export function drawBulletList(doc: jsPDF, items: string[], y: number): number {
  let cursorY = y;
  const maxWidth = PAGE_W - MARGIN * 2 - 10;

  items.forEach((item) => {
    // Mismo orden correcto: fijar la fuente ANTES de splitTextToSize.
    doc.setFont(PDF_FONT, "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(item, maxWidth);
    cursorY = ensureSpace(doc, cursorY, lines.length * 5 + 6);

    doc.setFillColor(...PDF_COLORS.gold);
    doc.circle(MARGIN + 1.5, cursorY - 1.5, 1, "F");

    doc.setFont(PDF_FONT, "normal");
    doc.setFontSize(10);
    doc.setTextColor(...PDF_COLORS.textLight);
    doc.text(lines, MARGIN + 6, cursorY);

    cursorY += lines.length * 5 + 6;
  });
  return cursorY;
}

export function drawFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont(PDF_FONT, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.text(
      "iPartyDJs · Reporte confidencial de administración",
      MARGIN,
      PAGE_H - 10,
    );
    doc.text(`Página ${i} de ${pageCount}`, PAGE_W - MARGIN, PAGE_H - 10, {
      align: "right",
    });
  }
}
