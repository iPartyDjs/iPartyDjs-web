import type { ReporteMensualDTO } from "@ipartydjs/shared";

/* ------------------------------------------------------------------ */
/* Tipos internos consumidos por la UI y los generadores de PDF.       */
/* Deliberadamente separados de ReporteMensualDTO: si el backend       */
/* cambia de forma, solo se actualiza mapReporteMensualDTOToReportData */
/* de este archivo, no cada panel/PDF individual.                     */
/* ------------------------------------------------------------------ */

export interface EventoTipoStat {
  tipo: string;
  cantidad: number;
}

export type EstadoSolicitudReporte = "Aprobadas" | "Rechazadas" | "Pendientes";

export interface SolicitudEstadoStat {
  estado: EstadoSolicitudReporte;
  cantidad: number;
}

export type EstadoModeracionResenia = "Pendientes" | "Aprobadas" | "Rechazadas";

export interface ReseniaModeracionStat {
  estado: EstadoModeracionResenia;
  cantidad: number;
}

export interface ReportData {
  mes: number;
  anio: number;
  /** Momento en que el cliente generó/recibió este reporte (para el PDF). */
  generadoEn: string;
  kpis: {
    eventosRealizados: number;
    solicitudesRecibidas: number;
    /** % de solicitudes aprobadas sobre el total recibido. */
    tasaAceptacion: number;
    /** Puede ser null si no hubo ninguna reseña aprobada en el periodo. */
    calificacionPromedio: number | null;
  };
  reservasPorTipo: EventoTipoStat[];
  solicitudesPorEstado: SolicitudEstadoStat[];
  reseniasPorModeracion: ReseniaModeracionStat[];
  totalResenias: number;
}

/**
 * Adaptador ReporteMensualDTO (backend real) -> ReportData (forma interna).
 *
 * OJO — dos cosas que el DTO real NO trae y que el diseño original pedía:
 *
 * 1) `solicitudes` en el DTO solo tiene {recibidas, aprobadas, rechazadas},
 *    no un desglose "pendiente / en_revision / aceptada / rechazada" como
 *    tenía el mock original. Aquí derivamos "Pendientes" como
 *    recibidas - aprobadas - rechazadas.
 *
 * 2) No existe una distribución de calificaciones por estrellas (1★-5★).
 *    Solo hay `calificacion_promedio_resenias` (un número) y
 *    `resenias: {pendientes, aprobadas, rechazadas}` (estados de
 *    MODERACIÓN de la reseña, no las estrellas). El panel de
 *    "Distribución de Calificaciones" se construye con esto último;
 *    si en el futuro agregan un endpoint con el histograma 1-5★, hay
 *    que extender ReportData con `calificacionesPorEstrella` y actualizar
 *    este mapper + el panel + el generador de PDF correspondiente.
 */
export function mapReporteMensualDTOToReportData(
  dto: ReporteMensualDTO,
): ReportData {
  const { recibidas, aprobadas, rechazadas } = dto.solicitudes;
  const pendientes = Math.max(0, recibidas - aprobadas - rechazadas);
  const tasaAceptacion = recibidas === 0 ? 0 : (aprobadas / recibidas) * 100;

  const totalResenias =
    dto.resenias.pendientes + dto.resenias.aprobadas + dto.resenias.rechazadas;

  return {
    mes: dto.mes,
    anio: dto.anio,
    generadoEn: new Date().toISOString(),
    kpis: {
      eventosRealizados: dto.eventos_realizados,
      solicitudesRecibidas: recibidas,
      tasaAceptacion,
      calificacionPromedio: dto.calificacion_promedio_resenias,
    },
    reservasPorTipo: dto.eventos.map((e) => ({
      tipo: e.tipo,
      cantidad: e.registrados,
    })),
    solicitudesPorEstado: [
      { estado: "Aprobadas", cantidad: aprobadas },
      { estado: "Rechazadas", cantidad: rechazadas },
      { estado: "Pendientes", cantidad: pendientes },
    ],
    reseniasPorModeracion: [
      { estado: "Pendientes", cantidad: dto.resenias.pendientes },
      { estado: "Aprobadas", cantidad: dto.resenias.aprobadas },
      { estado: "Rechazadas", cantidad: dto.resenias.rechazadas },
    ],
    totalResenias,
  };
}
