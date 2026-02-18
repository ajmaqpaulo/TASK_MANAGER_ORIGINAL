// ============================================================
// UNIDADES SERVICE — CRUD Unidades Organizacionales
// ============================================================

import { authApi } from "./api";
import type { ApiRespuesta, Unidad, CrearUnidadRequest } from "./types";

const BASE = "/api/auth/unidades";

export const UnidadesService = {

    listar: (busqueda?: string) =>
        authApi.get<ApiRespuesta<Unidad[]>>(BASE, { params: busqueda ? { busqueda } : undefined }),

    obtener: (id: string) =>
        authApi.get<ApiRespuesta<Unidad>>(`${BASE}/${id}`),

    crear: (datos: CrearUnidadRequest) =>
        authApi.post<ApiRespuesta<{ id: string }>>(BASE, datos),

    editar: (id: string, datos: Partial<CrearUnidadRequest & { esta_activa?: boolean }>) =>
        authApi.put<ApiRespuesta<null>>(`${BASE}/${id}`, datos),

    eliminar: (id: string) =>
        authApi.delete<ApiRespuesta<null>>(`${BASE}/${id}`),
};
