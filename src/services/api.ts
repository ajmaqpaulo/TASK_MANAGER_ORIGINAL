// ============================================================
// API — Cliente HTTP base (axios)
// ============================================================

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

const AUTH_URL = (import.meta as any).env?.VITE_AUTH_URL || "http://localhost:4000";
const TAREAS_URL = (import.meta as any).env?.VITE_TAREAS_URL || "http://localhost:5000";

function crearCliente(baseURL: string): AxiosInstance {
    const cliente = axios.create({ baseURL, headers: { "Content-Type": "application/json" } });

    // Inyectar token en cada request
    cliente.interceptors.request.use((config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("access_token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    // Manejar 401 → intentar refresh → si falla, logout
    cliente.interceptors.response.use(
        (res: AxiosResponse) => res,
        async (error: AxiosError) => {
            const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
            if (error.response?.status === 401 && original && !original._retry) {
                original._retry = true;
                try {
                    const refresh = localStorage.getItem("refresh_token");
                    if (!refresh) throw new Error("Sin refresh token");
                    const res = await axios.post(`${AUTH_URL}/api/auth/identidad/refresh-token`, { refresh_token: refresh });
                    const { access_token, refresh_token } = res.data.datos;
                    localStorage.setItem("access_token", access_token);
                    localStorage.setItem("refresh_token", refresh_token);
                    original.headers.Authorization = `Bearer ${access_token}`;
                    return cliente(original);
                } catch {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = "/login";
                }
            }
            return Promise.reject(error);
        }
    );

    return cliente;
}

export const authApi = crearCliente(AUTH_URL);
export const tareasApi = crearCliente(TAREAS_URL);