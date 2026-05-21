import React, { useState } from 'react';

const PanelAdmin = ({ token }) => {
  // 🌐 Configuración dinámica de la URL base para el entorno SaaS
  const URL_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api/admin/crear-cliente'
    : 'https://software-ganadero.onrender.com/api/admin/crear-cliente';

  const [form, setForm] = useState({ 
    nombreHacienda: '', 
    nombreAdmin: '', 
    emailAdmin: '', 
    password: '' 
  });
  
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const res = await fetch(URL_BASE, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        alert('¡Hacienda creada con éxito!');
        // Limpiar formulario tras éxito
        setForm({ nombreHacienda: '', nombreAdmin: '', emailAdmin: '', password: '' }); 
      } else {
        // Muestra el mensaje específico que venga del backend
        alert('Error: ' + (data.message || data.error || 'No se pudo crear la hacienda'));
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert('Error crítico de comunicación con el servidor. Verifica que el backend esté activo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-6">
      <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-wider">Gestión de Clientes SaaS</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          className="w-full p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
          placeholder="Nombre de la Hacienda" 
          value={form.nombreHacienda} 
          onChange={e => setForm({...form, nombreHacienda: e.target.value})} 
          required 
        />
        <input 
          className="w-full p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
          placeholder="Nombre del Administrador" 
          value={form.nombreAdmin} 
          onChange={e => setForm({...form, nombreAdmin: e.target.value})} 
          required 
        />
        <input 
          className="w-full p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
          type="email" 
          placeholder="Email del Administrador" 
          value={form.emailAdmin} 
          onChange={e => setForm({...form, emailAdmin: e.target.value})} 
          required 
        />
        <input 
          className="w-full p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
          type="password" 
          placeholder="Contraseña inicial" 
          value={form.password} 
          onChange={e => setForm({...form, password: e.target.value})} 
          required 
        />
      </div>

      <button 
        disabled={cargando}
        className={`mt-6 w-full py-3 rounded-xl font-bold text-white transition-all ${cargando ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'}`}
      >
        {cargando ? 'Procesando...' : 'Registrar Nueva Hacienda'}
      </button>
    </form>
  );
};

export default PanelAdmin;