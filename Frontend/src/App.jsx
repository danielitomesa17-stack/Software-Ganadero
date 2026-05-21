import React from 'react';
import Login from './pages/Login';
import InventarioLista from './pages/InventarioLista';
import PanelAdmin from './pages/PanelAdmin'; 

function App() {
  const sesionGuardada = localStorage.getItem('danubio_session');
  const sesion = sesionGuardada ? JSON.parse(sesionGuardada) : null;

  if (!sesion) {
    return <Login onLogin={(d) => { localStorage.setItem('danubio_session', JSON.stringify(d)); window.location.reload(); }} />;
  }

  return (
    <div className="p-10 bg-slate-100 min-h-screen">
      <h1>Sesión Activa: {sesion.user?.nombre}</h1>
      <p>Rol detectado: {sesion.user?.rol}</p>
      
      {/* Tu lista de inventario sigue aquí */}
      <InventarioLista />

      {/* --- AQUÍ VA EL CÓDIGO QUE TE DI --- */}
      <div className="mt-10 border-t pt-6" style={{backgroundColor: 'yellow'}}>
        <p>DEBUG: Este panel debería verse siempre:</p>
        <PanelAdmin token={sesion.token} />
      </div>
      {/* ---------------------------------- */}
      
    </div>
  );
}

export default App;