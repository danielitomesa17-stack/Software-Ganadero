import React, { useState } from 'react';
import Login from './pages/Login';
import InventarioLista from './pages/InventarioLista';
import PanelAdmin from './pages/PanelAdmin';
// ... otros imports

// --- INTERCEPTOR GLOBAL: Seguridad Centralizada ---
// Este código se ejecuta una sola vez al cargar la aplicación.
// Si cualquier fetch recibe un 403, el usuario es expulsado inmediatamente.
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  
  if (response.status === 403) {
    localStorage.removeItem('danubio_session');
    window.location.href = '/login';
    // Lanzamos un error para que los componentes sepan que la petición se abortó
    throw new Error("Usuario bloqueado o sin permisos");
  }
  return response;
};

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
        
        {/* Panel Administrativo */}
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