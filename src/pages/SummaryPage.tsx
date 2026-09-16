import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../db/db';
import { getEstadisticasPartida, getCartasRecordadas } from '../db/db';
import type { EstadisticaPartida, CartaRecordada } from '../types';
import type { SyncState } from '../hooks/useOfflineSync';
import OfflineBanner from '../components/OfflineBanner';
import BottomNav from '../components/BottomNav';
import ResumenNocheCard from '../components/ResumenNocheCard';

interface SummaryPageProps {
  sync: SyncState;
}

interface SummaryState {
  partidaId: string;
  jugadores: string[];
}

export default function SummaryPage({ sync }: SummaryPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const summaryState = (location.state as SummaryState | null) ?? { partidaId: '', jugadores: [] };
  const [estadisticas, setEstadisticas] = useState<EstadisticaPartida[]>([]);
  const [cartasRecordadas, setCartasRecordadas] = useState<CartaRecordada[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    const init = async () => {
      const stats = await getEstadisticasPartida(summaryState.partidaId);
      const recordadas = await getCartasRecordadas(summaryState.partidaId);
      if (!activo) return;
      setEstadisticas(stats);
      setCartasRecordadas(recordadas);
      setCargando(false);
    };
    init();
    return () => { activo = false; };
  }, [summaryState.partidaId]);

  const handleGuardarRecuerdos = async () => {
    const top3 = cartasRecordadas.slice(0, 3);
    for (const c of top3) {
      await db.cartas_recordadas.put(c);
    }
    navigate('/');
  };

  if (cargando) {
    return (
      <div className="summary-page">
        <OfflineBanner sync={sync} />
        <p className="home-mazos-estado">Preparando resumen…</p>
        <BottomNav />
      </div>
    );
  }

  const maxMaldiciones = estadisticas.length > 0
    ? estadisticas.reduce((a, b) => a.maldiciones_recibidas > b.maldiciones_recibidas ? a : b)
    : null;
  const maxDuelos = estadisticas.length > 0
    ? estadisticas.reduce((a, b) => a.duelos_ganados > b.duelos_ganados ? a : b)
    : null;

  const getNombreJugador = async (jugadorId: string): Promise<string> => {
    const j = await db.jugadores_partida.get(jugadorId);
    return j?.nombre ?? jugadorId;
  };

  const [nombres, setNombres] = useState<Record<string, string>>({});

  useEffect(() => {
    let activo = true;
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

  const nombreMasMaldiciones = maxMaldiciones ? nombres[maxMaldiciones.jugador_id] : null;
  const nombreMasDuelos = maxDuelos ? nombres[maxDuelos.jugador_id] : null;

  return (
    <div className="summary-page">
      <OfflineBanner sync={sync} />
      <header className="home-header">
        <h1>🎉 Resumen de la Noche</h1>
      </header>

      <div className="resumen-grid">
        {nombreMasMaldiciones && (
          <ResumenNocheCard
            titulo="Más maldiciones"
            valor={nombreMasMaldiciones}
            icono="💀"
          />
        )}
        {nombreMasDuelos && (
          <ResumenNocheCard
            titulo="Más duelos ganados"
            valor={nombreMasDuelos}
            icono="🏆"
          />
        )}
        <ResumenNocheCard
          titulo="Mazos usados"
          valor={summaryState.jugadores.length}
          icono="🃏"
        />
        <ResumenNocheCard
          titulo="Cartas recordadas"
          valor={cartasRecordadas.length}
          icono="📝"
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <h2 className="resumen-titulo-general">Cartas más graciosas de la noche</h2>
        {cartasRecordadas.slice(0, 3).map((c) => (
          <div key={c.id} className="nombre-jugador">
            <span>{c.carta_id}</span>
          </div>
        ))}
      </div>

      <button className="btn-guardar-recuerdos" type="button" onClick={handleGuardarRecuerdos}>
        Guardar recuerdos
      </button>

      <BottomNav />
    </div>
  );
}
