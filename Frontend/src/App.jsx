import React, { useState } from 'react';
import Login from './pages/Login';
import InventarioLista from './pages/InventarioLista';
import PanelAdmin from './pages/PanelAdmin'; 

function App() {
  const [sesion, setSesion] = useState(() => {
    try {
      const sesionGuardada = localStorage.getItem('danubio_session');
      return sesionGuardada ? JSON.parse(sesionGuardada) : null;
    } catch {  
      return null;
    }
  });

  const handleLoginSuccess = (datosBackend) => {
    localStorage.setItem('danubio_session', JSON.stringify(datosBackend));
    setSesion(datosBackend);
  };

  const handleLogout = () => {
    localStorage.removeItem('danubio_session');
    setSesion(null);
  };

  if (!sesion) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans pb-10">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Bienvenido, <span className="text-green-700">{sesion.user?.nombre || 'Usuario'}</span>
            </h1>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">
              Rol: {sesion.user?.rol || 'No asignado'} — Hacienda ID: {sesion.user?.haciendaId || 'N/A'}
            </p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm border border-red-200/50"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Lista principal de trabajo */}
        <InventarioLista />

        {/* 🔒 PANEL ADMINISTRATIVO: Solo visible para el SuperAdmin */}
        {sesion.user?.rol === 'SuperAdmin' && (
          <div className="mt-10 border-t pt-6">
            <PanelAdmin token={sesion.token} />
          </div>
        )}
        
      </div>
    </div>
  );
}

export default App;