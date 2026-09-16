// Tipos de dominio compartidos entre Dexie (local) y Supabase (nube).
// Se mantienen separados de db.ts para poder importarlos desde componentes
// sin arrastrar la instancia de Dexie.

export type Intensidad = 'chill' | 'picante';

export type MecanicaCarta =
  | 'estandar'
  | 'maldicion'
  | 'duelo'
  | 'espejo'
  | 'votacion_secreta'
  | 'termometro';

export type ModoJuego = 'picante' | 'personalizado';

export type FiltroPersonalizado = 'chill' | 'picante' | 'mezcla' | 'manual';

export interface Categoria {
  id: string;
  nombre: string;
  intensidad: Intensidad;
  es_pareja: boolean;
  mecanica: MecanicaCarta;
  descripcion?: string;
}

export interface Carta {
  id: string;
  mazo_id: string;
  categoria_id: string;
  contenido: string;
  /** Ej: { jugador_al_azar: 'jugador', pareja_jugando: 'pareja' } */
  variables?: Record<string, string>;
  duracion_rondas?: number;
  config?: Record<string, unknown>;
  es_oficial: boolean;
  creador_id?: string;
  /** false = creada offline y todavía no subida a Supabase */
  sincronizado: boolean;
  actualizado_en: number;
}

export interface Mazo {
  id: string;
  nombre: string;
  descripcion?: string;
  es_oficial: boolean;
  creador_id?: string;
  sincronizado: boolean;
}

// ---------------------------------------------------------------------------
// Tipos para la sesión de partida (100% locales, nunca se sincronizan)
// ---------------------------------------------------------------------------

export interface PartidaActual {
  id: string;
  modo: ModoJuego;
  filtro_personalizado?: FiltroPersonalizado;
  categorias_activas: string[];
  es_modo_parejas: boolean;
  iniciada_en: number;
}

export interface JugadorPartida {
  id: string;
  partida_id: string;
  nombre: string;
  orden: number;
  racha_picante: number;
}

export interface EfectoActivo {
  id: string;
  jugador_id: string;
  carta_id: string;
  rondas_restantes: number;
}

export interface LogroLocal {
  id: string;
  nombre: string;
  desbloqueado_en?: number | null;
  progreso: number;
}

export interface EstadisticaPartida {
  id?: number;
  partida_id: string;
  jugador_id: string;
  maldiciones_recibidas: number;
  duelos_ganados: number;
  duelos_perdidos: number;
  sincronia_pareja?: number | null;
}

export interface CartaRecordada {
  id: string;
  partida_id: string;
  carta_id: string;
  motivo?: string;
}

// ---------------------------------------------------------------------------
// Tipos para resolución de variables en contenido de cartas
// ---------------------------------------------------------------------------

export interface VariableResuelta {
  jugador_al_azar: string;
  pareja_jugando?: string;
  numero: number;
}

export type VariableMap = Record<string, string>;
