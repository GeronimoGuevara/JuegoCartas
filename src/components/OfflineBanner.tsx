import type { SyncState } from '../hooks/useOfflineSync';

interface OfflineBannerProps {
  sync: SyncState;
}

export default function OfflineBanner({ sync }: OfflineBannerProps) {
  if (sync.isOnline && !sync.isSyncing && sync.pendientes === 0) {
    return null;
  }

  return (
    <div className={`banner-conexion flotante ${sync.isOnline ? 'online' : 'offline'}`}>
      <span>{sync.isOnline ? '🟢 CONECTADO' : 'Solo tú y tu pareja (Offline) 📡'}</span>
      {sync.pendientes > 0 && (
        <span className="banner-pendientes">
          {sync.isSyncing ? ' (Sincronizando…)' : ` (${sync.pendientes})`}
        </span>
      )}
    </div>
  );
}
