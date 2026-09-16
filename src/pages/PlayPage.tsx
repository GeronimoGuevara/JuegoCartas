import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../db/db';
import { calcularProbabilidadPicante, actualizarRacha } from '../db/db';
import type { Carta, JugadorPartida } from '../types';
import type { SyncState } from '../hooks/useOfflineSync';
import OfflineBanner from '../components/OfflineBanner';
import BottomNav from '../components/BottomNav';
import CartaSwiper from '../components/CartaSwiper';
import MaldicionTimer from '../components/MaldicionTimer';
import DueloCard from '../components/DueloCard';
import TermometroCard from '../components/TermometroCard';
import EspejoCard from '../components/EspejoCard';
import VotacionSecretaCard from '../components/VotacionSecretaCard';

interface PlayPageProps {
  sync: SyncState;
}

type Mecanica = 'estandar' | 'maldicion' | 'duelo' | 'espejo' | 'termometro' | 'votacion_secreta';

export default function PlayPage({ sync }: PlayPageProps) {
  const location = useLocation();
  const playState = (location.state as { partidaId: string; jugadores: JugadorPartida[] } | null) ?? { partidaId: '', jugadores: [] };
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [cartasParaJugador, setCartasParaJugador] = useState<Carta[]>([]);
  const [racha, setRacha] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [modoMecanica, setModoMecanica] = useState<Mecanica>('estandar');
  const [dueloResultado, setDueloResultado] = useState<{ ganador: JugadorPartida; perdedor: JugadorPartida } | null>(null);
  const [termometroSincronia, setTermometroSincronia] = useState<number | null>(null);
  const [votacionGanador, setVotacionGanador] = useState<string | null>(null);

  const jugadorActual = playState.jugadores[0];

  useEffect(() => {
    let activo = true;
    const init = async () => {
      const cartasData = await db.cartas.toArray();
      const jugsData = await db.jugadores_partida.where('partida_id').equals(playState.partidaId).sortBy('orden');

      if (!activo) return;

      if (cartasData.length > 0 && jugsData.length > 0) {
        setCartas(cartasData);
        const pPicante = calcularProbabilidadPicante(jugsData[0].racha_picante);
        const pool = cartasData.filter(() => Math.random() < pPicante);
        const seleccionadas = pool.slice(0, 3);
        setCartasParaJugador(seleccionadas.length > 0 ? seleccionadas : cartasData.slice(0, 3));
      }
      setCargando(false);
    };
    init();
    return () => { activo = false; };
  }, [playState.partidaId]);

  const handleCartaSiguiente = () => {
    const nuevaRacha = racha + 1;
    const pPicante = calcularProbabilidadPicante(nuevaRacha);
    const fuePicante = Math.random() < pPicante;
    setRacha(actualizarRacha(nuevaRacha, fuePicante));

    const pool = cartas.filter((c): boolean => !cartasParaJugador.includes(c));
    const nuevas = pool.slice(0, Math.min(3, pool.length));
    setCartasParaJugador(nuevas.length > 0 ? nuevas : pool.slice(0, 3));
    setDueloResultado(null);
    setTermometroSincronia(null);
    setVotacionGanador(null);
  };

  const handleMecanica = (mecanica: Mecanica) => {
    setModoMecanica(mecanica);
  };

  if (cargando) {
    return (
      <div className="play-page">
        <OfflineBanner sync={sync} />
        <p className="home-mazos-estado">Repartiendo cartas…</p>
        <BottomNav />
      </div>
    );
  }

  const carta = cartasParaJugador[0];
  if (!carta) {
    return (
      <div className="play-page">
        <OfflineBanner sync={sync} />
        <p className="home-mazos-estado">No quedan cartas en el mazo.</p>
        <BottomNav />
      </div>
    );
  }

  const variableResolver: Record<string, string> = {
    jugador_al_azar: jugadorActual?.nombre ?? 'jugador_al_azar',
  };

  return (
    <div className="play-page">
      <OfflineBanner sync={sync} />
      {jugadorActual && <MaldicionTimer jugador={jugadorActual} />}

      <header className="home-header">
        <h1>Turno de {jugadorActual?.nombre}</h1>
        <div className="filtro-pills" style={{ justifyContent: 'center' }}>
          {(['estandar', 'maldicion', 'duelo', 'espejo', 'termometro', 'votacion_secreta'] as Mecanica[]).map((m) => (
            <button key={m} type="button" className={`pill ${modoMecanica === m ? 'activo' : ''}`} onClick={() => handleMecanica(m)}>
              {m === 'estandar' ? '📄' : m === 'maldicion' ? '⏳' : m === 'duelo' ? '⚡' : m === 'espejo' ? '🪞' : m === 'termometro' ? '🌡️' : '🗳️'} {m}
            </button>
          ))}
        </div>
      </header>

      {modoMecanica === 'duelo' && jugadorActual && playState.jugadores[1] ? (
        <DueloCard
          carta={carta}
          jugador1={jugadorActual}
          jugador2={playState.jugadores[1]}
          onResultado={(res) => {
            setDueloResultado(res);
            handleCartaSiguiente();
          }}
        />
      ) : modoMecanica === 'termometro' && jugadorActual && playState.jugadores[1] ? (
        <TermometroCard
          carta={carta}
          jugador1={jugadorActual}
          jugador2={playState.jugadores[1]}
          onResultado={(s) => {
            setTermometroSincronia(s);
            handleCartaSiguiente();
          }}
        />
      ) : modoMecanica === 'espejo' && jugadorActual && playState.jugadores[1] ? (
        <EspejoCard
          carta={carta}
          jugadorOrigen={jugadorActual}
          jugadorDestino={playState.jugadores[1]}
          onCumplido={() => handleCartaSiguiente()}
        />
      ) : modoMecanica === 'votacion_secreta' ? (
        <VotacionSecretaCard
          carta={carta}
          jugadores={playState.jugadores}
          onResultado={(id) => {
            setVotacionGanador(id);
            handleCartaSiguiente();
          }}
        />
      ) : (
        <CartaSwiper
          cartas={cartasParaJugador}
          variables={variableResolver}
          onRebotar={handleCartaSiguiente}
          onLogrado={handleCartaSiguiente}
        />
      )}

      {dueloResultado && (
        <div className="duelo-resultado">
          ✅ {dueloResultado.ganador.nombre} gana el duelo contra {dueloResultado.perdedor.nombre}
        </div>
      )}
      {termometroSincronia !== null && (
        <div className="termometro-resultado-banner">
          💞 Sincronía de pareja: {termometroSincronia}%
        </div>
      )}
      {votacionGanador && (
        <div className="votacion-resultado-banner">
          🗳️ Ganador: {votacionGanador}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
