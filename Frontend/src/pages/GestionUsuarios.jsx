import React, { useState } from 'react';
import { Search, Shield, UserX, UserCheck } from 'lucide-react';

const GestionUsuarios = ({ _token }) => {
  // Simularemos datos mientras conectamos el backend
  const [usuarios] = useState([
    { id: 1, nombre: 'Juan Pérez', rol: 'Operador', activo: true },
    { id: 2, nombre: 'María López', rol: 'SuperAdmin', activo: true },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cabecera del Módulo */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Gestión de Accesos</h2>
          <p className="text-sm text-slate-500">Controla quién tiene acceso a la hacienda.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input 
            placeholder="Buscar usuario..." 
            className="pl-10 pr-4 py-2 bg-slate-100 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Tabla de Gestión */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-5 text-[10px] uppercase font-black text-slate-400 tracking-widest">Usuario</th>
              <th className="p-5 text-[10px] uppercase font-black text-slate-400 tracking-widest">Rol</th>
              <th className="p-5 text-[10px] uppercase font-black text-slate-400 tracking-widest">Estado</th>
              <th className="p-5 text-[10px] uppercase font-black text-slate-400 tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-5 font-bold text-slate-800">{u.nombre}</td>
                <td className="p-5 text-sm text-slate-600">{u.rol}</td>
                <td className="p-5">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.activo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {u.activo ? <UserCheck size={12} /> : <UserX size={12} />}
                    {u.activo ? 'Activo' : 'Bloqueado'}
                  </div>
                </td>
                <td className="p-5 text-right">
                  <button className="text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg text-xs font-bold transition-all">
                    Cambiar Rol
                  </button>
                  <button className="ml-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-xs font-bold transition-all">
                    {u.activo ? 'Bloquear' : 'Desbloquear'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionUsuarios;