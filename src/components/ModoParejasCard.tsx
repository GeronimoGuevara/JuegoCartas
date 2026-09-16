import type { Mazo } from '../types';

interface ModoParejasCardProps {
  mazosPicanteSuave: Mazo[];
  mazosRomantico: Mazo[];
  onSeleccionar: (tipo: 'picante-suave' | 'romantico') => void;
}

export default function ModoParejasCard({ mazosPicanteSuave, mazosRomantico, onSeleccionar }: ModoParejasCardProps) {
  return (
    <div className="modo-parejas">
      <h2>💞 Modo Parejas 1v1</h2>
      <div className="parejas-opciones">
        <button className="btn-gradient" type="button" onClick={() => onSeleccionar('picante-suave')}>
          🔥 Picante Suave ({mazosPicanteSuave.length} mazos)
        </button>
        <button className="btn-gradient" type="button" onClick={() => onSeleccionar('romantico')}>
          💖 Romántico ({mazosRomantico.length} mazos)
        </button>
      </div>
    </div>
  );
}
