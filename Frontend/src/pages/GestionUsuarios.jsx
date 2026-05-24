import React, { useState, useEffect, useCallback } from 'react';
import { UserX, UserCheck, Loader2, ShieldUser } from 'lucide-react';
import { authenticatedFetch } from '../services/api';

const GestionUsuarios = ({ token }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch('/admin/usuarios');
      const data = await res.json();
      // Aseguramos el mapeo del estado activo
      setUsuarios(Array.isArray(data) ? data.map(u => ({ ...u, activo: !!u.activo })) : []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const toggleEstadoUsuario = async (id, estadoActual) => {
    try {
      await authenticatedFetch(`/admin/usuarios/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ activo: !estadoActual ? 1 : 0 })
      });
      fetchUsuarios(); // Recargamos para ver el cambio visual
    } catch (err) {
      console.error("Error:", err);
      alert("No se pudo cambiar el estado");
    }
  };

  const cambiarRolUsuario = async (id, rolActual) => {
    const nuevoRol = prompt("Ingrese el nuevo rol (Administrador / Operador):", rolActual);
    if (nuevoRol && nuevoRol !== rolActual) {
      try {
        await authenticatedFetch(`/admin/usuarios/${id}/rol`, {
          method: 'PATCH',
          body: JSON.stringify({ nuevoRol })
        });
        fetchUsuarios(); // Recargamos para reflejar el nuevo rol
      } catch (err) {
        console.error("Error al cambiar rol:", err);
        alert("Error de conexión al cambiar el rol");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Gestión de Accesos</h2>
          <p className="text-sm text-slate-500">Controla quién tiene acceso a la hacienda.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center items-center gap-2 text-slate-400">
            <Loader2 className="animate-spin" /> Cargando...
          </div>
        ) : (
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
                  <td className="p-5 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => cambiarRolUsuario(u.id, u.rol)}
                      className="text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <ShieldUser size={14} /> Cambiar Rol
                    </button>
                    <button 
                      onClick={() => toggleEstadoUsuario(u.id, u.activo)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${u.activo ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                    >
                      {u.activo ? <UserX size={14} /> : <UserCheck size={14} />} 
                      {u.activo ? 'Bloquear' : 'Desbloquear'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GestionUsuarios;