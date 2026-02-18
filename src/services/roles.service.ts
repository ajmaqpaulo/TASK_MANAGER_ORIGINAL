// ============================================================
// ROLES SERVICE — CRUD Roles + Catálogos
// ============================================================

import { authApi } from "./api";
import type { ApiRespuesta, Rol, CrearRolRequest, Permiso, Pantalla, Reporte } from "./types";

const BASE = "/api/auth/acceso";

export const RolesService = {

    listar: () =>
        authApi.get<ApiRespuesta<Rol[]>>(`${BASE}/roles`),

    obtener: (id: string) =>
        authApi.get<ApiRespuesta<any>>(`${BASE}/roles/${id}`),

    crear: (datos: CrearRolRequest) =>
        authApi.post<ApiRespuesta<{ id: string }>>(`${BASE}/roles`, datos),

    editar: (id: string, datos: CrearRolRequest) =>
        authApi.put<ApiRespuesta<null>>(`${BASE}/roles/${id}`, datos),

    eliminar: (id: string) =>
        authApi.delete<ApiRespuesta<null>>(`${BASE}/roles/${id}`),

    // ─── CATÁLOGOS ────────────────────────────────────
    permisos: () =>
        authApi.get<ApiRespuesta<Permiso[]>>(`${BASE}/permisos`),

    pantallas: () =>
        authApi.get<ApiRespuesta<Pantalla[]>>(`${BASE}/pantallas`),

    reportesCatalogo: () =>
        authApi.get<ApiRespuesta<Reporte[]>>(`${BASE}/reportes-catalogo`),
};
