import type { EstadisticaPartida, LogroLocal } from '../types';
import { db } from '../db/db';

export async function registrarEstadistica(
  partidaId: string,
  jugadorId: string,
  maldicionesRecibidas: number,
  duelosGanados: number,
  duelosPerdidos: number,
  sincroniaPareja?: number
): Promise<void> {
  await db.estadisticas_partida.add({
    partida_id: partidaId,
    jugador_id: jugadorId,
    maldiciones_recibidas: maldicionesRecibidas,
    duelos_ganados: duelosGanados,
    duelos_perdidos: duelosPerdidos,
    cartas_cumplidas: 0,
    cartas_rebotadas: 0,
    cartas_picantes: 0,
    sincronia_pareja: sincroniaPareja ?? null,
  });
}

export async function chequearLogros(jugadorId: string): Promise<LogroLocal[]> {
  const stats = await db.estadisticas_partida.where('jugador_id').equals(jugadorId).toArray();
  const logrosPrevios = await db.logros_locales.toArray();
  const nombresPrevios = logrosPrevios.map(l => l.nombre);
  
  const nuevosLogros: LogroLocal[] = [];

  const totalMaldiciones = stats.reduce((a, b) => a + (b.maldiciones_recibidas || 0), 0);
  const totalDuelos = stats.reduce((a, b) => a + (b.duelos_ganados || 0), 0);
  const totalCumplidas = stats.reduce((a, b) => a + (b.cartas_cumplidas || 0), 0);
  const totalRebotadas = stats.reduce((a, b) => a + (b.cartas_rebotadas || 0), 0);
  const totalPicantes = stats.reduce((a, b) => a + (b.cartas_picantes || 0), 0);

  const nombreBombas = 'Sobrevivió 3 bombas de tiempo seguidas';
  if (totalMaldiciones >= 3 && !nombresPrevios.includes(nombreBombas)) {
    nuevosLogros.push({
      id: crypto.randomUUID(),
      nombre: nombreBombas,
      desbloqueado_en: Date.now(),
      progreso: totalMaldiciones,
    });
  }

  const nombreImpostor = 'Impostor perfecto 3 veces';
  if (totalDuelos >= 3 && !nombresPrevios.includes(nombreImpostor)) {
    nuevosLogros.push({
      id: crypto.randomUUID(),
      nombre: nombreImpostor,
      desbloqueado_en: Date.now(),
      progreso: totalDuelos,
    });
  }

  const nombrePrimera = 'Rompehielos (Terminó su primera partida)';
  if (!nombresPrevios.includes(nombrePrimera)) {
    nuevosLogros.push({
      id: crypto.randomUUID(),
      nombre: nombrePrimera,
      desbloqueado_en: Date.now(),
      progreso: 1,
    });
  }

  const nombreValiente = 'Valiente (Cumplió 5 retos sin arrugar)';
  if (totalCumplidas >= 5 && !nombresPrevios.includes(nombreValiente)) {
    nuevosLogros.push({
      id: crypto.randomUUID(),
      nombre: nombreValiente,
      desbloqueado_en: Date.now(),
      progreso: totalCumplidas,
    });
  }

  const nombreGallina = 'Gallina (Rebotó 3 retos seguidos)';
  if (totalRebotadas >= 3 && !nombresPrevios.includes(nombreGallina)) {
    nuevosLogros.push({
      id: crypto.randomUUID(),
      nombre: nombreGallina,
      desbloqueado_en: Date.now(),
      progreso: totalRebotadas,
    });
  }

  const nombreFuego = 'En Llamas (Jugó 3 cartas picantes)';
  if (totalPicantes >= 3 && !nombresPrevios.includes(nombreFuego)) {
    nuevosLogros.push({
      id: crypto.randomUUID(),
      nombre: nombreFuego,
      desbloqueado_en: Date.now(),
      progreso: totalPicantes,
    });
  }

  for (const logro of nuevosLogros) {
    await db.logros_locales.add(logro);
  }

  return nuevosLogros;
}

export function calcularEstadisticasNoche(
  estadisticas: EstadisticaPartida[]
): {
  masMaldiciones: { nombre: string; count: number } | null;
  masDuelosGanados: { nombre: string; count: number } | null;
} {
  const maldicionesPorJugador = new Map<string, number>();
  const duelosPorJugador = new Map<string, number>();

  estadisticas.forEach((e) => {
    maldicionesPorJugador.set(e.jugador_id, (maldicionesPorJugador.get(e.jugador_id) ?? 0) + e.maldiciones_recibidas);
    duelosPorJugador.set(e.jugador_id, (duelosPorJugador.get(e.jugador_id) ?? 0) + e.duelos_ganados);
  });

  const masMaldiciones = [...maldicionesPorJugador.entries()].sort((a, b) => b[1] - a[1])[0];
  const masDuelos = [...duelosPorJugador.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    masMaldiciones: masMaldiciones ? { nombre: masMaldiciones[0], count: masMaldiciones[1] } : null,
    masDuelosGanados: masDuelos ? { nombre: masDuelos[0], count: masDuelos[1] } : null,
  };
}
