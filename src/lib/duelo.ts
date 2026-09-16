import type { Carta, JugadorPartida } from '../types';

export interface DueloResult {
  ganadorId: string;
  perdedorId: string;
  puntajeGanador: number;
  puntajePerdedor: number;
}

export function resolverDuelo(
  jugador1: JugadorPartida,
  jugador2: JugadorPartida,
  _carta: Carta
): DueloResult {
  const puntaje1 = calcularPuntaje(jugador1, _carta);
  const puntaje2 = calcularPuntaje(jugador2, _carta);

  if (puntaje1 >= puntaje2) {
    return {
      ganadorId: jugador1.id,
      perdedorId: jugador2.id,
      puntajeGanador: puntaje1,
      puntajePerdedor: puntaje2,
    };
  }
  return {
    ganadorId: jugador2.id,
    perdedorId: jugador1.id,
    puntajeGanador: puntaje2,
    puntajePerdedor: puntaje1,
  };
}

function calcularPuntaje(jugador: JugadorPartida, _carta: Carta): number {
  const base = Math.random() * 10;
  const rachaBonus = jugador.racha_picante * 2;
  return Math.round(base + rachaBonus);
}

export function generarListaEspejo(_jugadorId: string): string[] {
  const opciones = [
    'Bailar como loco',
    'Susurrar un secreto',
    'Hacer una pose graciosa',
    'Cantar una canción',
    'Imitar un animal',
    'Contar un chiste malo',
  ];
  return opciones.sort(() => Math.random() - 0.5).slice(0, 3);
}

export function calcularTermometro(): { jugador1: number; jugador2: number } {
  return {
    jugador1: Math.floor(Math.random() * 10) + 1,
    jugador2: Math.floor(Math.random() * 10) + 1,
  };
}

export function calcularSincronia(t1: number, t2: number): number {
  const diff = Math.abs(t1 - t2);
  return Math.round((1 - diff / 10) * 100);
}
