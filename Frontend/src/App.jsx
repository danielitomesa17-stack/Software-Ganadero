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
    <div style={{ padding: '40px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>PRUEBA DE EMERGENCIA</h1>
      
      {/* 1. Inventario */}
      <div style={{ background: 'white', padding: '20px', marginBottom: '20px' }}>
        <InventarioLista />
      </div>

      {/* 2. Panel Admin Forzado */}
      <div style={{ border: '10px solid red', padding: '40px', background: 'yellow' }}>
        <h2>ESTO ES EL PANEL ADMIN</h2>
        <p>Token detectado: {sesion.token ? 'SÍ' : 'NO'}</p>
        <PanelAdmin token={sesion.token} />
      </div>
    </div>
  );
}

export default App;