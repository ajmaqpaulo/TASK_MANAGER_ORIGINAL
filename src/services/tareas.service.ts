// ============================================================
// TAREAS SERVICE — Dashboard: CRUD + Completar + Historial
// ============================================================

import { tareasApi } from "./api";
import type { ApiRespuesta, Tarea, CrearTareaRequest, EditarTareaRequest, ResultadoAccion, HistorialTarea } from "./types";

const BASE = "/api/tareas/dashboard";

export const TareasService = {

    listar: (unidad_id?: string) =>
        tareasApi.get<ApiRespuesta<Tarea[]>>(`${BASE}/tareas`, { params: unidad_id ? { unidad_id } : undefined }),

    obtener: (id: string) =>
        tareasApi.get<ApiRespuesta<Tarea>>(`${BASE}/tareas/${id}`),

    crear: (datos: CrearTareaRequest) =>
        tareasApi.post<ApiRespuesta<ResultadoAccion>>(`${BASE}/tareas`, datos),

    editar: (id: string, datos: EditarTareaRequest) =>
        tareasApi.put<ApiRespuesta<ResultadoAccion>>(`${BASE}/tareas/${id}`, datos),

    eliminar: (id: string) =>
        tareasApi.delete<ApiRespuesta<ResultadoAccion>>(`${BASE}/tareas/${id}`),

    completar: (id: string) =>
        tareasApi.post<ApiRespuesta<ResultadoAccion>>(`${BASE}/tareas/${id}/completar`),

    historial: (id: string) =>
        tareasApi.get<ApiRespuesta<HistorialTarea[]>>(`${BASE}/tareas/${id}/historial`),
};
