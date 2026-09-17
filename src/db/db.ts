import Dexie, { type Table } from 'dexie';
import type { Categoria, Carta, Mazo, PartidaActual, JugadorPartida, EfectoActivo, LogroLocal, EstadisticaPartida, CartaRecordada } from '../types';

// ---------------------------------------------------------------------------
// Tablas que son ESPEJO de Supabase (se sincronizan en las dos direcciones).
// Las cartas/mazos creados offline nacen con sincronizado=false hasta que
// useOfflineSync los sube.
// ---------------------------------------------------------------------------

export interface MazoGuardado {
  id: string;
  usuario_id: string;
  mazo_id: string;
  sincronizado: boolean;
}

// ---------------------------------------------------------------------------
// Tablas 100% locales: la sesión de la noche. Nunca viajan a Supabase.
// ---------------------------------------------------------------------------

export interface MazoGuardado {
  id: string;
  usuario_id: string;
  mazo_id: string;
  sincronizado: boolean;
}

class JuegoDB extends Dexie {
  // Espejo de Supabase
  categorias!: Table<Categoria, string>;
  cartas!: Table<Carta, string>;
  mazos!: Table<Mazo, string>;
  mazos_guardados!: Table<MazoGuardado, string>;

  // Sesión local de la noche
  partida_actual!: Table<PartidaActual, string>;
  jugadores_partida!: Table<JugadorPartida, string>;
  efectos_activos!: Table<EfectoActivo, string>;
  logros_locales!: Table<LogroLocal, string>;
  estadisticas_partida!: Table<EstadisticaPartida, number>;
  cartas_recordadas!: Table<CartaRecordada, string>;

  constructor() {
    super('juegoCartasDB');

    // Nota: "sincronizado" NO se indexa (booleans dan problemas de soporte
    // entre navegadores como índice IndexedDB). Se filtra en memoria con
    // .filter(), que para el volumen de cartas de un mazo es sobrado.
    this.version(1).stores({
      categorias: 'id, intensidad, es_pareja, mecanica',
      cartas: 'id, mazo_id, categoria_id, es_oficial',
      mazos: 'id, es_oficial',
      mazos_guardados: 'id, usuario_id, mazo_id',

      partida_actual: 'id, modo, iniciada_en',
      jugadores_partida: 'id, partida_id, orden',
      efectos_activos: 'id, jugador_id, carta_id',
      logros_locales: 'id, desbloqueado_en',
      estadisticas_partida: '++id, partida_id, jugador_id',
      cartas_recordadas: 'id, partida_id, carta_id',
    });
  }
}

export const db = new JuegoDB();

// ---------------------------------------------------------------------------
// Helpers de escritura offline-first: cualquier carta creada localmente
// (Creador de Cartas) entra con sincronizado=false para que useOfflineSync
// la detecte y la suba cuando vuelva la conexión.
// ---------------------------------------------------------------------------

export async function crearCartaLocal(
  datos: Omit<Carta, 'id' | 'sincronizado' | 'actualizado_en' | 'es_oficial'>
): Promise<Carta> {
  const nuevaCarta: Carta = {
    ...datos,
    id: crypto.randomUUID(),
    es_oficial: false,
    sincronizado: false,
    actualizado_en: Date.now(),
  };

  await db.cartas.add(nuevaCarta);
  return nuevaCarta;
}

export async function contarCartasPendientes(): Promise<number> {
  return db.cartas.filter((c) => !c.sincronizado).count();
}

export async function crearPartidaActual(partida: PartidaActual): Promise<string> {
  return db.partida_actual.add(partida);
}

export async function getPartidaActual(): Promise<PartidaActual | undefined> {
  return db.partida_actual.orderBy('iniciada_en').reverse().first();
}

export async function guardarJugadorPartida(jugador: JugadorPartida): Promise<string> {
  return db.jugadores_partida.add(jugador);
}

export async function getJugadoresDePartida(partidaId: string): Promise<JugadorPartida[]> {
  return db.jugadores_partida.where('partida_id').equals(partidaId).sortBy('orden');
}

export async function agregarEfectoActivo(efecto: EfectoActivo): Promise<string> {
  return db.efectos_activos.add(efecto);
}

export async function getEfectosActivosJugador(jugadorId: string): Promise<EfectoActivo[]> {
  return db.efectos_activos.where('jugador_id').equals(jugadorId).toArray();
}

export async function decrementarRondasEfecto(efectoId: string): Promise<void> {
  const efecto = await db.efectos_activos.get(efectoId);
  if (efecto && efecto.rondas_restantes > 1) {
    await db.efectos_activos.update(efectoId, { rondas_restantes: efecto.rondas_restantes - 1 });
  } else {
    await db.efectos_activos.delete(efectoId);
  }
}

export async function guardarLogro(logro: LogroLocal): Promise<string> {
  return db.logros_locales.add(logro);
}

export async function getLogrosDesbloqueados(): Promise<LogroLocal[]> {
  return db.logros_locales.filter((l) => l.desbloqueado_en !== null).toArray();
}

export async function guardarEstadistica(stats: EstadisticaPartida): Promise<number> {
  return db.estadisticas_partida.add(stats);
}

export async function getEstadisticasPartida(partidaId: string): Promise<EstadisticaPartida[]> {
  return db.estadisticas_partida.where('partida_id').equals(partidaId).toArray();
}

export async function guardarCartaRecordada(recordada: CartaRecordada): Promise<string> {
  return db.cartas_recordadas.add(recordada);
}

export async function getCartasRecordadas(partidaId: string): Promise<CartaRecordada[]> {
  return db.cartas_recordadas.where('partida_id').equals(partidaId).toArray();
}

export async function getCartasParaPartida(mazosIds: string[], categoriasIds?: string[]): Promise<Carta[]> {
  return db.cartas.filter(carta => {
    const mazoOk = mazosIds.includes(carta.mazo_id);
    const catOk = categoriasIds ? categoriasIds.includes(carta.categoria_id) : true;
    return mazoOk && catOk;
  }).toArray();
}

// ---------------------------------------------------------------------------
// Algoritmo "Mezcla" — pity-timer ponderado por jugador
// ---------------------------------------------------------------------------

export function calcularProbabilidadPicante(rachaPicante: number): number {
  const pBase = 0.33;
  const incremento = 0.05;
  const pMax = 0.70;
  return Math.min(pBase + rachaPicante * incremento, pMax);
}

export function actualizarRacha(rachaActual: number, fuePicante: boolean): number {
  return fuePicante ? 0 : rachaActual + 1;
}
