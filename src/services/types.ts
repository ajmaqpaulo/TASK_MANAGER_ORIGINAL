// ============================================================
// TYPES — Tipado completo del backend
// ============================================================

// ─── RESPUESTA GENÉRICA DEL BACKEND ───────────────────
export interface ApiRespuesta<T = any> {
    exito: boolean;
    mensaje: string;
    datos: T | null;
    errores?: string[];
    marca_tiempo: string;
}

export interface Paginado<T> {
    registros: T[];
    total: number;
    pagina: number;
    por_pagina: number;
    total_paginas: number;
}

// ─── AUTH: LOGIN ──────────────────────────────────────
export interface LoginRequest {
    correo: string;
    contrasena: string;
}

export interface LoginGoogleRequest {
    id_token: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    expira_en: string;
    usuario: UsuarioPerfil;
}

// ─── AUTH: USUARIO / PERFIL ───────────────────────────
export interface UsuarioPerfil {
    id: string;
    nombre_completo: string;
    correo: string;
    unidad_id: string;
    unidad_nombre: string;
    unidad_codigo: string;
    rol_id: string;
    rol_nombre: string;
    rol_codigo: string;
    permisos: string[];
    pantallas: string[];
    reportes: string[];
    ultimo_acceso: string | null;
}

export interface UsuarioLista {
    id: string;
    nombre_completo: string;
    correo: string;
    esta_activo: boolean;
    unidad_nombre: string;
    unidad_codigo: string;
    rol_nombre: string;
    rol_codigo: string;
    creado_en: string;
}

export interface CrearUsuarioRequest {
    nombre_completo: string;
    correo: string;
    contrasena?: string;
    unidad_id: string;
    rol_id: string;
    firebase_uid?: string;
    proveedor_auth?: string;
}

export interface EditarUsuarioRequest {
    nombre_completo?: string;
    correo?: string;
    unidad_id?: string;
    rol_id?: string;
    esta_activo?: boolean;
}

// ─── AUTH: SESIONES ───────────────────────────────────
export interface Sesion {
    ID: string;
    DIRECCION_IP: string | null;
    AGENTE_USUARIO: string | null;
    CREADO_EN: string;
    EXPIRA_EN: string;
    ESTA_REVOCADO: boolean;
}

// ─── AUTH: ROLES ──────────────────────────────────────
export interface Rol {
    ID: string;
    NOMBRE: string;
    CODIGO: string;
    DESCRIPCION: string | null;
    ES_SISTEMA: boolean;
    ESTA_ACTIVO: boolean;
}

export interface CrearRolRequest {
    nombre: string;
    codigo: string;
    descripcion?: string;
    permisos_ids?: string[];
    pantallas_ids?: string[];
    reportes_ids?: string[];
}

// ─── AUTH: CATÁLOGOS ──────────────────────────────────
export interface Permiso {
    ID: string;
    NOMBRE: string;
    CODIGO: string;
    DESCRIPCION: string | null;
}

export interface Pantalla {
    ID: string;
    NOMBRE: string;
    CODIGO: string;
    RUTA: string;
    ICONO: string | null;
    ORDEN: number;
}

export interface Reporte {
    ID: string;
    NOMBRE: string;
    CODIGO: string;
    TIPO: string;
    DESCRIPCION: string | null;
}

// ─── AUTH: UNIDADES ───────────────────────────────────
export interface Unidad {
    ID: string;
    NOMBRE: string;
    CODIGO: string;
    DESCRIPCION: string | null;
    COLOR: string;
    ESTA_ACTIVA: boolean;
}

export interface CrearUnidadRequest {
    nombre: string;
    codigo: string;
    descripcion?: string;
    color?: string;
}

// ─── AUTH: AUDITORÍA ──────────────────────────────────
export interface AuditoriaAuth {
    ID: number;
    USUARIO_ID: string | null;
    ACCION: string;
    ENTIDAD: string;
    ENTIDAD_ID: string | null;
    DIRECCION_IP: string | null;
    RESULTADO: string;
    DETALLE: string | null;
    CREADO_EN: string;
}

// ─── TAREAS: ESTADOS ──────────────────────────────────
export interface Estado {
    ID: string;
    NOMBRE: string;
    COLOR: string;
    ORDEN: number;
    ES_DEFECTO: boolean;
    ESTA_ACTIVO: boolean;
}

export interface CrearEstadoRequest {
    nombre: string;
    color?: string;
}

// ─── TAREAS: TAREA ────────────────────────────────────
export interface Tarea {
    ID: string;
    TITULO: string;
    DESCRIPCION: string | null;
    PRIORIDAD: string;
    UNIDAD_ID: string;
    CREADO_POR: string;
    FECHA_CREACION: string;
    ESTADO_ID: string;
    ESTADO_NOMBRE: string;
    ESTADO_COLOR: string;
}

export interface CrearTareaRequest {
    titulo: string;
    descripcion?: string;
    estado_id?: string;
    prioridad?: string;
    unidad_id?: string;
}

export interface EditarTareaRequest {
    titulo?: string;
    descripcion?: string;
    estado_id?: string;
    prioridad?: string;
}

export interface ResultadoAccion {
    tipo: "TAREA" | "SOLICITUD";
    id: string;
}

// ─── TAREAS: HISTORIAL ───────────────────────────────
export interface HistorialTarea {
    ID: number;
    TAREA_ID: string;
    ACCION: string;
    DATOS_ANTERIORES: string | null;
    DATOS_NUEVOS: string | null;
    SOLICITUD_ID: string | null;
    REALIZADO_POR: string;
    CREADO_EN: string;
}

// ─── TAREAS: SOLICITUDES / APROBACIONES ───────────────
export interface Solicitud {
    ID: string;
    TAREA_ID: string | null;
    TIPO_ACCION: string;
    TITULO: string;
    DESCRIPCION: string | null;
    PRIORIDAD: string;
    UNIDAD_ID: string;
    SOLICITANTE_ID: string;
    ESTADO_SOLICITUD: string;
    APROBADO_POR: string | null;
    MOTIVO_RECHAZO: string | null;
    FECHA_RESOLUCION: string | null;
    CREADO_EN: string;
    ESTADO_TAREA_NOMBRE?: string;
    ESTADO_TAREA_COLOR?: string;
}

export interface ContadoresAprobacion {
    TOTAL_PENDIENTES: number;
    TOTAL_APROBADAS: number;
    TOTAL_RECHAZADAS: number;
}

export interface ResultadoAprobacion {
    exito: number;
    mensaje: string;
    tarea_id?: string;
}

// ─── TAREAS: REPORTES ─────────────────────────────────
export interface ContadoresReportes {
    REPORTES_APROBADOS: number;
    REPORTES_PRODUCTIVIDAD: number;
    REPORTES_CRITICIDAD: number;
    REPORTES_AUDITORIA: number;
}
