// ============================================================
// AUDITORÍA SERVICE — Logs del sistema
// ============================================================

import { authApi } from "./api";
import type { ApiRespuesta, Paginado, AuditoriaAuth } from "./types";

const BASE = "/api/auth/identidad";

export const AuditoriaService = {

    listar: (params?: { pagina?: number; por_pagina?: number; usuario_id?: string; accion?: string; fecha_desde?: string; fecha_hasta?: string }) =>
        authApi.get<ApiRespuesta<Paginado<AuditoriaAuth>>>(`${BASE}/auditoria`, { params }),
};
