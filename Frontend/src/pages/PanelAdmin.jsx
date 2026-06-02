import React, { useState } from 'react';
import { authenticatedFetch } from '../services/api';
import GestionUsuarios from './GestionUsuarios';
import BitacoraAuditoria from './BitacoraAuditoria';
import { toast } from 'sonner';
import { Building2, Users, ShieldCheck, PlusCircle, LayoutDashboard, Send } from 'lucide-react';

const PanelAdmin = ({ token }) => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [form, setForm] = useState({ nombreHacienda: '', nombreAdmin: '', emailAdmin: '', password: '' });
  const [cargando, setCargando] = useState(false);

  // Lógica para registrar una nueva hacienda
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const res = await authenticatedFetch('/admin/crear-cliente', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success('Hacienda creada con éxito', {
          description: `La hacienda ${form.nombreHacienda} y su administrador han sido registrados.`,
        });
        setForm({ nombreHacienda: '', nombreAdmin: '', emailAdmin: '', password: '' });
      } else {
        toast.error('Error al crear la hacienda', {
          description: data.message || 'Verifique los datos e intente nuevamente.'
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión', {
        description: 'No se pudo contactar al servidor.'
      });
    } finally {
      setCargando(false);
    }
  };

  if (!token) return (
    <div className="flex flex-col items-center justify-center p-12 bg-red-50 text-red-700 rounded-3xl border border-red-200">
      <ShieldCheck className="w-16 h-16 mb-4 text-red-500 opacity-50" />
      <h2 className="text-xl font-bold">Acceso Denegado</h2>
      <p className="text-sm mt-2">No se encontró token de autenticación válido.</p>
    </div>
  );

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
    { id: 'crear', label: 'Nueva Hacienda', icon: PlusCircle },
    { id: 'usuarios', label: 'Gestión Usuarios', icon: Users },
    { id: 'auditoria', label: 'Auditoría', icon: ShieldCheck },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-100 p-8 md:p-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Centro de Administración</h1>
          <p className="text-slate-500 font-medium">Gestiona tu plataforma SaaS integralmente</p>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex flex-wrap gap-2 mb-10 border-b border-slate-200 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-md transform scale-105' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Contenido Dinámico */}
      <div className="min-h-[400px]">
        
        {activeTab === 'resumen' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Panel de Control General</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tarjetas de estadísticas simuladas (Se conectarán luego) */}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-3xl shadow-lg shadow-emerald-200 text-white">
                <Building2 className="w-8 h-8 mb-4 opacity-80" />
                <p className="text-emerald-100 font-medium">Haciendas Activas</p>
                <h3 className="text-4xl font-black mt-1">--</h3>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-3xl shadow-lg shadow-blue-200 text-white">
                <Users className="w-8 h-8 mb-4 opacity-80" />
                <p className="text-blue-100 font-medium">Usuarios Registrados</p>
                <h3 className="text-4xl font-black mt-1">--</h3>
              </div>
              <div className="bg-gradient-to-br from-violet-500 to-violet-700 p-6 rounded-3xl shadow-lg shadow-violet-200 text-white">
                <ShieldCheck className="w-8 h-8 mb-4 opacity-80" />
                <p className="text-violet-100 font-medium">Registros de Auditoría</p>
                <h3 className="text-4xl font-black mt-1">--</h3>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'crear' && (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-slate-50 border border-slate-100 rounded-[2rem] p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <PlusCircle className="text-slate-400" />
              Registrar Nueva Hacienda SaaS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre de la Hacienda</label>
                <input 
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium text-slate-800 shadow-sm" 
                  placeholder="Ej: Hacienda El Sol" 
                  value={form.nombreHacienda} 
                  onChange={e => setForm({...form, nombreHacienda: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre del Administrador</label>
                <input 
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium text-slate-800 shadow-sm" 
                  placeholder="Ej: Juan Pérez" 
                  value={form.nombreAdmin} 
                  onChange={e => setForm({...form, nombreAdmin: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email del Administrador</label>
                <input 
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium text-slate-800 shadow-sm" 
                  type="email" 
                  placeholder="admin@hacienda.com" 
                  value={form.emailAdmin} 
                  onChange={e => setForm({...form, emailAdmin: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Contraseña Inicial</label>
                <input 
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium text-slate-800 shadow-sm" 
                  type="password" 
                  placeholder="Mínimo 6 caracteres" 
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})} 
                  required 
                />
              </div>
            </div>
            <div className="mt-8">
              <button 
                disabled={cargando} 
                className="w-full flex justify-center items-center gap-2 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20"
              >
                {cargando ? 'Procesando registro...' : (
                  <>
                    Registrar Hacienda <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'usuarios' && (
          <div className="animate-in fade-in duration-500">
            <GestionUsuarios token={token} />
          </div>
        )}
        
        {activeTab === 'auditoria' && (
          <div className="animate-in fade-in duration-500">
            <BitacoraAuditoria token={token} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelAdmin;