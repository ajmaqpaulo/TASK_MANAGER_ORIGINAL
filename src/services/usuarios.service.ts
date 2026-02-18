// ============================================================
// USUARIOS SERVICE — CRUD + Desbloquear + Resetear + Sesiones
// ============================================================

import { authApi } from "./api";
import type { ApiRespuesta, Paginado, UsuarioLista, UsuarioPerfil, CrearUsuarioRequest, EditarUsuarioRequest, Sesion } from "./types";

const BASE = "/api/auth/identidad";

export const UsuariosService = {

    listar: (params?: { pagina?: number; por_pagina?: number; unidad_id?: string; rol_id?: string; busqueda?: string }) =>
        authApi.get<ApiRespuesta<Paginado<UsuarioLista>>>(`${BASE}/usuarios`, { params }),

    obtener: (id: string) =>
        authApi.get<ApiRespuesta<UsuarioPerfil>>(`${BASE}/usuarios/${id}`),

    crear: (datos: CrearUsuarioRequest) =>
        authApi.post<ApiRespuesta<{ id: string }>>(`${BASE}/usuarios`, datos),

    editar: (id: string, datos: EditarUsuarioRequest) =>
        authApi.put<ApiRespuesta<null>>(`${BASE}/usuarios/${id}`, datos),

    eliminar: (id: string) =>
        authApi.delete<ApiRespuesta<null>>(`${BASE}/usuarios/${id}`),

    desbloquear: (id: string) =>
        authApi.post<ApiRespuesta<null>>(`${BASE}/usuarios/${id}/desbloquear`),

    resetearContrasena: (id: string, nueva_contrasena: string) =>
        authApi.post<ApiRespuesta<null>>(`${BASE}/usuarios/${id}/resetear-contrasena`, { nueva_contrasena }),

    sesiones: (id: string) =>
        authApi.get<ApiRespuesta<Sesion[]>>(`${BASE}/usuarios/${id}/sesiones`),

    revocarSesiones: (id: string) =>
        authApi.post<ApiRespuesta<null>>(`${BASE}/usuarios/${id}/revocar-sesiones`),
};
