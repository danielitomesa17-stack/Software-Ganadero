import React, { useState, useEffect } from 'react';
import { Clock, Filter } from 'lucide-react';
import { authenticatedFetch } from '../services/api';

const BitacoraAuditoria = ({ token }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    authenticatedFetch('/admin/bitacora')
    .then(res => res.json())
    .then(data => {
      // Si el backend devuelve un array, lo guardamos
      setLogs(Array.isArray(data) ? data : []);
    })
    .catch(err => console.error("Error al traer logs:", err));
  }, []);

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
              <th className="p-5 text-[10px] uppercase font-black text-slate-400">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length > 0 ? (
              logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-5 text-sm text-slate-500 flex items-center gap-2">
                    <Clock size={14} /> {new Date(log.fecha_registro).toLocaleString()}
                  </td>
                  <td className="p-5 text-sm font-bold text-slate-800">{log.admin_nombre}</td>
                  <td className="p-5 text-sm font-medium text-slate-600">{log.accion}</td>
                  <td className="p-5 text-sm text-slate-600 italic">{log.descripcion}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-10 text-center text-slate-400">No hay registros de auditoría disponibles.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BitacoraAuditoria;