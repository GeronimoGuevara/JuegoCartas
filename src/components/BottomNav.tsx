import { NavLink, useLocation } from 'react-router-dom';

const items = [
  { to: '/', label: 'Inicio', icon: '🏠' },
  { to: '/mazos', label: 'Mis Mazos', icon: '🃏' },
  { to: '/creador', label: 'Creador', icon: '➕' },
  { to: '/historial', label: 'Historial', icon: '📜' },
];

export default function BottomNav() {
  const location = useLocation();
  
  if (
    location.pathname === '/' || 
    location.pathname === '/jugar' || 
    location.pathname === '/setup' || 
    location.pathname === '/resumen'
  ) {
    return null;
  }

  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, icon }) => (
        <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">{icon}</span>
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
