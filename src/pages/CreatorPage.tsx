import { useState } from 'react';
import { crearCartaLocal } from '../db/db';
import { useOfflineSync } from '../hooks/useOfflineSync';
import OfflineBanner from '../components/OfflineBanner';

interface CreatorPageProps {
  sync: ReturnType<typeof useOfflineSync>;
}

export default function CreatorPage({ sync }: CreatorPageProps) {
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState('');
  const [mazoDestino, setMazoDestino] = useState('');
  const [toast, setToast] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleCrear = async () => {
    if (!contenido.trim() || !categoria) return;

    setCargando(true);
    try {
      await crearCartaLocal({
        mazo_id: mazoDestino || 'sin-mazo',
        categoria_id: categoria,
        contenido,
        variables: { jugador_al_azar: 'jugador' },
      });
      setContenido('');
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="creator-page">
      <OfflineBanner sync={sync} />

      <div className="page-hero-bg">
        <img src="/creator-hero.jpg" alt="Creador" />
      </div>

      <div className="home-actions" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header className="home-header">
          <h1>Creador de Cartas</h1>
        </header>

      <div className="creador-form">
        <textarea
          className="setup-input"
          style={{ minHeight: 120 }}
          placeholder="Si {jugador} pierde el piedra, papel o tijera, tiene que…"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
        />

        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Tipo de carta</option>
          <option value="reto">Reto</option>
          <option value="pregunta">Pregunta</option>
          <option value="castigo">Castigo</option>
        </select>

        <select value={mazoDestino} onChange={(e) => setMazoDestino(e.target.value)}>
          <option value="">Baraja de destino</option>
          <option value="sin-mazo">Creados por mí</option>
        </select>

        <div className="offline-indicator">
          📱 Guardado en el teléfono (Offline)
        </div>

        <button
          className="btn-jugar-inicio"
          type="button"
          onClick={handleCrear}
          disabled={cargando || !contenido.trim() || !categoria}
          style={{ opacity: contenido.trim() && categoria ? 1 : 0.4, marginTop: 'auto', marginBottom: '20px' }}
        >
          Crear y Añadir al Mazo +
        </button>

        {toast && <div className="toast">✅ Carta guardada localmente</div>}
      </div>
      </div>
    </div>
  );
}
