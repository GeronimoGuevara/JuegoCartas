import { useEffect, useState } from 'react';
import { useMotionSensor } from '../hooks/useMotionSensor';

interface MotionRefereeProps {
  duracionMs: number;
  onCompletado: (estable: boolean) => void;
}

export default function MotionReferee({ duracionMs, onCompletado }: MotionRefereeProps) {
  const { isMonitoring, isStable, startMonitoring, stopMonitoring } = useMotionSensor();
  const [tiempoRestante, setTiempoRestante] = useState(Math.ceil(duracionMs / 1000));

  useEffect(() => {
    if (!isMonitoring) return;
    const interval = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          stopMonitoring();
          onCompletado(isStable);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isMonitoring, isStable, stopMonitoring, onCompletado]);

  const handleStart = () => {
    startMonitoring();
    setTiempoRestante(Math.ceil(duracionMs / 1000));
  };

  return (
    <div className="motion-referee">
      <h3>📱 El teléfono es el árbitro</h3>
      <p>Sostén el teléfono quieto durante {duracionMs / 1000}s sin temblar</p>
      <button
        className="btn-gradient"
        type="button"
        onClick={handleStart}
        disabled={isMonitoring}
      >
        {isMonitoring ? `⏳ ${tiempoRestante}s restantes` : '¡Listo!'}
      </button>
      {isMonitoring && (
        <div className={`motion-indicador ${isStable ? 'estable' : 'inestable'}`}>
          {isStable ? '🟢 Estás quieto' : '🔴 Te estás moviendo'}
        </div>
      )}
    </div>
  );
}
