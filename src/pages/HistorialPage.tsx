import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import OfflineBanner from '../components/OfflineBanner';
import type { SyncState } from '../hooks/useOfflineSync';
import type { PartidaActual } from '../types';

interface HistorialPageProps {
  sync: SyncState;
}

export default function HistorialPage({ sync }: HistorialPageProps) {
  const navigate = useNavigate();
  const [partidas, setPartidas] = useState<PartidaActual[]>([]);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      // Obtener todas las partidas y ordenarlas de más nueva a más vieja
      const data = await db.partida_actual.toArray();
      const ordenadas = data.sort((a, b) => b.iniciada_en - a.iniciada_en);
      if (activo) setPartidas(ordenadas);
    };
    cargar();
    return () => { activo = false; };
  }, []);

  const formatearFecha = (timestamp: number) => {
    const fecha = new Date(timestamp);
    return fecha.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getModoTexto = (partida: PartidaActual) => {
    let base = 'Modo Mezcla 🔀';
    if (partida.modo === 'personalizado') {
      base = 'Modo Personalizado 🎛️';
    } else {
      if (partida.filtro_personalizado === 'chill') base = 'Modo Chill 🧊';
      else if (partida.filtro_personalizado === 'picante') base = 'Modo Picante 🌶️';
    }
    const parejas = partida.es_modo_parejas ? ' (Parejas 💞)' : '';
    return base + parejas;
  };

  return (
    <div className="logros-page">
      <OfflineBanner sync={sync} />
      <div className="home-actions" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header className="home-header" style={{ marginBottom: '20px' }}>
          <h1>Historial de Partidas</h1>
          <p>Tus noches inolvidables</p>
        </header>

        {partidas.length === 0 ? (
          <p className="empty-state">
            Todavía no jugaste ninguna partida. ¡Ve al Inicio y empieza a jugar!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {partidas.map((p) => (
              <div 
                key={p.id} 
                className="btn-secundario-stack" 
                style={{ textAlign: 'left', padding: '16px', cursor: 'pointer' }}
                onClick={() => navigate('/resumen', { state: { partidaId: p.id } })}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--texto)', fontWeight: 600 }}>{formatearFecha(p.iniciada_en)}</span>
                  <span style={{ fontSize: '1.2rem' }}>📜</span>
                </div>
                <div style={{ color: 'var(--texto-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                  {getModoTexto(p)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
