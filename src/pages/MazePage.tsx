import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import type { Mazo, Categoria } from '../types';
import type { SyncState } from '../hooks/useOfflineSync';
import OfflineBanner from '../components/OfflineBanner';
import MazoCard from '../components/MazoCard';
import FiltroRapidoPills from '../components/FiltroRapidoPills';
import type { FiltroPersonalizado } from '../types';

interface MazePageProps {
  sync: SyncState;
}

export default function MazePage({ sync }: MazePageProps) {
  const navigate = useNavigate();
  const [mazos, setMazos] = useState<Mazo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [mazosSeleccionados, setMazosSeleccionados] = useState<string[]>([]);
  const [filtro, setFiltro] = useState<FiltroPersonalizado | null>(null);
  const [modoOffline, setModoOffline] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    db.mazos.toArray().then((data) => {
      if (!activo) return;
      setMazos(data);
    });
    db.categorias.toArray().then((data) => {
      if (!activo) return;
      setCategorias(data);
    });
    db.cartas.count().finally(() => {
      if (activo) setCargando(false);
    });
    return () => { activo = false; };
  }, []);

  const toggleMazo = (mazoId: string) => {
    setMazosSeleccionados((prev) =>
      prev.includes(mazoId) ? prev.filter((id) => id !== mazoId) : [...prev, mazoId]
    );
  };

  const puedeEmpezar = mazosSeleccionados.length > 0;

  const handleEmpezar = () => {
    if (!puedeEmpezar) return;
    navigate('/setup', { state: { mazosSeleccionados, filtro } });
  };

  return (
    <div className="maze-page">
      <OfflineBanner sync={sync} />

      <div className="page-hero-bg">
        <img src="/maze-hero.jpg" alt="Mazos" />
      </div>

      <div className="home-actions" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header className="home-header">
          <h1>Mis Mazos</h1>
          <p>Elegí los mazos para tu partida</p>
        </header>

        <div className="toggle-offline">
          <label>
            <input type="checkbox" checked={modoOffline} onChange={() => setModoOffline(!modoOffline)} />
            Modo Offline
          </label>
        </div>

      <FiltroRapidoPills activo={filtro} onSeleccionar={(f) => setFiltro(f as FiltroPersonalizado | 'manual')} />

      {cargando ? (
        <p className="empty-state">Cargando mazos…</p>
      ) : mazos.length === 0 ? (
        <p className="empty-state">
          Todavía no hay mazos descargados. Conectate una vez para traer el mazo base desde Supabase; después la app funciona sin red.
        </p>
      ) : (
        <div className="home-mazos-grid">
          {mazos.map((mazo) => (
            <MazoCard
              key={mazo.id}
              mazo={mazo}
              categorias={categorias}
              seleccionado={mazosSeleccionados.includes(mazo.id)}
              onToggle={() => toggleMazo(mazo.id)}
            />
          ))}
        </div>
      )}

      <button
        className="btn-jugar-inicio"
        type="button"
        onClick={handleEmpezar}
        disabled={!puedeEmpezar}
        style={{ opacity: puedeEmpezar ? 1 : 0.4, marginTop: 'auto', marginBottom: '20px' }}
      >
        ¡Empezar Partida! 🔥
      </button>
      </div>
    </div>
  );
}
