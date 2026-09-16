import { useEffect, useState } from 'react';
import { getLogrosDesbloqueados } from '../db/db';
import LogroCard from '../components/LogroCard';
import OfflineBanner from '../components/OfflineBanner';
import type { SyncState } from '../hooks/useOfflineSync';
import type { LogroLocal } from '../types';

interface LogrosPageProps {
  sync: SyncState;
}

export default function LogrosPage({ sync }: LogrosPageProps) {
  const [logros, setLogros] = useState<LogroLocal[]>([]);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      const data = await getLogrosDesbloqueados();
      if (activo) setLogros(data);
    };
    cargar();
    return () => { activo = false; };
  }, []);

  return (
    <div className="logros-page">
      <OfflineBanner sync={sync} />
      <div className="home-actions" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header className="home-header">
          <h1>Logros Desbloqueados</h1>
        </header>

        {logros.length === 0 ? (
          <p className="empty-state">
            Todavía no tienes logros desbloqueados. ¡Sigue jugando!
          </p>
        ) : (
          logros.map((l) => <LogroCard key={l.id} logro={l} />)
        )}
      </div>
    </div>
  );
}
