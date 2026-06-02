import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserX, UserCheck, Loader2, ShieldUser, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { authenticatedFetch } from '../services/api';
import { toast } from 'sonner';

const GestionUsuarios = ({ token }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch('/admin/usuarios');
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data.map(u => ({ ...u, activo: !!u.activo })) : []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      toast.error("Error de carga", { description: "No se pudo cargar la lista de usuarios." });
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const toggleEstadoUsuario = async (id, estadoActual) => {
    const nuevoEstado = !estadoActual ? 1 : 0;
    try {
      await authenticatedFetch(`/admin/usuarios/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ activo: nuevoEstado })
      });
      toast.success("Estado actualizado", { 
        description: `El usuario ha sido ${nuevoEstado ? 'desbloqueado' : 'bloqueado'} con éxito.` 
      });
      fetchUsuarios();
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error al actualizar", { description: "No se pudo cambiar el estado del usuario." });
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
        toast.success("Rol actualizado", { description: "El rol del usuario se cambió correctamente." });
        fetchUsuarios(); 
      } catch (err) {
        console.error("Error al cambiar rol:", err);
        toast.error("Error al actualizar", { description: "No se pudo cambiar el rol del usuario." });
      }
    }
  };

  // Filtrado de usuarios
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(u => 
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.rol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [usuarios, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);
  const currentUsuarios = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsuarios.slice(start, start + itemsPerPage);
  }, [filteredUsuarios, currentPage, itemsPerPage]);

  // Reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Gestión de Accesos</h2>
          <p className="text-sm text-slate-500">Controla quién tiene acceso a la plataforma.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar usuario o rol..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col justify-center items-center gap-3 text-slate-400">
            <Loader2 className="animate-spin w-8 h-8 text-slate-900" /> 
            <p className="font-medium text-sm">Cargando usuarios...</p>
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <div className="p-20 text-center text-slate-500 font-medium">
            No se encontraron usuarios que coincidan con la búsqueda.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">Usuario</th>
                    <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">Rol</th>
                    <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">Estado</th>
                    <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentUsuarios.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-800">{u.nombre}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">{u.rol}</td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${u.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {u.activo ? <UserCheck size={12} /> : <UserX size={12} />}
                          {u.activo ? 'Activo' : 'Bloqueado'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => cambiarRolUsuario(u.id, u.rol)}
                          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <ShieldUser size={14} /> Rol
                        </button>
                        <button 
                          onClick={() => toggleEstadoUsuario(u.id, u.activo)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${u.activo ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        >
                          {u.activo ? <UserX size={14} /> : <UserCheck size={14} />} 
                          {u.activo ? 'Bloquear' : 'Desbloquear'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                <p className="text-xs font-medium text-slate-500">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredUsuarios.length)} de {filteredUsuarios.length} resultados
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-600"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-bold text-slate-700 w-8 text-center">{currentPage}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-600"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GestionUsuarios;