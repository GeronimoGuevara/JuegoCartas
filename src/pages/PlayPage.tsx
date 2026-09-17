import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, getCartasParaPartida, getPartidaActual, getJugadoresDePartida } from '../db/db';
import { elegirSiguienteCarta, resolverVariablesCarta } from '../lib/game-logic';
import type { Carta, Categoria, JugadorPartida, PartidaActual, EstadisticaPartida } from '../types';
import CartaSwiper from '../components/CartaSwiper';
import { AnimatePresence } from 'framer-motion';

export default function PlayPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [partida, setPartida] = useState<PartidaActual | null>(null);
  const [jugadores, setJugadores] = useState<JugadorPartida[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cartasDisponibles, setCartasDisponibles] = useState<Carta[]>([]);
  
  const [cartaActual, setCartaActual] = useState<Carta | null>(null);
  const [turnoIndex, setTurnoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Carga inicial
  useEffect(() => {
    async function init() {
      try {
        let pId = location.state?.partidaId;
        if (!pId) {
          const pActual = await getPartidaActual();
          if (pActual) pId = pActual.id;
        }

        if (!pId) {
          navigate('/setup');
          return;
        }

        const p = await db.partida_actual.get(pId);
        if (!p) throw new Error("Partida no encontrada");
        setPartida(p);

        const j = await getJugadoresDePartida(pId);
        setJugadores(j);

        const cats = await db.categorias.toArray();
        setCategorias(cats);

        // Buscar todas las cartas del mazo base (luego se puede mejorar para usar p.categorias_activas)
        const mazosSeleccionados = ['mazo-base-parejas-1']; // Hardcoded temporalmente, o sacar de settings
        const cartas = await getCartasParaPartida(mazosSeleccionados, p.categorias_activas.length > 0 ? p.categorias_activas : undefined);
        setCartasDisponibles(cartas);

        setIsLoading(false);
      } catch (error) {
        console.error(error);
        navigate('/setup');
      }
    }
    init();
  }, [location.state, navigate]);

  // Elegir carta cuando ya cargaron los datos
  useEffect(() => {
    if (!isLoading && cartasDisponibles.length > 0 && jugadores.length > 0 && !cartaActual) {
      sacarNuevaCarta(turnoIndex);
    }
  }, [isLoading, cartasDisponibles, jugadores, cartaActual, turnoIndex]);

  const sacarNuevaCarta = (idx: number) => {
    if (!partida || cartasDisponibles.length === 0) return;
    
    const jugadorActual = jugadores[idx];
    const nueva = elegirSiguienteCarta(
      cartasDisponibles, 
      categorias, 
      jugadorActual, 
      partida.filtro_personalizado || 'mezcla'
    );
    setCartaActual(nueva);
  };

  const handleSiguienteTurno = async (fueCumplido: boolean) => {
    const jugadorActual = jugadores[turnoIndex];

    if (fueCumplido && partida && cartaActual) {
      // Guardar estadística de carta cumplida
      const statsExisten = await db.estadisticas_partida
        .where('partida_id').equals(partida.id)
        .and(s => s.jugador_id === jugadorActual.id)
        .first();
        
      if (statsExisten) {
        await db.estadisticas_partida.update(statsExisten.id!, { duelos_ganados: statsExisten.duelos_ganados + 1 });
      } else {
        await db.estadisticas_partida.add({
          partida_id: partida.id,
          jugador_id: jugadorActual.id,
          maldiciones_recibidas: 0,
          duelos_ganados: 1,
          duelos_perdidos: 0,
        });
      }
    }
    
    // Avanzar turno
    const siguienteIndex = (turnoIndex + 1) % jugadores.length;
    setTurnoIndex(siguienteIndex);
    
    // Para que la animación de salida termine antes de renderizar la nueva
    setCartaActual(null); 
    
    setTimeout(() => {
      sacarNuevaCarta(siguienteIndex);
    }, 250); // delay sutil para la animación
  };

  const handleFinalizar = () => {
    if (partida) {
      navigate('/resumen', { state: { partidaId: partida.id } });
    }
  };

  if (isLoading || !partida || jugadores.length === 0) {
    return <div className="home-screen" style={{ justifyContent: 'center' }}>Cargando la noche...</div>;
  }

  const jugadorActual = jugadores[turnoIndex];
  const catActual = cartaActual ? categorias.find(c => c.id === cartaActual.categoria_id) : undefined;
  const textoResuelto = cartaActual ? resolverVariablesCarta(cartaActual.contenido, jugadores, jugadorActual) : '';

  return (
    <div className="home-screen" style={{ overflow: 'hidden' }}>
      <div className="page-hero-bg" style={{ opacity: 0.3 }}>
        <img src="/maze-hero.jpg" alt="Fondo Juego" />
      </div>

      <header style={{ padding: '20px', textAlign: 'center', zIndex: 10, width: '100%', position: 'relative' }}>
        <button 
          onClick={handleFinalizar}
          style={{ 
            position: 'absolute', 
            right: '16px', 
            top: '16px', 
            background: 'rgba(226, 27, 60, 0.15)', 
            border: '1px solid var(--rojo-fuerte)', 
            color: 'var(--rojo-fuerte)', 
            padding: '8px 14px', 
            borderRadius: '999px', 
            fontSize: '0.85rem', 
            fontWeight: 700, 
            cursor: 'pointer', 
            boxShadow: '0 0 15px rgba(226, 27, 60, 0.4)' 
          }}
        >
          Terminar 🛑
        </button>
        <p style={{ color: 'var(--ambar)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', margin: 0 }}>
          Turno de
        </p>
        <h1 style={{ margin: '5px 0 0', fontSize: '2rem', textShadow: '0 0 10px rgba(255,158,0,0.5)' }}>
          {jugadorActual.nombre}
        </h1>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 10, width: '100%', padding: '20px' }}>
        <AnimatePresence mode="wait">
          {cartaActual && (
            <CartaSwiper
              key={cartaActual.id}
              carta={cartaActual}
              categoria={catActual}
              textoResuelto={textoResuelto}
              onCumplido={() => handleSiguienteTurno(true)}
              onRebotar={() => handleSiguienteTurno(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
