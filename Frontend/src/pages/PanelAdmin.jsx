import React, { useState } from 'react';
import GestionUsuarios from './GestionUsuarios';
import BitacoraAuditoria from './BitacoraAuditoria';

const PanelAdmin = ({ token }) => {
  const [activeTab, setActiveTab] = useState('crear');
  const [form, setForm] = useState({ nombreHacienda: '', nombreAdmin: '', emailAdmin: '', password: '' });
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const res = await fetch('https://software-ganadero.onrender.com/api/admin/crear-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        alert('¡Hacienda creada!');
        setForm({ nombreHacienda: '', nombreAdmin: '', emailAdmin: '', password: '' });
      } else {
        alert('Error al crear la hacienda');
      }
    } catch { alert('Error de conexión.'); }
    finally { setCargando(false); }
  };

  if (!token) return <div className="p-4 bg-red-50 text-red-700 rounded-lg">❌ Panel bloqueado.</div>;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
      <h1 className="text-2xl font-black text-slate-950 mb-8">Centro de Administración</h1>
      
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

      <div className="min-h-[400px]">
        {activeTab === 'crear' && ( /* ... tu formulario aquí ... */ )}
        {activeTab === 'usuarios' && <GestionUsuarios token={token} />}
        {activeTab === 'auditoria' && <BitacoraAuditoria token={token} />}
      </div>
    </div>
  );
};
export default PanelAdmin;