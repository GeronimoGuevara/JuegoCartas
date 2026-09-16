import { useState, useCallback } from 'react';
import type { Carta } from '../types';
import { resolverVariables } from '../lib/game-logic';

interface CartaSwiperProps {
  cartas: Carta[];
  variables?: Record<string, string>;
  onRebotar?: () => void;
  onLogrado?: () => void;
}

export default function CartaSwiper({ cartas, variables, onRebotar, onLogrado }: CartaSwiperProps) {
  const [indice, setIndice] = useState(0);

  const cartaActual = cartas[indice];
  const total = cartas.length;
  const esUltima = indice === total - 1;
  const esPrimera = indice === 0;

  const irSiguiente = useCallback(() => {
    if (!esUltima) setIndice((i) => i + 1);
  }, [esUltima]);

  const irAnterior = useCallback(() => {
    if (!esPrimera) setIndice((i) => i - 1);
  }, [esPrimera]);

  if (!cartaActual) return null;

  const contenidoResuelto = resolverVariables(cartaActual.contenido, variables);
  const esMaldicion = cartaActual.config?.mecanica === 'maldicion';

  return (
    <div className="carta-swiper">
      <div className="carta-activa">
        <div className="carta-contenido">
          <span className="carta-categoria-pill">
            {cartaActual.categoria_id}
          </span>
          <p className="carta-texto">{contenidoResuelto}</p>
        </div>
        {esMaldicion && <span className="maldicion-icon">⏳</span>}
      </div>

      <div className="carta-navegacion">
        <button type="button" className="btn-navegacion" onClick={irAnterior} disabled={esPrimera}>
          ‹
        </button>
        <span className="carta-indicador">
          {indice + 1} / {total}
        </span>
        <button type="button" className="btn-navegacion" onClick={irSiguiente} disabled={esUltima}>
          ›
        </button>
      </div>

      <div className="carta-acciones">
        <button type="button" className="btn-rebotar" onClick={onRebotar}>
          Rebotar 🔁
        </button>
        <button type="button" className="btn-logrado" onClick={onLogrado}>
          Logrado ✅
        </button>
      </div>
    </div>
  );
}
