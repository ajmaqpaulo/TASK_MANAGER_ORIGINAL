// ============================================================
// ESTADOS SERVICE — CRUD Estados de Tarea
// ============================================================

import { tareasApi } from "./api";
import type { ApiRespuesta, Estado, CrearEstadoRequest } from "./types";

const BASE = "/api/tareas/estados";

export const EstadosService = {

    listar: () =>
        tareasApi.get<ApiRespuesta<Estado[]>>(BASE),

    crear: (datos: CrearEstadoRequest) =>
        tareasApi.post<ApiRespuesta<{ id: string }>>(BASE, datos),

    editar: (id: string, datos: Partial<CrearEstadoRequest>) =>
        tareasApi.put<ApiRespuesta<null>>(`${BASE}/${id}`, datos),

    eliminar: (id: string) =>
        tareasApi.delete<ApiRespuesta<null>>(`${BASE}/${id}`),
};
