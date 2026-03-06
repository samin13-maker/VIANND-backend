// ─── Auth ────────────────────────────────────────────────────────────────────
export interface JwtPayload {
  id_usuario: number;
  email: string;
}

// ─── Usuario ─────────────────────────────────────────────────────────────────
export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  edad: number;
  genero: 'mujer' | 'hombre' | 'otro';
  fecha_registro: string;
  modo_oscuro: boolean;
}

// ─── Alimento ─────────────────────────────────────────────────────────────────
export interface Alimento {
  id_alimento: number;
  nombre: string;
  id_categoria: number;
  categoria?: string;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

export interface AlimentoPorcion extends Alimento {
  cantidad: number;
  calorias_calculadas: number;
  proteinas_calculadas: number;
  carbohidratos_calculados: number;
  grasas_calculadas: number;
}

// ─── Platillo ────────────────────────────────────────────────────────────────
export interface Platillo {
  id_platillo: number;
  nombre: string;
  id_usuario: number;
  alimentos?: AlimentoPorcion[];
  total_calorias?: number;
}

// ─── Registro Comida ──────────────────────────────────────────────────────────
export interface RegistroComida {
  id_registro: number;
  id_usuario: number;
  fecha: string;
  hora_registro: string;
  id_tipo_comida: number;
  tipo_comida?: string;
  fuera_dieta: boolean;
  completado: boolean;
  id_dia?: number | null;
  alimentos?: AlimentoPorcion[];
  total_calorias?: number;
}

// ─── Registro Día ─────────────────────────────────────────────────────────────
export interface RegistroDia {
  id_dia: number;
  id_usuario: number;
  fecha: string;
  dia_completado: boolean;
}

// ─── Reporte Semanal ──────────────────────────────────────────────────────────
export interface ReporteSemanal {
  id_reporte: number;
  id_usuario: number;
  semana_inicio: string;
  semana_fin: string;
  calorias_promedio: number;
  proteinas_total: number;
  carbohidratos_total: number;
  grasas_total: number;
  porcentaje_cumplimiento: number;
  alimentos_extra: number;
}

// ─── Recordatorio ─────────────────────────────────────────────────────────────
export interface Recordatorio {
  id_recordatorio: number;
  id_usuario: number;
  id_tipo_comida: number;
  tipo_comida?: string;
  hora: string | null;
  activo: boolean;
}

// ─── Paginación ───────────────────────────────────────────────────────────────
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}