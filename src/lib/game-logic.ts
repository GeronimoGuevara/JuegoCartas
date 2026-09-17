import { calcularProbabilidadPicante } from '../db/db';
import type { Carta, JugadorPartida, Categoria } from '../types';

export function resolverVariablesCarta(texto: string, jugadores: JugadorPartida[], turnoActual: JugadorPartida): string {
  let res = texto;
  
  if (res.includes('{jugador_al_azar}')) {
    const otros = jugadores.filter(j => j.id !== turnoActual.id);
    const elegido = otros.length > 0 ? otros[Math.floor(Math.random() * otros.length)] : turnoActual;
    res = res.replace(/\{jugador_al_azar\}/g, elegido.nombre);
  }
  
  if (res.includes('{pareja_jugando}')) {
     res = res.replace(/\{pareja_jugando\}/g, "ustedes dos");
  }

  return res;
}

export function elegirSiguienteCarta(
  cartasDisponibles: Carta[], 
  categorias: Categoria[], 
  jugadorActual: JugadorPartida,
  filtroActivo: 'chill' | 'picante' | 'mezcla' | 'manual'
): Carta | null {
  if (cartasDisponibles.length === 0) return null;

  let cartasCandidatas = [...cartasDisponibles];

  // Si es mezcla, usamos el pity-timer basado en la racha del jugador actual
  if (filtroActivo === 'mezcla') {
    const probPicante = calcularProbabilidadPicante(jugadorActual.racha_picante);
    const quierePicante = Math.random() < probPicante;

    const cartasPicantes = cartasDisponibles.filter(c => {
       const cat = categorias.find(cat => cat.id === c.categoria_id);
       return cat?.intensidad === 'picante';
    });
    
    const cartasChill = cartasDisponibles.filter(c => {
       const cat = categorias.find(cat => cat.id === c.categoria_id);
       return cat?.intensidad === 'chill';
    });

    if (quierePicante && cartasPicantes.length > 0) {
      cartasCandidatas = cartasPicantes;
    } else if (!quierePicante && cartasChill.length > 0) {
      cartasCandidatas = cartasChill;
    }
  } 
  // Filtros estrictos
  else if (filtroActivo === 'chill') {
    cartasCandidatas = cartasDisponibles.filter(c => {
       const cat = categorias.find(cat => cat.id === c.categoria_id);
       return cat?.intensidad === 'chill';
    });
  } 
  else if (filtroActivo === 'picante') {
    cartasCandidatas = cartasDisponibles.filter(c => {
       const cat = categorias.find(cat => cat.id === c.categoria_id);
       return cat?.intensidad === 'picante';
    });
  }

  // Si por los filtros nos quedamos sin cartas, usamos todas como fallback
  if (cartasCandidatas.length === 0) {
    cartasCandidatas = cartasDisponibles; 
  }

  // Elegir una al azar entre las candidatas
  const index = Math.floor(Math.random() * cartasCandidatas.length);
  return cartasCandidatas[index];
}
