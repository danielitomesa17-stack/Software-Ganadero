import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import InventarioLista from './pages/InventarioLista';

function App() {
  // Inicializamos el estado leyendo directamente del localStorage si ya existe sesión
  const [sesion, setSesion] = useState(() => {
    const sesionGuardada = localStorage.getItem('danubio_session');
    return sesionGuardada ? JSON.parse(sesionGuardada) : null;
  });

  // Logs para monitorear el estado en la consola del navegador
  useEffect(() => {
    console.log("=== ESTADO DE LA SESIÓN ===");
    console.log("¿Hay estado 'sesion' activo?:", sesion);
    console.log("Token actual:", sesion?.token);
    console.log("Datos del usuario:", sesion?.user);
  }, [sesion]);

  // Función manejadora del login exitoso
  const handleLoginSuccess = (datosBackend) => {
    // Guardamos en el localStorage el objeto completo (success, token, user, message)
    localStorage.setItem('danubio_session', JSON.stringify(datosBackend));
    // Seteamos el estado de React
    setSesion(datosBackend);
  };

  // Función para cerrar sesión limpiamente
  const handleLogout = () => {
    localStorage.removeItem('danubio_session');
    setSesion(null);
  };

  // 1. Si no hay sesión activa, renderizamos el Login de forma limpia
  if (!sesion) {
    return (
      <Login onLogin={handleLoginSuccess} />
    );
  }

  // 2. Si hay sesión activa, entramos al panel de la Hacienda
  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        
        {/* Encabezado del Dashboard */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            {/* ⚠️ CORRECCIÓN CLAVE: Leemos desde sesion.user.nombre */}
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Bienvenido de nuevo, <span className="text-green-700">{sesion.user?.nombre || 'Usuario'}</span>
            </h1>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">
              Rol: {sesion.user?.rol || 'No asignado'} — Hacienda El Danubio
            </p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm border border-red-200/50"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Componente de Gestión de Ganado */}
        {/* Pasamos el id de la hacienda de forma segura si tu backend lo asocia al usuario */}
        <InventarioLista haciendaId={sesion.user?.hacienda_id || 1} />
        
      </div>
    </div>
  );
}

export default App;