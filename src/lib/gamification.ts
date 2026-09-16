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
    sincronia_pareja: sincroniaPareja ?? null,
  });
}

export async function chequearLogros(jugadorId: string): Promise<LogroLocal[]> {
  const stats = await db.estadisticas_partida.where('jugador_id').equals(jugadorId).toArray();
  const nuevosLogros: LogroLocal[] = [];

  const totalMaldiciones = stats.reduce((a, b) => a + b.maldiciones_recibidas, 0);
  const totalDuelos = stats.reduce((a, b) => a + b.duelos_ganados, 0);

  if (totalMaldiciones >= 3) {
    nuevosLogros.push({
      id: crypto.randomUUID(),
      nombre: 'Sobrevivió 3 bombas de tiempo seguidas',
      desbloqueado_en: Date.now(),
      progreso: totalMaldiciones,
    });
  }

  if (totalDuelos >= 3) {
    nuevosLogros.push({
      id: crypto.randomUUID(),
      nombre: 'Impostor perfecto 3 veces',
      desbloqueado_en: Date.now(),
      progreso: totalDuelos,
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
