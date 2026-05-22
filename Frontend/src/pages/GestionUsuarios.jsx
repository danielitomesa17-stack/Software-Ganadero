import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserX, UserCheck, Loader2 } from 'lucide-react';

const GestionUsuarios = ({ token }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('https://software-ganadero.onrender.com/api/admin/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error al obtener usuarios");
      const data = await res.json();
      // Aseguramos que 'activo' sea booleano (para que el UI funcione siempre)
      setUsuarios(Array.isArray(data) ? data.map(u => ({ ...u, activo: !!u.activo })) : []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const toggleEstadoUsuario = async (id, estadoActual) => {
    try {
      // Enviamos el valor invertido. 
      // Si el backend espera 1/0, forzamos la conversión a entero
      const nuevoEstado = !estadoActual;
      
      const response = await fetch(`https://software-ganadero.onrender.com/api/admin/usuarios/${id}/estado`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activo: nuevoEstado ? 1 : 0 }) 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar estado");
      }
      
      // Recargamos los datos para reflejar el cambio real del servidor
      fetchUsuarios();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("No se pudo actualizar el usuario: " + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ... Cabecera igual ... */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Gestión de Accesos</h2>
          <p className="text-sm text-slate-500">Controla quién tiene acceso a la hacienda.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center items-center gap-2 text-slate-400">
            <Loader2 className="animate-spin" /> Cargando usuarios...
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
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => toggleEstadoUsuario(u.id, u.activo)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${u.activo ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                    >
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