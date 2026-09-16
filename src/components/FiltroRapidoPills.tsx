import type { FiltroPersonalizado } from '../types';

interface FiltroRapidoPillsProps {
  activo: FiltroPersonalizado | null;
  onSeleccionar: (filtro: FiltroPersonalizado | 'manual') => void;
}

const opciones: { valor: FiltroPersonalizado | 'manual'; label: string }[] = [
  { valor: 'chill', label: 'Solo Chill' },
  { valor: 'picante', label: 'Solo Picante' },
  { valor: 'mezcla', label: 'Mezcla' },
  { valor: 'manual', label: 'Elegir a mano' },
];

export default function FiltroRapidoPills({ activo, onSeleccionar }: FiltroRapidoPillsProps) {
  return (
    <div className="filtro-pills">
      {opciones.map(({ valor, label }) => (
        <button
          key={valor}
          type="button"
          className={`pill ${activo === valor ? 'activo' : ''}`}
          onClick={() => onSeleccionar(valor)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
