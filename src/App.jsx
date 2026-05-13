import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import InventarioLista from './pages/InventarioLista';

function App() {
  const [sesion, setSesion] = useState(null);

  // Forzamos un log para ver qué está pasando
  useEffect(() => {
    console.log("¿Hay sesión?:", sesion);
    console.log("Contenido del localStorage:", localStorage.getItem('danubio_session'));
  }, [sesion]);

  if (!sesion) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', background: '#fee2e2' }}>
        <h1>MODO DIAGNÓSTICO ACTIVO</h1>
        <p>Si ves esto, el sistema de bloqueo funciona. Intentando cargar Login...</p>
        <Login onLogin={(datos) => setSesion(datos)} />
      </div>
    );
  }

  return (
    <div>
      <h1>Bienvenido, {sesion.nombre}</h1>
      <button onClick={() => { localStorage.clear(); window.location.reload(); }}>
        Cerrar Sesión Forzado
      </button>
      <InventarioLista haciendaId={sesion.hacienda_id} />
    </div>
  );
}

export default App;