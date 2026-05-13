import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Milk, Menu, LogOut, 
  ChevronRight, ShieldCheck, Pill, BarChart3 
} from 'lucide-react';

// src/routes/AppRouter.jsx

import Login from '../pages/Login'; 
import InventarioLista from '../pages/InventarioLista'; 
import ProduccionSistemas from '../pages/ProduccionSistemas'; 
import SanidadSistemas from '../pages/SanidadSistemas';
import MedicamentosInventario from '../pages/MedicamentosInventario'; 
import ReportesSistemas from '../pages/ReportesSistemas'; 
import GastosSistemas from '../pages/GastosSistemas';

const NavContent = ({ sidebarOpen, setSidebarOpen, sesion, onLogout }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const [alertasSanitarias, setAlertasSanitarias] = useState(0);

  useEffect(() => {
    const calcularAlertas = () => {
      try {
        const sani = JSON.parse(localStorage.getItem('sanidad_danubio') || '[]');
        const hoy = new Date().toISOString().split('T')[0];
        const pendientes = sani.filter(r => r.proximaDosis && r.proximaDosis <= hoy).length;
        setAlertasSanitarias(pendientes);
      } catch {
        setAlertasSanitarias(0);
      }
    };
    
    if (sesion) {
      calcularAlertas();
    }
  }, [location, sesion]);

  if (!sesion) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* SIDEBAR IZQUIERDO */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-24'} bg-[#0F172A] p-6 flex flex-col transition-all duration-500 ease-in-out z-50 shadow-2xl`}>
        <div className="flex items-center gap-4 px-2 mb-12">
          <div className="min-w-[45px] h-[45px] bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-900/40 font-black text-xl">
            {sesion.nombre_hacienda?.substring(0, 2).toUpperCase() || 'HD'}
          </div>
          {sidebarOpen && (
            <div className="flex flex-col animate-in fade-in duration-500">
              <span className="text-white font-black text-xl tracking-tighter leading-none uppercase">Hacienda</span>
              <span className="text-green-400 text-[10px] font-bold tracking-[0.2em] uppercase">{sesion.nombre_hacienda}</span>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-3">
          <Link to="/app/inventario" className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${isActive('/app/inventario') ? 'bg-green-600 text-white shadow-xl shadow-green-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-green-400'}`}>
            <LayoutDashboard size={22} strokeWidth={isActive('/app/inventario') ? 3 : 2} />
            {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Inventario</span>}
          </Link>

          <Link to="/app/reportes" className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${isActive('/app/reportes') ? 'bg-rose-600 text-white shadow-xl shadow-rose-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-rose-400'}`}>
            <BarChart3 size={22} strokeWidth={isActive('/app/reportes') ? 3 : 2} />
            {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Análisis</span>}
          </Link>

          <Link to="/app/produccion" className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${isActive('/app/produccion') ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-blue-400'}`}>
            <Milk size={22} strokeWidth={isActive('/app/produccion') ? 3 : 2} />
            {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Producción</span>}
          </Link>

          <Link to="/app/sanidad" className={`relative flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${isActive('/app/sanidad') ? 'bg-violet-600 text-white shadow-xl shadow-violet-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-violet-400'}`}>
            <ShieldCheck size={22} strokeWidth={isActive('/app/sanidad') ? 3 : 2} />
            {alertasSanitarias > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0F172A]">{alertasSanitarias}</span>}
            {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Sanidad</span>}
          </Link>

          <Link to="/app/farmacia" className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${isActive('/app/farmacia') ? 'bg-amber-600 text-white shadow-xl shadow-amber-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-amber-400'}`}>
            <Pill size={22} strokeWidth={isActive('/app/farmacia') ? 3 : 2} />
            {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Farmacia</span>}
          </Link>
        </nav>

        <button 
          onClick={onLogout}
          className="flex items-center gap-4 px-4 py-4 text-slate-500 hover:text-red-400 mt-auto border-t border-slate-800/50 pt-6 transition-colors w-full"
        >
          <LogOut size={22} />
          {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Cerrar Sesión</span>}
        </button>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-600 transition-all active:scale-90">
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
              <span>{sesion.nombre_hacienda}</span>
              <ChevronRight size={12} />
              <span className="text-slate-900">PANEL DE CONTROL</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-l pl-6 border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800 leading-none uppercase tracking-tighter">{sesion.nombre}</p>
                <p className="text-[10px] font-bold text-green-600 uppercase mt-1 tracking-tighter italic">Usuario Activo</p>
              </div>
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xs">
                {sesion.nombre?.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="inventario" element={<InventarioLista haciendaId={sesion.hacienda_id} />} />
              <Route path="reportes" element={<ReportesSistemas />} />
              <Route path="produccion" element={<ProduccionSistemas />} />
              <Route path="sanidad" element={<SanidadSistemas />} />
              <Route path="farmacia" element={<MedicamentosInventario />} />
              <Route path="gastos" element={<GastosSistemas />} />
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
    const guardada = localStorage.getItem('danubio_session');
    if (!guardada) return null;
    try { 
      const parsed = JSON.parse(guardada);
      return parsed.nombre ? parsed : null; 
    } catch { 
      return null; 
    }
  });

  const handleLogin = (datos) => {
    setSesion(datos);
    localStorage.setItem('danubio_session', JSON.stringify(datos));
  };

  const handleLogout = () => {
    localStorage.removeItem('danubio_session');
    setSesion(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!sesion ? <Login onLogin={handleLogin} /> : <Navigate to="/app/inventario" />} 
        />
        
        <Route 
          path="/app/*" 
          element={sesion ? (
            <NavContent 
              sidebarOpen={sidebarOpen} 
              setSidebarOpen={setSidebarOpen} 
              sesion={sesion} 
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" />
          )} 
        />

        <Route path="*" element={<Navigate to={sesion ? "/app/inventario" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;