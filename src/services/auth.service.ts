// ============================================================
// AUTH SERVICE — Autenticación, perfil, sesiones
// ============================================================

import { authApi } from "./api";
import type { ApiRespuesta, LoginRequest, LoginGoogleRequest, LoginResponse, UsuarioPerfil, Sesion } from "./types";

const BASE = "/api/auth/identidad";

export const AuthService = {

    // ─── LOGIN / LOGOUT ───────────────────────────────
    login: (datos: LoginRequest) =>
        authApi.post<ApiRespuesta<LoginResponse>>(`${BASE}/login`, datos),

    loginGoogle: (datos: LoginGoogleRequest) =>
        authApi.post<ApiRespuesta<LoginResponse>>(`${BASE}/login-google`, datos),

    refreshToken: (refresh_token: string) =>
        authApi.post<ApiRespuesta<LoginResponse>>(`${BASE}/refresh-token`, { refresh_token }),

    logout: () =>
        authApi.post<ApiRespuesta<null>>(`${BASE}/logout`),

    // ─── PERFIL PROPIO ────────────────────────────────
    perfil: () =>
        authApi.get<ApiRespuesta<UsuarioPerfil>>(`${BASE}/perfil`),

    cambiarContrasena: (contrasena_actual: string, contrasena_nueva: string) =>
        authApi.post<ApiRespuesta<null>>(`${BASE}/cambiar-contrasena`, { contrasena_actual, contrasena_nueva }),

    // ─── MIS SESIONES ─────────────────────────────────
    misSesiones: () =>
        authApi.get<ApiRespuesta<Sesion[]>>(`${BASE}/sesiones`),

    revocarSesion: (id: string) =>
        authApi.post<ApiRespuesta<null>>(`${BASE}/sesiones/${id}/revocar`),

    revocarTodasSesiones: () =>
        authApi.post<ApiRespuesta<null>>(`${BASE}/sesiones/revocar-todas`),
};
