import { useMaldicionTimer } from '../hooks/useMaldicionTimer';
import type { JugadorPartida } from '../types';

interface MaldicionTimerProps {
  jugador: JugadorPartida;
}

export default function MaldicionTimer({ jugador }: MaldicionTimerProps) {
  const { efectos, tieneEfecto } = useMaldicionTimer(jugador.id);

  if (!tieneEfecto(jugador.id)) return null;

  return (
    <div className="maldicion-timer">
      {efectos.map((e) => (
        <div key={e.id} className="maldicion-icono-flotante">
          <span className="maldicion-timer-icon">⏳</span>
          <span className="maldicion-timer-text">
            {e.rondas_restantes} rondas restantes
          </span>
        </div>
      ))}
    </div>
  );
}
