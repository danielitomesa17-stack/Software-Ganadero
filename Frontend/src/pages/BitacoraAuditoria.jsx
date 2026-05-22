import React, { useState } from 'react';
import { Clock, Filter, FileText } from 'lucide-react';

const BitacoraAuditoria = ({ _token }) => {
  // Simularemos logs de auditoría
  const [logs] = useState([
    { id: 1, usuario: 'María López', accion: 'Bloqueó usuario', objetivo: 'Juan Pérez', fecha: '22 Mayo, 02:10 AM' },
    { id: 2, usuario: 'Sistema', accion: 'Login exitoso', objetivo: 'María López', fecha: '22 Mayo, 01:45 AM' },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Bitácora de Auditoría</h2>
          <p className="text-sm text-slate-500">Registro histórico de acciones de seguridad.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
          <Filter size={16} /> Filtrar
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-5 text-[10px] uppercase font-black text-slate-400">Fecha</th>
              <th className="p-5 text-[10px] uppercase font-black text-slate-400">Administrador</th>
              <th className="p-5 text-[10px] uppercase font-black text-slate-400">Acción</th>
              <th className="p-5 text-[10px] uppercase font-black text-slate-400">Objetivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="p-5 text-sm text-slate-500 flex items-center gap-2">
                  <Clock size={14} /> {log.fecha}
                </td>
                <td className="p-5 text-sm font-bold text-slate-800">{log.usuario}</td>
                <td className="p-5 text-sm font-medium text-slate-600">{log.accion}</td>
                <td className="p-5 text-sm text-slate-600 italic">{log.objetivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BitacoraAuditoria;