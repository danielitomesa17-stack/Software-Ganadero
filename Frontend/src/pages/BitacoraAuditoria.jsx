import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, Filter, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { authenticatedFetch } from '../services/api';
import { toast } from 'sonner';

const BitacoraAuditoria = ({ token }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch('/admin/bitacora');
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al traer logs:", err);
      toast.error("Error de conexión", { description: "No se pudo cargar la bitácora de auditoría." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filtrado de registros
  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      (log.admin_nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.accion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Bitácora de Auditoría</h2>
          <p className="text-sm text-slate-500">Registro histórico de acciones de seguridad.</p>
        </div>
        
        <div className="flex w-full sm:w-auto gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar acción o detalle..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all text-sm font-medium"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap">
            <Filter size={16} /> <span className="hidden sm:inline">Filtrar</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col justify-center items-center gap-3 text-slate-400">
            <Loader2 className="animate-spin w-8 h-8 text-slate-900" />
            <p className="font-medium text-sm">Cargando bitácora...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-20 text-center text-slate-500 font-medium">
            No se encontraron registros de auditoría que coincidan con la búsqueda.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">Fecha y Hora</th>
                    <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">Administrador</th>
                    <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">Acción</th>
                    <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">Detalle Adicional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" /> 
                          {new Date(log.fecha_registro).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{log.admin_nombre || 'Sistema'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          {log.accion}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 italic">{log.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                <p className="text-xs font-medium text-slate-500">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredLogs.length)} de {filteredLogs.length} registros
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

export default BitacoraAuditoria;