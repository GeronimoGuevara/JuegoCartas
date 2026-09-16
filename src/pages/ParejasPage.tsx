import { useNavigate } from 'react-router-dom';
import { crearPartidaActual } from '../db/db';
import ModoParejasCard from '../components/ModoParejasCard';
import OfflineBanner from '../components/OfflineBanner';
import BottomNav from '../components/BottomNav';
import type { SyncState } from '../hooks/useOfflineSync';

interface ParejasPageProps {
  sync: SyncState;
}

export default function ParejasPage({ sync }: ParejasPageProps) {
  const navigate = useNavigate();

  const handleSeleccionar = async (tipo: 'picante-suave' | 'romantico') => {
    const partida = await crearPartidaActual({
      id: crypto.randomUUID(),
      modo: 'personalizado',
      es_modo_parejas: true,
      categorias_activas: [],
      iniciada_en: Date.now(),
    });
    navigate('/setup', { state: { mazosSeleccionados: [], filtro: tipo, esModoParejas: true, partidaId: partida } });
  };

  return (
    <div className="parejas-page">
      <OfflineBanner sync={sync} />
      <header className="home-header">
        <h1>Modo Parejas</h1>
      </header>
      <ModoParejasCard
        mazosPicanteSuave={[]}
        mazosRomantico={[]}
        onSeleccionar={handleSeleccionar}
      />
      <BottomNav />
    </div>
  );
}
