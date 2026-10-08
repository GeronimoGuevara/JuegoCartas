import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, getEstadisticasPartida, getCartasRecordadas, getPartidaActual, getJugadoresDePartida } from '../db/db';
import type { EstadisticaPartida, CartaRecordada } from '../types';
import type { SyncState } from '../hooks/useOfflineSync';
import OfflineBanner from '../components/OfflineBanner';
import ResumenNocheCard from '../components/ResumenNocheCard';
import { chequearLogros } from '../lib/gamification';

interface SummaryPageProps {
  sync: SyncState;
}

export default function SummaryPage({ sync }: SummaryPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [_partidaId, setPartidaId] = useState<string>('');
  const [_jugadoresTotales, setJugadoresTotales] = useState<number>(0);
  const [estadisticas, setEstadisticas] = useState<EstadisticaPartida[]>([]);
  const [cartasRecordadas, setCartasRecordadas] = useState<CartaRecordada[]>([]);
  const [cargando, setCargando] = useState(true);

  const [nombres, setNombres] = useState<Record<string, string>>({});

  useEffect(() => {
    let activo = true;
    const init = async () => {
      let pId = location.state?.partidaId;
      if (!pId) {
        const pActual = await getPartidaActual();
        if (pActual) pId = pActual.id;
      }

      if (!pId) {
        if (activo) navigate('/setup');
        return;
      }

      const stats = await getEstadisticasPartida(pId);
      const recordadas = await getCartasRecordadas(pId);
      const jugadores = await getJugadoresDePartida(pId);
      
      // Chequear logros para todos al finalizar la noche
      for (const j of jugadores) {
        await chequearLogros(j.id);
      }
      
      if (!activo) return;
      setPartidaId(pId);
      setJugadoresTotales(jugadores.length);
      setEstadisticas(stats);
      setCartasRecordadas(recordadas);
      setCargando(false);
    };
    init();
    return () => { activo = false; };
  }, [location.state, navigate]);

  useEffect(() => {
    if (estadisticas.length === 0) return;
    let activo = true;
    
    const getNombreJugador = async (jugadorId: string): Promise<string> => {
      const j = await db.jugadores_partida.get(jugadorId);
      return j?.nombre ?? jugadorId;
    };

    const cargarNombres = async () => {
      const ids = [...new Set([...estadisticas.map((s) => s.jugador_id)])];
      const nombresMap: Record<string, string> = {};
      for (const id of ids) {
        nombresMap[id] = await getNombreJugador(id);
      }
      if (activo) setNombres(nombresMap);
    };
    cargarNombres();
    return () => { activo = false; };
  }, [estadisticas]);



  if (cargando) {
    return (
      <div className="home-screen">
        <OfflineBanner sync={sync} />
        <p style={{ color: 'var(--texto-muted)', marginTop: '50px' }}>Preparando resumen…</p>
      </div>
    );
  }

  const maxMaldiciones = estadisticas.length > 0
    ? estadisticas.reduce((a, b) => a.maldiciones_recibidas > b.maldiciones_recibidas ? a : b)
    : null;

  const maxCumplidas = estadisticas.length > 0
    ? estadisticas.reduce((a, b) => (a.cartas_cumplidas || 0) > (b.cartas_cumplidas || 0) ? a : b)
    : null;

  const maxRebotadas = estadisticas.length > 0
    ? estadisticas.reduce((a, b) => (a.cartas_rebotadas || 0) > (b.cartas_rebotadas || 0) ? a : b)
    : null;

  const totalJugadas = estadisticas.reduce((acc, curr) => 
    acc + (curr.cartas_cumplidas || 0) + (curr.cartas_rebotadas || 0), 0);

  const nombreMasMaldiciones = maxMaldiciones && maxMaldiciones.maldiciones_recibidas > 0 ? nombres[maxMaldiciones.jugador_id] : null;
  const nombreMasCumplidor = maxCumplidas && (maxCumplidas.cartas_cumplidas || 0) > 0 ? nombres[maxCumplidas.jugador_id] : null;
  const nombreMasRebotador = maxRebotadas && (maxRebotadas.cartas_rebotadas || 0) > 0 ? nombres[maxRebotadas.jugador_id] : null;

  return (
    <div className="home-screen" style={{ overflow: 'hidden' }}>
      <OfflineBanner sync={sync} />
      <div className="page-hero-bg">
        <img src="/maze-hero.jpg" alt="Fondo Resumen" />
      </div>

      <div className="home-actions" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header className="home-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1>🎉 Noche Terminada</h1>
          <p>¡Esto es lo que pasó!</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '30px' }}>
          <ResumenNocheCard titulo="Cartas jugadas" valor={totalJugadas} icono="🃏" />
          <ResumenNocheCard titulo="MVP (Cumplió +)" valor={nombreMasCumplidor || '-'} icono="🏆" />
          <ResumenNocheCard titulo="Más gallina (Rebotó +)" valor={nombreMasRebotador || '-'} icono="🐔" />
          <ResumenNocheCard titulo="Más maldito" valor={nombreMasMaldiciones || '-'} icono="💀" />
        </div>

        {cartasRecordadas.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Cartas recordadas</h2>
            {cartasRecordadas.slice(0, 3).map((c) => (
              <div key={c.id} className="btn-secundario-stack" style={{ marginBottom: '8px' }}>
                <span className="btn-text">{c.carta_id}</span>
              </div>
            ))}
          </div>
        )}

        <button className="btn-jugar-inicio" type="button" onClick={() => navigate('/')} style={{ marginTop: 'auto', marginBottom: '20px' }}>
          Volver al Menú Principal
        </button>
      </div>
    </div>
  );
}
