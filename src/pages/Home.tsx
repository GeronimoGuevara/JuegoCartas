import { NavLink } from 'react-router-dom';
import type { SyncState } from '../hooks/useOfflineSync';
import OfflineBanner from '../components/OfflineBanner';

interface HomeProps {
  sync: SyncState;
}

export default function Home({ sync }: HomeProps) {
  return (
    <div className="home-screen">
      <OfflineBanner sync={sync} />

      <div className="page-hero-bg">
        <img src="/home-hero.jpg" alt="Amigos jugando" />
      </div>

      <div className="home-actions" style={{ marginTop: 'auto', paddingTop: '60px' }}>
        <NavLink to="/mazos" className="btn-jugar-inicio" end={false}>
          ¡A JUGAR! ⚡
        </NavLink>

        <div className="home-menu-stack">
          <NavLink to="/creador" className="btn-secundario-stack" end={false}>
            <span className="btn-text">Creador de cartas</span>
            <span className="btn-icon">+</span>
          </NavLink>
          <NavLink to="/mazos" className="btn-secundario-stack" end={false}>
            <span className="btn-text">Elegir Mazos 🕴️</span>
            <span className="btn-icon">🃏</span>
          </NavLink>
          <NavLink to="/logros" className="btn-secundario-stack" end={false}>
            <span className="btn-text">Logros</span>
            <span className="btn-icon">🏆</span>
          </NavLink>
          <NavLink to="/setup" className="btn-secundario-stack" end={false}>
            <span className="btn-text">Ajustes de partida</span>
            <span className="btn-icon">⚙️</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
