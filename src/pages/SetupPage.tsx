import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../db/db';
import { crearPartidaActual, guardarJugadorPartida } from '../db/db';
import type { FiltroPersonalizado } from '../types';
import type { SyncState } from '../hooks/useOfflineSync';
import OfflineBanner from '../components/OfflineBanner';

interface SetupPageProps {
  sync: SyncState;
}

interface SetupState {
  mazosSeleccionados: string[];
  filtro: FiltroPersonalizado | 'manual';
}

export default function SetupPage({ sync }: SetupPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const setupState = (location.state as SetupState | null) ?? { mazosSeleccionados: [], filtro: 'mezcla' as FiltroPersonalizado | 'manual' };

  const [filtro, setFiltro] = useState<FiltroPersonalizado | 'manual'>(setupState.filtro);
  const [jugadores, setJugadores] = useState<string[]>(['', '']);
  const [categorias, setCategorias] = useState<string[]>([]);

  useEffect(() => {
    db.categorias.toArray().then((data) => {
      setCategorias(data.map((c) => c.id));
    });
    return () => {};
  }, []);

  const agregarJugador = () => {
    if (jugadores.length < 8) {
      setJugadores([...jugadores, '']);
    }
  };

  const actualizarNombre = (index: number, nombre: string) => {
    const nuevos = [...jugadores];
    nuevos[index] = nombre;
    setJugadores(nuevos);
  };

  const eliminarJugador = (index: number) => {
    if (jugadores.length > 2) {
      setJugadores(jugadores.filter((_, i) => i !== index));
    }
  };

  const handleFiltroManualToggle = (catId: string) => {
    setCategorias((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleEmpezar = async () => {
    const nombres = jugadores.filter((n) => n.trim() !== '');
    if (nombres.length < 2) return;

    const partida = await crearPartidaActual({
      id: crypto.randomUUID(),
      modo: filtro === 'manual' ? 'personalizado' : 'picante',
      filtro_personalizado: filtro !== 'mezcla' ? filtro : undefined,
      categorias_activas: filtro === 'manual' ? categorias : [],
      es_modo_parejas: false,
      iniciada_en: Date.now(),
    });

    const jugadoresDB = nombres.map((nombre, i) => ({
      id: crypto.randomUUID(),
      partida_id: partida,
      nombre,
      orden: i,
      racha_picante: 0,
    }));

    for (const j of jugadoresDB) {
      await guardarJugadorPartida(j);
    }

    navigate('/jugar', { state: { partidaId: partida, jugadores: jugadoresDB } });
  };

  return (
    <div className="setup-page">
      <OfflineBanner sync={sync} />

      <div className="page-hero-bg">
        <img src="/setup-hero.jpg" alt="Ajustes de Partida" />
      </div>

      <div className="home-actions" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header className="home-header">
          <h1>Configurar Partida</h1>
        </header>

      <div className="setup-wizard">
        {/* Paso 1: Filtros */}
        <div className="setup-paso">
          <h2>Paso 1 — Filtros</h2>
          <div className="filtro-pills">
            {(['chill', 'picante', 'mezcla'] as const).map((f) => (
              <button key={f} type="button" className={`pill ${filtro === f ? 'activo' : ''}`} onClick={() => setFiltro(f)}>
                {f === 'chill' ? 'Solo Chill' : f === 'picante' ? 'Solo Picante' : 'Mezcla'}
              </button>
            ))}
            <button type="button" className={`pill ${filtro === 'manual' ? 'activo' : ''}`} onClick={() => setFiltro('manual')}>
              Elegir a mano
            </button>
          </div>
          {filtro === 'manual' && (
            <div style={{ marginTop: 16 }}>
              <h3>Categorías activas:</h3>
              {categorias.map((catId) => (
                <label key={catId} className="nombre-jugador">
                  <input type="checkbox" checked={categorias.includes(catId)} onChange={() => handleFiltroManualToggle(catId)} />
                  <span>{catId}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Paso 2: Jugadores */}
        <div className="setup-paso">
          <h2>Paso 2 — Jugadores</h2>
          <label className="setup-label">Cantidad: {jugadores.length}</label>
          {jugadores.map((nombre, i) => (
            <div key={i} className="jugador-nombre-row">
              <input
                type="text"
                className="setup-input"
                placeholder={`Jugador ${i + 1}`}
                value={nombre}
                onChange={(e) => actualizarNombre(i, e.target.value)}
              />
              {jugadores.length > 2 && (
                <button type="button" onClick={() => eliminarJugador(i)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-agregar" onClick={agregarJugador}>+ Agregar jugador</button>
        </div>

        {/* Paso 3: Confirmación */}
        <div className="setup-paso">
          <h2>Paso 3 — Confirmar</h2>
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: 'var(--texto-muted)', margin: '0 0 8px' }}>Mazos seleccionados:</p>
            <p style={{ color: 'var(--texto)' }}>{setupState.mazosSeleccionados.length} mazo(s)</p>
            <p style={{ color: 'var(--texto-muted)', margin: '8px 0 0' }}>Filtro: {filtro}</p>
          </div>
          <div>
            <p style={{ color: 'var(--texto-muted)', margin: '0 0 8px' }}>Jugadores:</p>
            {jugadores.filter((n) => n.trim()).map((n, i) => (
              <span key={i} className="nombre-jugador"><span>{n}</span></span>
            ))}
          </div>
          <button className="btn-jugar-inicio" type="button" onClick={handleEmpezar} style={{ marginTop: 'auto', marginBottom: '20px' }}>
            ¡Empezar!
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
