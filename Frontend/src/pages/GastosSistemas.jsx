import React, { useState, useMemo, useEffect } from 'react';
import { Edit3, Save, X, Plus, BadgeDollarSign, Trash2 } from 'lucide-react';
import ExpensesChart from '../components/ExpensesChart';
import { authenticatedFetch } from '../services/api';


function decodeJwt (token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (e) {
    console.error('Error decoding JWT', e);
    return {};
  }
}


const GastosSistemas = () => {
  const [editandoId, setEditandoId] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nuevoGasto, setNuevoGasto] = useState({ concepto: '', monto: '', categoria: 'GENERAL' });
  const [filtroCategoria, setFiltroCategoria] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- NUEVO: ESTADO PARA SABER QUÉ GASTO EDITAMOS ---
  // Obtener hacienda_id del JWT almacenado en la sesión
  const getHaciendaId = () => {
    try {
      const session = localStorage.getItem('danubio_session');
      if (!session) return null;
      const { token } = JSON.parse(session);
      const decoded = decodeJwt(token);
      return decoded.hacienda_id || decoded.haciendaId || decoded.hacienda;
    } catch (e) {
      console.error('Error leyendo hacienda_id del token', e);
      return null;
    }
  };
  const haciendaId = getHaciendaId();

  // Cargar gastos desde la API al montar el componente
  useEffect(() => {
    const cargarGastos = async () => {
      if (!haciendaId) {
        console.error('No se encontró hacienda_id, abortando carga de gastos');
        setLoading(false);
        return;
      }
      try {
        const res = await authenticatedFetch('/gastos');
        if (!res.ok) throw new Error('Error al obtener gastos');
        const data = await res.json();
        setGastos(data.data || []);
      } catch (err) {
        console.error('Error al cargar gastos', err);
        if (err.response) {
          console.error('Status:', err.response.status);
          err.response.text().then(t => console.error('Body:', t));
        }
        alert('No se pudieron cargar los gastos');
      } finally {
        setLoading(false);
      }
    };
    cargarGastos();
  }, [haciendaId]);

  const gastosFiltrados = useMemo(() => {
    let filtrado = gastos;
    if (filtroCategoria !== 'TODOS') {
      filtrado = filtrado.filter(g => g.categoria === filtroCategoria);
    }
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtrado = filtrado.filter(g =>
        g.concepto?.toLowerCase().includes(term) ||
        g.categoria?.toLowerCase().includes(term) ||
        `${g.monto}`.includes(term)
      );
    }
    return filtrado;
  }, [gastos, filtroCategoria, searchTerm]);

  const totalDinero = useMemo(() => {
    return gastosFiltrados.reduce((acc, item) => acc + (parseFloat(item.monto) || 0), 0);
  }, [gastosFiltrados]);

  // --- FUNCIÓN PARA GUARDAR (CREAR O ACTUALIZAR) ---
  const guardarGasto = async (e) => {
    e.preventDefault();
    if (!nuevoGasto.concepto || !nuevoGasto.monto) return;

    try {
      if (editandoId) {
        // MODO EDICIÓN - actualizar en el backend
        const payload = {
          concepto: nuevoGasto.concepto.toUpperCase(),
          monto: parseFloat(nuevoGasto.monto),
          categoria: nuevoGasto.categoria,
        };
        const res = await authenticatedFetch(`/gastos/${editandoId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('Error response:', errData);
          throw new Error(errData.message || 'Error al actualizar gasto');
        }
        // Refrescar lista
        const refreshed = await authenticatedFetch('/gastos');
        const data = await refreshed.json();
        setGastos(data.data || []);
        setEditandoId(null);
        alert('Gasto actualizado correctamente');
      } else {
        // MODO NUEVO - crear en el backend
        const payload = {
          concepto: nuevoGasto.concepto.toUpperCase(),
          monto: parseFloat(nuevoGasto.monto),
          categoria: nuevoGasto.categoria,
        };
        const res = await authenticatedFetch('/gastos', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('Error response:', errData);
          throw new Error(errData.message || 'Error al crear gasto');
        }
        // Refrescar lista
        const refreshed = await authenticatedFetch('/gastos');
        const data = await refreshed.json();
        setGastos(data.data || []);
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al guardar el gasto');
    }

    setNuevoGasto({ concepto: '', monto: '', categoria: 'GENERAL' });
  };

  // --- PREPARAR EL FORMULARIO PARA EDITAR ---
  const prepararEdicion = (gasto) => {
    setEditandoId(gasto.id);
    setNuevoGasto({
      concepto: gasto.concepto,
      monto: gasto.monto,
      categoria: gasto.categoria
    });
    // Hacemos scroll hacia arriba para que el usuario vea el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNuevoGasto({ concepto: '', monto: '', categoria: 'GENERAL' });
  };

  const eliminarGasto = async (id) => {
    if (window.confirm('¿Eliminar este registro?')) {
      try {
        const res = await authenticatedFetch(`/gastos/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar gasto');
        const refreshed = await authenticatedFetch('/gastos');
        const data = await refreshed.json();
        setGastos(data.data || []);
      } catch (err) {
        console.error(err);
        alert('No se pudo eliminar el gasto');
      }
    }
  };

  const categorias = ['TODOS', 'GENERAL', 'NOMINA', 'ALIMENTO', 'MANTENIMIENTO', 'FARMACIA'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-600">Cargando gastos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* HEADER DINÁMICO */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2 italic">
            {editandoId ? 'Editando Registro...' : `Egresos ${filtroCategoria}`}
          </p>
          <h2 className={`text-6xl font-black tracking-tighter italic transition-colors ${editandoId ? 'text-blue-400' : 'text-green-400'}`}>
            $ {totalDinero.toLocaleString('es-CO')}
          </h2>
        </div>
          <BadgeDollarSign size={140} className="absolute right-[-20px] bottom-[-20px] text-white/5 rotate-12" />
          {/* Removed duplicate chart */}
      </div>
              <div className="w-full max-w-4xl mx-auto my-4">
          <ExpensesChart gastos={gastosFiltrados} />
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORMULARIO ADAPTATIVO */}
        <div className="lg:col-span-4">
          <div className={`p-8 rounded-[3rem] shadow-xl border transition-all duration-500 ${editandoId ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}>
            <h3 className={`text-xs font-black uppercase mb-6 flex items-center gap-2 ${editandoId ? 'text-blue-600' : 'text-slate-600'}`}>
              {editandoId ? <Edit3 size={16}/> : <Plus size={16}/>} 
              {editandoId ? 'Modificar Gasto' : 'Nuevo Gasto Manual'}
            </h3>
            
            <form onSubmit={guardarGasto} className="space-y-4">
              <input 
                type="text" 
                placeholder="CONCEPTO" 
                className="w-full p-4 bg-white/50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-400/30"
                value={nuevoGasto.concepto}
                onChange={(e) => setNuevoGasto({...nuevoGasto, concepto: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="MONTO $" 
                className="w-full p-4 bg-white/50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-blue-400/30"
                value={nuevoGasto.monto}
                onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}
              />
              <select 
                className="w-full p-4 bg-white/50 rounded-2xl font-bold text-xs outline-none"
                value={nuevoGasto.categoria}
                onChange={(e) => setNuevoGasto({...nuevoGasto, categoria: e.target.value})}
              >
                {categorias.filter(c => c !== 'TODOS').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button type="submit" className={`flex-1 py-5 text-white font-black rounded-3xl uppercase text-[10px] tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2 ${editandoId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                  {editandoId ? <Save size={16}/> : null} {editandoId ? 'Actualizar' : 'Registrar'}
                </button>
                {editandoId && (
                  <button onClick={cancelarEdicion} type="button" className="p-5 bg-slate-200 text-slate-600 rounded-3xl hover:bg-slate-300 transition-all">
                    <X size={20} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        {/* TABLA CON BOTÓN EDITAR */}
        <div className="lg:col-span-8">
          <div className="bg-slate-900/70 backdrop-blur-lg rounded-[3.5rem] shadow-xl border border-slate-800 overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Buscar por concepto..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 p-3 rounded-2xl bg-white/70 border border-gray-200 focus:border-blue-400/30"
              />
              <select
                className="p-3 rounded-2xl bg-white/70 border border-gray-200 focus:border-blue-400/30"
                value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)}
              >
                {categorias.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2 p-4">
              {gastosFiltrados.map(g => (
                <div key={g.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-slate-700 hover:bg-white/20 transition-colors">
                  <h3 className="text-sm font-bold text-white mb-2">{g.concepto}</h3>
                  <p className="text-xs text-slate-300">{g.fecha} • <span className="text-blue-400">{g.categoria}</span></p>
                  <p className="mt-2 text-lg font-black text-white">$ {parseFloat(g.monto).toLocaleString('es-CO')}</p>
                  <div className="flex items-center justify-end gap-2 mt-3">
                    <button onClick={() => prepararEdicion(g)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Editar"><Edit3 size={16} /></button>
                    <button onClick={() => eliminarGasto(g.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Eliminar"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


  </div>
);
};

export default GastosSistemas;