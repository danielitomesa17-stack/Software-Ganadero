import React, { useState } from 'react';
import Login from './pages/Login';
import InventarioLista from './pages/InventarioLista';
import PanelAdmin from './pages/PanelAdmin';

function App() {
  const [sesion] = useState(() => {
    try {
      const s = localStorage.getItem('danubio_session');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  if (!sesion) {
    return <Login onLogin={(d) => { localStorage.setItem('danubio_session', JSON.stringify(d)); window.location.reload(); }} />;
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Panel Administrativo (Solo si es SuperAdmin) */}
        {sesion.user?.rol === 'SuperAdmin' && (
          <div className="mb-8 p-6 bg-white border-2 border-green-500 rounded-2xl shadow-sm">
            <h2 className="text-green-700 font-bold mb-4 uppercase text-xs tracking-widest">
              Panel Administrativo
            </h2>
            <PanelAdmin token={sesion.token} />
          </div>
        )}

        {/* Inventario Principal */}
        <div className="bg-white p-8 rounded-3xl shadow-lg">
          <InventarioLista />
        </div>
        
      </div>
    </div>
  );
}

export default App;