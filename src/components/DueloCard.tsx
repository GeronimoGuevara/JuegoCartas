import { useState } from 'react';
import type { Carta, JugadorPartida } from '../types';
import { resolverDuelo } from '../lib/duelo';

interface DueloCardProps {
  carta: Carta;
  jugador1: JugadorPartida;
  jugador2: JugadorPartida;
  onResultado: (resultado: { ganador: JugadorPartida; perdedor: JugadorPartida }) => void;
}

export default function DueloCard({ carta, jugador1, jugador2, onResultado }: DueloCardProps) {
  const [cargando, setCargando] = useState(false);

  const handleCompetir = () => {
    setCargando(true);
    const resultado = resolverDuelo(jugador1, jugador2, carta);
    const ganador = resultado.ganadorId === jugador1.id ? jugador1 : jugador2;
    const perdedor = resultado.ganadorId === jugador1.id ? jugador2 : jugador1;
    setTimeout(() => {
      onResultado({ ganador, perdedor });
      setCargando(false);
    }, 1500);
  };

  return (
    <div className="duelo-card">
      <h3>⚡ Duelo Relámpago</h3>
      <p className="duelo-texto">{carta.contenido}</p>
      <div className="duelo-jugadores">
        <div className="duelo-jugador">
          <span>{jugador1.nombre}</span>
          <div className="duelo-timer">3</div>
        </div>
        <span className="duelo-vs">VS</span>
        <div className="duelo-jugador">
          <span>{jugador2.nombre}</span>
          <div className="duelo-timer">3</div>
        </div>
      </div>
      <button
        className="btn-gradient"
        type="button"
        onClick={handleCompetir}
        disabled={cargando}
      >
        {cargando ? 'Resolviendo…' : '¡Competir!'}
      </button>
    </div>
  );
}
