import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Activity, 
  Syringe, 
  Pill, 
  BarChart3, 
  Map, 
  Wallet,
  Settings, 
  LogOut,
  Menu,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  // --- LÓGICA DE ALERTAS SANITARIAS (CONTADOR ROJO) ---
  const [alertasSanitarias, setAlertasSanitarias] = useState(0);

  useEffect(() => {
    const calcularAlertas = () => {
      const sani = JSON.parse(localStorage.getItem('sanidad_danubio') || '[]');
      const hoy = new Date().toISOString().split('T')[0];
      // Contamos cuántos registros tienen una fecha de próxima dosis vencida o para hoy
      const pendientes = sani.filter(r => r.proximaDosis && r.proximaDosis <= hoy).length;
      setAlertasSanitarias(pendientes);
    };

    calcularAlertas();
    // Escucha cambios globales (cuando guardas en SanidadSistemas)
    window.addEventListener('storage', calcularAlertas);
    const interval = setInterval(calcularAlertas, 5000); // Check cada 5 seg
    
    return () => {
      window.removeEventListener('storage', calcularAlertas);
      clearInterval(interval);
    };
  }, [location]);

  // --- ESTRUCTURA DE MENÚ ---
  const menuItems = [
    { path: '/app/dashboard', name: 'Panel Principal', icon: LayoutDashboard, color: 'hover:text-blue-400' },
    { path: '/app/inventario', name: 'Inventario Animal', icon: ClipboardList, color: 'hover:text-green-400' },
    { path: '/app/produccion', name: 'Producción', icon: Activity, color: 'hover:text-cyan-400' },
    { 
      path: '/app/sanidad', 
      name: 'Sanidad', 
      icon: Syringe, 
      badge: alertasSanitarias, // Vinculamos el contador
      color: 'hover:text-violet-400' 
    },
    { path: '/app/farmacia', name: 'Farmacia', icon: Pill, color: 'hover:text-amber-400' },
    { path: '/app/reportes', name: 'Reportes y Análisis', icon: BarChart3, color: 'hover:text-rose-400' },
    { path: '/app/gastos', name: 'Finanzas / Gastos', icon: Wallet, color: 'hover:text-slate-100' },
  ];

  return (
    <aside 
      className={`${
        sidebarOpen ? 'w-72' : 'w-24'
      } bg-[#0F172A] h-screen flex flex-col transition-all duration-500 ease-in-out z-50 shadow-2xl border-r border-slate-800`}
    >
      {/* 1. LOGO / BRANDING */}
      <div className="p-6 mb-4">
        <div className="flex items-center gap-4 px-2">
          <div className="min-w-[45px] h-[45px] bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-900/40 font-black text-xl">
            HL
          </div>
          {sidebarOpen && (
            <div className="flex flex-col animate-in fade-in duration-500">
              <span className="text-white font-black text-xl tracking-tighter leading-none uppercase">Danubio</span>
              <span className="text-green-400 text-[10px] font-bold tracking-[0.2em] uppercase">Software Ganadero</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. NAVEGACIÓN PRINCIPAL */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              relative flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group
              ${isActive 
                ? 'bg-slate-800 text-white shadow-lg border border-slate-700' 
                : `text-slate-400 hover:bg-slate-800/40 ${item.color}`
              }
            `}
          >
            {/* Icono con indicador de activo */}
            <div className="relative">
              <item.icon size={22} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
              
              {/* Círculo de notificación (Badge) */}
              {item.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0F172A] animate-pulse shadow-lg">
                  {item.badge}
                </span>
              )}
            </div>

            {/* Texto del Menú (Solo si está abierto) */}
            {sidebarOpen && (
              <div className="flex justify-between items-center w-full animate-in slide-in-from-left-2 duration-300">
                <span className="font-bold text-[11px] uppercase tracking-widest leading-none">
                  {item.name}
                </span>
                {location.pathname === item.path && (
                  <ChevronRight size={14} className="text-green-400" />
                )}
              </div>
            )}

            {/* Tooltip flotante (Solo si está cerrado) */}
            {!sidebarOpen && (
              <div className="absolute left-20 bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest whitespace-nowrap z-[100] border border-slate-700 shadow-xl">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 3. PIE DE PÁGINA / AJUSTES Y SALIR */}
      <div className="p-4 mt-auto border-t border-slate-800/50 space-y-2 bg-[#0F172A]">
        <NavLink 
          to="/app/configuracion"
          className={({ isActive }) => `
            flex items-center gap-4 px-4 py-3 rounded-xl transition-all
            ${isActive ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}
          `}
        >
          <Settings size={20} />
          {sidebarOpen && <span className="font-bold text-[10px] uppercase tracking-widest">Configuración</span>}
        </NavLink>

        <button 
          onClick={() => alert("Cerrando sesión...")}
          className="flex w-full items-center gap-4 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          {sidebarOpen && <span className="font-bold text-[10px] uppercase tracking-widest">Salir del Sistema</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;