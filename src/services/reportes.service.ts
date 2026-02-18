// ============================================================
// REPORTES SERVICE — Contadores + Ejecutar SPs
// ============================================================

import { tareasApi } from "./api";
import type { ApiRespuesta, ContadoresReportes } from "./types";

const BASE = "/api/tareas/reportes";

export const ReportesService = {

    contadores: () =>
        tareasApi.get<ApiRespuesta<ContadoresReportes>>(`${BASE}/contadores`),

    ejecutar: (codigo: string, params?: { fecha_desde?: string; fecha_hasta?: string; unidad_id?: string }) =>
        tareasApi.get<ApiRespuesta<any>>(`${BASE}/ejecutar/${codigo}`, { params }),
};
