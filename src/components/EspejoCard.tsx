import { useState } from 'react';
import type { Carta, JugadorPartida } from '../types';
import { generarListaEspejo } from '../lib/duelo';

interface EspejoCardProps {
  carta: Carta;
  jugadorOrigen: JugadorPartida;
  jugadorDestino: JugadorPartida;
  onCumplido: () => void;
}

export default function EspejoCard({ carta, jugadorOrigen, jugadorDestino, onCumplido }: EspejoCardProps) {
  const opciones = generarListaEspejo(jugadorOrigen.id);
  const [seleccion, setSeleccion] = useState<string | null>(null);

  return (
    <div className="espejo-card">
      <h3>🪞 Carta Espejo</h3>
      <p className="duelo-texto">{carta.contenido}</p>
      <p>
        <strong>{jugadorOrigen.nombre}</strong> obliga a <strong>{jugadorDestino.nombre}</strong> a:
      </p>
      <div className="espejo-opciones">
        {opciones.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`pill ${seleccion === opt ? 'activo' : ''}`}
            onClick={() => setSeleccion(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        className="btn-gradient"
        type="button"
        onClick={() => { if (seleccion) onCumplido(); }}
        disabled={!seleccion}
        style={{ opacity: seleccion ? 1 : 0.4 }}
      >
        ¡Cumplido!
      </button>
    </div>
  );
}
