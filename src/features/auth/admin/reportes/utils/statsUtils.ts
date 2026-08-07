import type {
  EventoTipoStat,
  SolicitudEstadoStat,
  ReseniaModeracionStat,
} from "../types";

export interface WithPercentage {
  porcentaje: number;
}

export function withPercentages<T extends { cantidad: number }>(
  items: T[],
): (T & WithPercentage)[] {
  const total = items.reduce((acc, i) => acc + i.cantidad, 0);
  return items.map((i) => ({
    ...i,
    porcentaje: total === 0 ? 0 : Math.round((i.cantidad / total) * 100),
  }));
}

export function topAndBottom(items: EventoTipoStat[]): {
  top: EventoTipoStat | null;
  bottom: EventoTipoStat | null;
} {
  if (items.length === 0) return { top: null, bottom: null };
  const sorted = [...items].sort((a, b) => b.cantidad - a.cantidad);
  return { top: sorted[0], bottom: sorted[sorted.length - 1] };
}

export function eventosObservacion(items: EventoTipoStat[]): string {
  const conPct = withPercentages(items);
  const { top } = topAndBottom(items);
  if (!top || top.cantidad === 0) {
    return "No se registraron reservas en este periodo.";
  }
  const topPct = conPct.find((i) => i.tipo === top.tipo)?.porcentaje ?? 0;
  return `"${top.tipo}" representa el ${topPct}% de las reservas del periodo, siendo el segmento principal de negocio.`;
}

export function solicitudesTasas(items: SolicitudEstadoStat[]) {
  const total = items.reduce((a, i) => a + i.cantidad, 0);
  const aprobadas = items.find((i) => i.estado === "Aprobadas")?.cantidad ?? 0;
  const rechazadas =
    items.find((i) => i.estado === "Rechazadas")?.cantidad ?? 0;
  const tasaAceptacion =
    total === 0 ? 0 : Math.round((aprobadas / total) * 100);
  const tasaRechazo = total === 0 ? 0 : Math.round((rechazadas / total) * 100);
  return { total, aprobadas, rechazadas, tasaAceptacion, tasaRechazo };
}

export function solicitudesObservacion(items: SolicitudEstadoStat[]): string {
  const { total, tasaAceptacion, tasaRechazo } = solicitudesTasas(items);
  if (total === 0) {
    return "No se recibieron solicitudes en este periodo.";
  }
  return `El ${tasaAceptacion}% de las solicitudes del periodo fueron aprobadas y el ${tasaRechazo}% rechazadas, reflejando la conversión del embudo de negociación.`;
}

export function reseniasObservacion(
  items: ReseniaModeracionStat[],
  promedio: number | null,
): string {
  const total = items.reduce((a, i) => a + i.cantidad, 0);
  if (total === 0) {
    return "No se registraron reseñas en este periodo.";
  }
  const promedioTxt =
    promedio === null
      ? "sin una calificación promedio disponible todavía"
      : `una calificación promedio de ${promedio.toFixed(1)}/5`;
  return `Se recibieron ${total} reseñas en el periodo, con ${promedioTxt}.`;
}

export function generarConclusiones(input: {
  reservasPorTipo: EventoTipoStat[];
  solicitudesPorEstado: SolicitudEstadoStat[];
  reseniasPorModeracion: ReseniaModeracionStat[];
  calificacionPromedio: number | null;
}): string[] {
  const conclusiones: string[] = [];

  const { top } = topAndBottom(input.reservasPorTipo);
  if (top && top.cantidad > 0) {
    conclusiones.push(
      `El segmento de mejor desempeño del periodo fue "${top.tipo}", con ${top.cantidad} reservas registradas.`,
    );
  }

  const { tasaAceptacion } = solicitudesTasas(input.solicitudesPorEstado);
  if (input.solicitudesPorEstado.some((s) => s.cantidad > 0)) {
    conclusiones.push(
      tasaAceptacion >= 50
        ? `La tasa de aceptación de solicitudes (${tasaAceptacion}%) se mantiene favorable; se recomienda mantener los tiempos de respuesta actuales.`
        : `La tasa de aceptación de solicitudes (${tasaAceptacion}%) está por debajo del 50%; se recomienda revisar el proceso de negociación y disponibilidad ofrecida.`,
    );
  }

  if (input.calificacionPromedio !== null) {
    conclusiones.push(
      input.calificacionPromedio >= 4
        ? `El nivel de satisfacción del cliente es alto (${input.calificacionPromedio.toFixed(1)}/5 en promedio); se recomienda mantener los estándares de servicio actuales.`
        : `El nivel de satisfacción del cliente (${input.calificacionPromedio.toFixed(1)}/5 en promedio) tiene margen de mejora; se recomienda revisar los casos con calificación baja.`,
    );
  } else {
    conclusiones.push(
      "Aún no hay suficientes reseñas aprobadas en el periodo para calcular una calificación promedio confiable.",
    );
  }

  return conclusiones;
}
