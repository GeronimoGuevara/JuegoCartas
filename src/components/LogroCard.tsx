import type { LogroLocal } from '../types';

interface LogroCardProps {
  logro: LogroLocal;
}

export default function LogroCard({ logro }: LogroCardProps) {
  const desbloqueado = logro.desbloqueado_en !== null;

  return (
    <div className={`logro-card ${desbloqueado ? 'desbloqueado' : 'bloqueado'}`}>
      <span className="logro-icono">{desbloqueado ? '🏆' : '🔒'}</span>
      <span className="logro-nombre">{logro.nombre}</span>
      {desbloqueado && <span className="logro-progreso">Progreso: {logro.progreso}</span>}
    </div>
  );
}
