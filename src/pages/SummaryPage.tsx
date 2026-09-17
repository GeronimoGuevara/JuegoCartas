import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, getEstadisticasPartida, getCartasRecordadas, getPartidaActual, getJugadoresDePartida } from '../db/db';
import type { EstadisticaPartida, CartaRecordada, JugadorPartida } from '../types';
import type { SyncState } from '../hooks/useOfflineSync';
import OfflineBanner from '../components/OfflineBanner';
import ResumenNocheCard from '../components/ResumenNocheCard';

interface SummaryPageProps {
  sync: SyncState;
}

export default function SummaryPage({ sync }: SummaryPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [partidaId, setPartidaId] = useState<string>('');
  const [jugadoresTotales, setJugadoresTotales] = useState<number>(0);
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

  const handleGuardarRecuerdos = async () => {
    const top3 = cartasRecordadas.slice(0, 3);
    for (const c of top3) {
      await db.cartas_recordadas.put(c);
    }
    navigate('/');
  };

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
  const maxDuelos = estadisticas.length > 0
    ? estadisticas.reduce((a, b) => a.duelos_ganados > b.duelos_ganados ? a : b)
    : null;

  const totalJugadas = estadisticas.reduce((acc, curr) => acc + (curr.duelos_ganados || 0), 0);

  const nombreMasMaldiciones = maxMaldiciones && maxMaldiciones.maldiciones_recibidas > 0 ? nombres[maxMaldiciones.jugador_id] : null;
  const nombreMasDuelos = maxDuelos && maxDuelos.duelos_ganados > 0 ? nombres[maxDuelos.jugador_id] : null;

  return (
    <div className="home-screen">
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
          {nombreMasMaldiciones ? (
            <ResumenNocheCard titulo="Más maldiciones" valor={nombreMasMaldiciones} icono="💀" />
          ) : (
            <ResumenNocheCard titulo="Cartas jugadas" valor={totalJugadas} icono="🃏" />
          )}
          {nombreMasDuelos ? (
            <ResumenNocheCard titulo="MVP (Más jugadas)" valor={nombreMasDuelos} icono="🏆" />
          ) : (
            <ResumenNocheCard titulo="Sincronía" valor="100%" icono="💞" />
          )}
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

        <button className="btn-jugar-inicio" type="button" onClick={handleGuardarRecuerdos} style={{ marginTop: 'auto', marginBottom: '20px' }}>
          Guardar recuerdos
        </button>
      </div>
    </div>
  );
}
