import React, { useState } from 'react';

const PanelAdmin = ({ token }) => {
  // 🌐 URL Base dinámica
  const API_BASE = window.location.hostname === 'localhost'
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
    
    // Seguridad: no hacer nada si no hay token
    if (!token) {
      alert("Error: No tienes una sesión válida.");
      return;
    }

    setCargando(true);

    try {
      const res = await fetch(API_BASE, {
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
        setForm({ nombreHacienda: '', nombreAdmin: '', emailAdmin: '', password: '' }); 
      } else {
        alert('Error del servidor: ' + (data.message || 'No se pudo crear la hacienda'));
      }
    } catch (error) {
      console.error("Error crítico:", error);
      alert('Error de conexión. Revisa la consola (F12) para detalles.');
    } finally {
      setCargando(false);
    }
  };

  // Si no hay token, avisamos visualmente en lugar de romper la app
  if (!token) {
    return (
      <div className="p-4 border border-red-500 bg-red-50 text-red-700 rounded-lg">
        <p className="font-bold">❌ Panel Admin bloqueado</p>
        <p>No se detectó un token válido de autenticación.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border-2 border-green-200 mt-6">
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