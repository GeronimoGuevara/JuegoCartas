import type { Categoria, Carta, JugadorPartida } from '../types';
import { calcularProbabilidadPicante, actualizarRacha } from '../db/db';

export function resolverVariables(
  contenido: string,
  variables: Record<string, string> | undefined
): string {
  if (!variables) return contenido;
  return Object.entries(variables).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), value),
    contenido
  );
}

export function filtrarCartasPorIntensidad(
  cartas: Carta[],
  categorias: Categoria[],
  filtro: 'chill' | 'picante' | 'mezcla'
): Carta[] {
  const idsPorIntensidad = new Map<string, string>();
  categorias.forEach((c) => idsPorIntensidad.set(c.id, c.intensidad));

  if (filtro === 'chill') {
    return cartas.filter((c) => idsPorIntensidad.get(c.categoria_id) === 'chill');
  }
  if (filtro === 'picante') {
    return cartas.filter((c) => idsPorIntensidad.get(c.categoria_id) === 'picante');
  }
  return cartas;
}

export function mezclaPonderada(cartas: Carta[], jugadores: JugadorPartida[]): { carta: Carta; jugador: JugadorPartida }[] {
  const resultado: { carta: Carta; jugador: JugadorPartida }[] = [];
  const disponibles = [...cartas];

  jugadores.forEach((jugador) => {
    let racha = jugador.racha_picante;
    const pool: Carta[] = [];

    for (let i = 0; i < Math.min(3, disponibles.length); i++) {
      const pPicante = calcularProbabilidadPicante(racha);
      const esPicante = Math.random() < pPicante;
      racha = actualizarRacha(racha, esPicante);

      const carta = disponibles[Math.floor(Math.random() * disponibles.length)];
      pool.push(carta);
      disponibles.splice(disponibles.indexOf(carta), 1);
    }

    pool.forEach((carta) => {
      resultado.push({ carta, jugador });
    });
  });

  return resultado;
}

export function generarIdJugador(): string {
  return crypto.randomUUID();
}

export function calcularEstadisticas(
  maldicionesRecibidas: number,
  duelosGanados: number,
  duelosPerdidos: number
): { maldicionesRecibidas: number; duelosGanados: number; duelosPerdidos: number } {
  return { maldicionesRecibidas, duelosGanados, duelosPerdidos };
}
