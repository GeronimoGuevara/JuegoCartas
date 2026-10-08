import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useOfflineSync } from './hooks/useOfflineSync';
import Home from './pages/Home';
import MazePage from './pages/MazePage';
import SetupPage from './pages/SetupPage';
import CreatorPage from './pages/CreatorPage';
import PlayPage from './pages/PlayPage';
import SummaryPage from './pages/SummaryPage';
import ParejasPage from './pages/ParejasPage';
import HistorialPage from './pages/HistorialPage';
import BottomNav from './components/BottomNav';

function App() {
  const sync = useOfflineSync();

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Home sync={sync} />} />
          <Route path="/mazos" element={<MazePage sync={sync} />} />
          <Route path="/setup" element={<SetupPage sync={sync} />} />
          <Route path="/creador" element={<CreatorPage sync={sync} />} />
          <Route path="/jugar" element={<PlayPage />} />
          <Route path="/resumen" element={<SummaryPage sync={sync} />} />
          <Route path="/parejas" element={<ParejasPage sync={sync} />} />
          <Route path="/historial" element={<HistorialPage sync={sync} />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
