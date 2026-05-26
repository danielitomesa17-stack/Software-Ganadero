import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Milk, Menu, LogOut, 
  ChevronRight, ShieldCheck, Pill, BarChart3, Wallet, Settings 
} from 'lucide-react';

// Importaciones de Páginas
import Login from '../pages/Login'; 
import InventarioLista from '../pages/InventarioLista'; 
import ProduccionSistemas from '../pages/ProduccionSistemas'; 
import SanidadSistemas from '../pages/SanidadSistemas';
import MedicamentosInventario from '../pages/MedicamentosInventario'; 
import ReportesSistemas from '../pages/ReportesSistemas'; 
import GastosSistemas from '../pages/GastosSistemas';
import PanelAdmin from '../pages/PanelAdmin'; // Módulo independiente

const NavContent = ({ sidebarOpen, setSidebarOpen, sesion, onLogout }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-24'} bg-[#0F172A] p-6 flex flex-col transition-all duration-500 ease-in-out z-50 shadow-2xl`}>
        <div className="flex items-center gap-4 px-2 mb-12">
          <div className="min-w-[45px] h-[45px] bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center text-white shadow-lg font-black text-xl">
            {sesion.nombre_hacienda?.substring(0, 2).toUpperCase() || 'HD'}
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-white font-black text-xl tracking-tighter uppercase">Hacienda</span>
              <span className="text-green-400 text-[10px] font-bold tracking-[0.2em] uppercase">{sesion.nombre_hacienda}</span>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-3">
          <Link to="/app/inventario" className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${isActive('/app/inventario') ? 'bg-green-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <LayoutDashboard size={22} />
            {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Inventario</span>}
          </Link>

          {/* MÓDULO ADMIN RESTRINGIDO */}
          {sesion.user?.rol === 'SuperAdmin' && (
            <Link to="/app/admin" className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${isActive('/app/admin') ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Settings size={22} />
              {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Admin Panel</span>}
            </Link>
          )}

          <Link to="/app/reportes" className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${isActive('/app/reportes') ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <BarChart3 size={22} />
            {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Análisis</span>}
          </Link>

          <Link to="/app/MedicamentosInventario" className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${isActive('/app/MedicamentosInventario') ? 'bg-amber-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Pill size={22} />
            {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Farmacia</span>}
          </Link>

          <Link to="/app/gastos" className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${isActive('/app/gastos') ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800'}`}> 
            <Wallet size={22} />
            {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Gastos</span>}
          </Link>

          <Link to="/app/ProduccionSistemas" className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${isActive('/app/ProduccionSistemas') ? 'bg-green-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
  <Scale size={22} />
  {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Producción</span>}
</Link>
{/* ... otros links (Producción, Sanidad, Farmacia) */}
        </nav>

        <button onClick={onLogout} className="flex items-center gap-4 px-4 py-4 text-slate-500 hover:text-red-400 mt-auto border-t border-slate-800 pt-6 transition-colors w-full">
          <LogOut size={22} />
          {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Cerrar Sesión</span>}
        </button>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 border-b border-slate-200 px-8 flex justify-between items-center sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-600"><Menu size={24} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="inventario" element={<InventarioLista />} />
              <Route path="reportes" element={<ReportesSistemas />} />
              <Route path="ProduccionSistemas" element={<ProduccionSistemas />} />
              <Route path="sanidad" element={<SanidadSistemas />} />
              <Route path="MedicamentosInventario" element={<MedicamentosInventario />} />
              <Route path="gastos" element={<GastosSistemas />} />
              {/* RUTA PROTEGIDA PARA ADMIN */}
              <Route 
                path="admin" 
                element={sesion.user?.rol === 'SuperAdmin' ? <PanelAdmin token={sesion.token} /> : <Navigate to="/app/inventario" replace />} 
              />
              <Route path="*" element={<Navigate to="inventario" replace />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

const AppRouter = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sesion, setSesion] = useState(() => {
    try {
      const guardada = localStorage.getItem('danubio_session');
      return guardada ? JSON.parse(guardada) : null;
    } catch { return null; }
  });

  const handleLogin = useCallback((datos) => {
    setSesion(datos);
    localStorage.setItem('danubio_session', JSON.stringify(datos));
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('danubio_session');
    setSesion(null);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!sesion ? <Login onLogin={handleLogin} /> : <Navigate to="/app/inventario" replace />} />
        <Route path="/app/*" element={sesion ? <NavContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} sesion={sesion} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={sesion ? "/app/inventario" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;