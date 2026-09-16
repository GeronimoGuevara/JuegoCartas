import { useState } from 'react';
import type { Carta, JugadorPartida } from '../types';

interface VotacionSecretaCardProps {
  carta: Carta;
  jugadores: JugadorPartida[];
  onResultado: (ganadorId: string) => void;
}

export default function VotacionSecretaCard({ carta, jugadores, onResultado }: VotacionSecretaCardProps) {
  const [votos, setVotos] = useState<Record<string, string>>({});
  const [votacionCerrada, setVotacionCerrada] = useState(false);

  const handleVotar = (jugadorId: string, opcion: string) => {
    setVotos((prev) => ({ ...prev, [jugadorId]: opcion }));
  };

  const handleCerrar = () => {
    setVotacionCerrada(true);
    const conteo = new Map<string, number>();
    Object.values(votos).forEach((v) => {
      conteo.set(v, (conteo.get(v) ?? 0) + 1);
    });
    const ganador = [...conteo.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
    onResultado(ganador);
  };

  const opciones = ['Opción A', 'Opción B', 'Opción C'];

  return (
    <div className="votacion-card">
      <h3>🗳️ Votación Secreta</h3>
      <p className="duelo-texto">{carta.contenido}</p>
      <div className="votacion-opciones">
        {opciones.map((opt) => (
          <div key={opt} className="votacion-opcion">
            <span>{opt}</span>
            <div className="votacion-botones">
              {jugadores.map((j) => (
                <button
                  key={j.id}
                  type="button"
                  className={`pill ${votos[j.id] === opt ? 'activo' : ''}`}
                  onClick={() => handleVotar(j.id, opt)}
                  disabled={votacionCerrada}
                >
                  {j.nombre}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        className="btn-gradient"
        type="button"
        onClick={handleCerrar}
        disabled={!votacionCerrada && Object.keys(votos).length < jugadores.length}
        style={{ opacity: Object.keys(votos).length >= jugadores.length ? 1 : 0.4 }}
      >
        {votacionCerrada ? 'Resultado listo' : 'Cerrar votación'}
      </button>
    </div>
  );
}
