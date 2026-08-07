import { apiClient } from "@/core/api/client";
import type { ReporteMensualDTO, ApiResponse } from "@ipartydjs/shared";

type ReporteResponse = ApiResponse<ReporteMensualDTO>;

function unwrap<T>(body: ApiResponse<T>): T {
  if (typeof body !== "object" || body === null) {
    throw new Error(
      "El servidor no respondió con JSON válido (¿existe el endpoint /reportes en el backend?)",
    );
  }
  if (!body.success) {
    const errorMessage =
      "message" in body && typeof body.message === "string"
        ? body.message
        : "Error en la respuesta del servidor";
    throw new Error(errorMessage);
  }
  return body.data;
}

export const reporteService = {
  /**
   * GET /reporte?mes=&anio=  (el backend registra la ruta en singular,
   * no "/reportes" — ver routes/index.ts: router.use("/reporte", ...)).
   *
   * NOTA: la ruta backend valida con `validate(ReporteSchema)`, cuyo
   * default es `source: "body"` (ver validate.middleware.ts) — es
   * inusual para un GET, lo consistente con el resto de tus endpoints
   * (/eventos, /citas) sería `validate(ReporteSchema, "query")`.
   *
   * Por compatibilidad mandamos mes/anio TANTO en query params como en
   * el body de la petición, para no depender de cuál de los dos termina
   * leyendo realmente tu stack (Express + axios) tal como está hoy. Si
   * confirmas cuál de los dos sí llega, se puede limpiar esto a una sola
   * vía. Lo ideal a mediano plazo es corregir el backend a
   * `validate(ReporteSchema, "query")` para que sea consistente con los
   * demás listados administrativos.
   */
  async generateMonthly(mes: number, anio: number): Promise<ReporteMensualDTO> {
    const response = await apiClient.get<ReporteResponse>("/reporte", {
      params: { mes, anio },
      data: { mes, anio },
    } as Record<string, unknown>);
    return unwrap(response.data);
  },
};
