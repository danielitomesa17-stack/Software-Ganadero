import React, { useState } from 'react';
import GestionUsuarios from './GestionUsuarios';
import BitacoraAuditoria from './BitacoraAuditoria';

const PanelAdmin = ({ token }) => {
  const [activeTab, setActiveTab] = useState('crear');
  const [form, setForm] = useState({ nombreHacienda: '', nombreAdmin: '', emailAdmin: '', password: '' });
  const [cargando, setCargando] = useState(false);

  // Lógica de creación (Tu formulario existente)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    const API_BASE = 'https://software-ganadero.onrender.com/api/admin/crear-cliente';

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        alert('¡Hacienda creada con éxito!');
        setForm({ nombreHacienda: '', nombreAdmin: '', emailAdmin: '', password: '' });
      } else {
        alert('Error: ' + (data.message || 'No se pudo crear la hacienda'));
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión.');
    } finally {
      setCargando(false);
    }
  };

  if (!token) return <div className="p-4 bg-red-50 text-red-700 rounded-lg">❌ Panel bloqueado: Sin token.</div>;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
      <h1 className="text-2xl font-black text-slate-950 mb-8">Centro de Administración</h1>

      {/* Selector de Pestañas */}
      <div className="flex gap-8 mb-8 border-b border-slate-200">
        {['crear', 'usuarios', 'auditoria'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === tab ? 'text-green-700 border-b-2 border-green-700' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab === 'crear' ? 'Nueva Hacienda' : tab}
          </button>
        ))}
      </div>

      {/* Contenido Dinámico */}
      <div className="min-h-[400px]">
        {activeTab === 'crear' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-lg font-bold">Registrar Nueva Hacienda SaaS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="Nombre Hacienda" value={form.nombreHacienda} onChange={e => setForm({...form, nombreHacienda: e.target.value})} required />
              <input className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="Admin" value={form.nombreAdmin} onChange={e => setForm({...form, nombreAdmin: e.target.value})} required />
              <input className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" type="email" placeholder="Email Admin" value={form.emailAdmin} onChange={e => setForm({...form, emailAdmin: e.target.value})} required />
              <input className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" type="password" placeholder="Contraseña" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button disabled={cargando} className="w-full py-3 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-colors">
              {cargando ? 'Procesando...' : 'Registrar'}
            </button>
          </form>
        )}

        {activeTab === 'usuarios' && <GestionUsuarios token={token} />}
        {activeTab === 'auditoria' && <BitacoraAuditoria token={token} />}
      </div>
    </div>
  );
};

export default PanelAdmin;