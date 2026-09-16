import { useState } from 'react';
import type { Carta, JugadorPartida } from '../types';
import { calcularSincronia } from '../lib/duelo';

interface TermometroCardProps {
  carta: Carta;
  jugador1: JugadorPartida;
  jugador2: JugadorPartida;
  onResultado: (sincronia: number) => void;
}

export default function TermometroCard({ carta, jugador1, jugador2, onResultado }: TermometroCardProps) {
  const [votos, setVotos] = useState<{ j1: number | null; j2: number | null }>({ j1: null, j2: null });
  const [revelado, setRevelado] = useState(false);

  const handleVotar = (jugadorId: string, valor: number) => {
    setVotos((prev) => ({
      ...prev,
      [jugadorId === jugador1.id ? 'j1' : 'j2']: valor,
    }));
  };

  const handleRevelar = () => {
    if (votos.j1 !== null && votos.j2 !== null) {
      const sincronia = calcularSincronia(votos.j1, votos.j2);
      onResultado(sincronia);
      setRevelado(true);
    }
  };

  return (
    <div className="termometro-card">
      <h3>🌡️ Termómetro</h3>
      <p className="duelo-texto">{carta.contenido}</p>
      <div className="termometro-jugadores">
        <div className="termometro-jugador">
          <span>{jugador1.nombre}</span>
          <div className="termometro-escala">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                className={`termometro-btn ${votos.j1 === n ? 'seleccionado' : ''}`}
                onClick={() => handleVotar(jugador1.id, n)}
                disabled={revelado}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="termometro-jugador">
          <span>{jugador2.nombre}</span>
          <div className="termometro-escala">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                className={`termometro-btn ${votos.j2 === n ? 'seleccionado' : ''}`}
                onClick={() => handleVotar(jugador2.id, n)}
                disabled={revelado}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        className="btn-gradient"
        type="button"
        onClick={handleRevelar}
        disabled={votos.j1 === null || votos.j2 === null || revelado}
        style={{ opacity: (votos.j1 !== null && votos.j2 !== null && !revelado) ? 1 : 0.4 }}
      >
        {revelado ? 'Revelado' : 'Revelar ambos'}
      </button>
      {revelado && (
        <div className="termometro-resultado">
          💞 Sincronía: {calcularSincronia(votos.j1!, votos.j2!)}%
        </div>
      )}
    </div>
  );
}
