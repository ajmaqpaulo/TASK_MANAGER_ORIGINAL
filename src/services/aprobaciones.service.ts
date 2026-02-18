// ============================================================
// APROBACIONES SERVICE — Solicitudes + Mis Solicitudes
// ============================================================

import { tareasApi } from "./api";
import type { ApiRespuesta, Solicitud, ContadoresAprobacion, ResultadoAprobacion } from "./types";

const BASE = "/api/tareas/aprobaciones";

export const AprobacionesService = {

    // ─── SUPERVISOR / ADMIN ───────────────────────────
    contadores: (unidad_id?: string) =>
        tareasApi.get<ApiRespuesta<ContadoresAprobacion>>(`${BASE}/contadores`, { params: unidad_id ? { unidad_id } : undefined }),

    listar: (params?: { estado_solicitud?: string; prioridad?: string; tipo_accion?: string; unidad_id?: string; busqueda?: string }) =>
        tareasApi.get<ApiRespuesta<Solicitud[]>>(BASE, { params }),

    obtener: (id: string) =>
        tareasApi.get<ApiRespuesta<Solicitud>>(`${BASE}/${id}`),

    aprobar: (id: string, observacion?: string) =>
        tareasApi.post<ApiRespuesta<ResultadoAprobacion>>(`${BASE}/${id}/aprobar`, { observacion }),

    rechazar: (id: string, motivo: string) =>
        tareasApi.post<ApiRespuesta<ResultadoAprobacion>>(`${BASE}/${id}/rechazar`, { motivo }),

    // ─── USUARIO ESTÁNDAR ─────────────────────────────
    misSolicitudes: (estado_solicitud?: string) =>
        tareasApi.get<ApiRespuesta<Solicitud[]>>(`${BASE}/mis-solicitudes/listar`, { params: estado_solicitud ? { estado_solicitud } : undefined }),

    reenviar: (id: string, datos: { titulo?: string; descripcion?: string; prioridad?: string }) =>
        tareasApi.post<ApiRespuesta<{ solicitud_id: string }>>(`${BASE}/${id}/reenviar`, datos),
};
