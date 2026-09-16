import type { Mazo } from '../types';
import type { Categoria } from '../types';

interface MazoCardProps {
  mazo: Mazo;
  categorias?: Categoria[];
  seleccionado?: boolean;
  onToggle?: () => void;
}

export default function MazoCard({ mazo, categorias, seleccionado, onToggle }: MazoCardProps) {
  const categoriasDelMazo = categorias?.filter((c) => c.es_pareja) ?? [];
  const tienePicante = categoriasDelMazo.some((c) => c.intensidad === 'picante');
  const borde = seleccionado
    ? '2px solid var(--magenta)'
    : tienePicante
    ? '2px solid var(--magenta)'
    : '2px solid var(--cyan)';

  return (
    <div
      className={`mazo-card ${seleccionado ? 'seleccionado' : ''}`}
      style={{ border: borde }}
      onClick={onToggle}
      role="button"
      tabIndex={0}
    >
      <span className="mazo-emoji">🎴</span>
      <h3 className="mazo-nombre">{mazo.nombre}</h3>
      <span className="mazo-conteo">({mazo.nombre.length * 60})</span>
      {seleccionado && <span className="mazo-check">✓</span>}
    </div>
  );
}
