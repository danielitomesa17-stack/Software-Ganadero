import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Sprout, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../services/api';

const AforosLista = () => {
  const navigate = useNavigate();
  const [aforos, setAforos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAforo, setEditingAforo] = useState(null);

  const estadoInicial = {
    nombre_potrero: '',
    fecha: new Date().toISOString().split('T')[0],
    peso_muestra_1: '',
    peso_muestra_2: '',
    peso_muestra_3: '',
    area_total_ha: '',
    observaciones: ''
  };

  const [formData, setFormData] = useState(estadoInicial);

  const cargarAforos = async () => {
    try {
      setCargando(true);
      const res = await authenticatedFetch('/aforos');
      if (res.ok) {
        const data = await res.json();
        setAforos(data);
      }
    } catch (error) {
      console.error("Error al cargar aforos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAforos();
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      const url = editingAforo ? `/aforos/${editingAforo.id}` : '/aforos';
      const method = editingAforo ? 'PUT' : 'POST';
      
      const res = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        await cargarAforos();
        setIsModalOpen(false);
        setEditingAforo(null);
        setFormData(estadoInicial);
      } else {
        alert("Error al guardar el aforo");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  const eliminarAforo = async (id) => {
    if (!window.confirm("¿Eliminar este aforo?")) return;
    try {
      const res = await authenticatedFetch(`/aforos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await cargarAforos();
      }
    } catch (error) {
      alert("Error al eliminar aforo");
    }
  };

  const abrirEditar = (aforo) => {
    setEditingAforo(aforo);
    setFormData({
      nombre_potrero: aforo.nombre_potrero,
      fecha: new Date(aforo.fecha).toISOString().split('T')[0],
      peso_muestra_1: aforo.peso_muestra_1,
      peso_muestra_2: aforo.peso_muestra_2,
      peso_muestra_3: aforo.peso_muestra_3,
      area_total_ha: aforo.area_total_ha,
      observaciones: aforo.observaciones || ''
    });
    setIsModalOpen(true);
  };

  const aforosFiltrados = aforos.filter(a => 
    a.nombre_potrero.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 bg-[#F8FAFC]">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-2">
            <Sprout className="text-green-600" /> Aforo de Potreros
          </h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic mt-1">
            Gestión de Capacidad Forrajera
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/app')} 
            className="flex-1 sm:flex-none bg-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-black text-xs uppercase hover:bg-slate-300 transition-all shadow-sm"
          >
            Volver
          </button>
          <button 
            onClick={() => {
              setEditingAforo(null);
              setFormData(estadoInicial);
              setIsModalOpen(true);
            }} 
            className="flex-1 sm:flex-none bg-green-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
          >
            <Plus size={18} className="inline mr-2"/> Nuevo Aforo
          </button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="relative mb-6">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text" 
          placeholder="Buscar potrero..."
          className="w-full pl-14 pr-8 py-5 bg-white rounded-2xl outline-none font-bold text-xs shadow-sm border border-transparent focus:border-green-200 transition-all text-slate-700"
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* CONTENIDO */}
      {cargando ? (
        <div className="text-center p-10 font-black text-slate-400 uppercase text-sm">Cargando...</div>
      ) : aforosFiltrados.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-xs font-bold text-slate-400 italic">
          No hay aforos registrados que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aforosFiltrados.map((aforo) => (
            <div key={aforo.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="block text-[10px] font-black text-green-600 uppercase tracking-wider mb-1">
                    {new Date(aforo.fecha).toLocaleDateString('es-CO')}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight truncate">{aforo.nombre_potrero}</h3>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => abrirEditar(aforo)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={16}/></button>
                  <button onClick={() => eliminarAforo(aforo.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 mb-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Área (HA)</span>
                  <span className="text-sm font-black text-slate-700">{aforo.area_total_ha}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Promedio M²</span>
                  <span className="text-sm font-black text-slate-700">{aforo.promedio_kg_m2} KG</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Forraje Aprovechable</span>
                  <span className="text-lg font-black text-green-600">{(aforo.forraje_aprovechable_kg / 1000).toFixed(2)} TON</span>
                </div>
                {aforo.observaciones && (
                  <div className="text-slate-300" title={aforo.observaciones}>
                    <FileText size={18} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREAR/EDITAR AFORO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight text-slate-900">
              {editingAforo ? 'Editar Aforo' : 'Nuevo Aforo'}
            </h2>
            <form onSubmit={handleGuardar} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Potrero</label>
                  <input required placeholder="Nombre o ID del Potrero" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-green-200 transition-all text-slate-700" value={formData.nombre_potrero} onChange={e => setFormData({...formData, nombre_potrero: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Fecha</label>
                  <input type="date" required className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-green-200 transition-all text-slate-700" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Área del Potrero (Hectáreas)</label>
                <input type="number" step="0.01" required placeholder="Ej: 2.5" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-green-200 transition-all text-slate-700" value={formData.area_total_ha} onChange={e => setFormData({...formData, area_total_ha: e.target.value})} />
              </div>

              <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                <p className="text-[10px] font-black text-green-700 uppercase mb-3 text-center">Pesaje de Muestras 1m² (KG)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input type="number" step="0.01" required placeholder="Muestra 1" className="w-full p-3 bg-white rounded-xl font-bold text-xs text-center border-transparent focus:border-green-300 outline-none text-slate-700" value={formData.peso_muestra_1} onChange={e => setFormData({...formData, peso_muestra_1: e.target.value})} />
                  </div>
                  <div>
                    <input type="number" step="0.01" required placeholder="Muestra 2" className="w-full p-3 bg-white rounded-xl font-bold text-xs text-center border-transparent focus:border-green-300 outline-none text-slate-700" value={formData.peso_muestra_2} onChange={e => setFormData({...formData, peso_muestra_2: e.target.value})} />
                  </div>
                  <div>
                    <input type="number" step="0.01" required placeholder="Muestra 3" className="w-full p-3 bg-white rounded-xl font-bold text-xs text-center border-transparent focus:border-green-300 outline-none text-slate-700" value={formData.peso_muestra_3} onChange={e => setFormData({...formData, peso_muestra_3: e.target.value})} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Observaciones</label>
                <textarea rows="2" placeholder="Estado del pasto, clima, etc." className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-green-200 transition-all text-slate-700 resize-none" value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} />
              </div>

              <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-xl font-black uppercase text-xs tracking-wider hover:bg-green-700 transition-all shadow-md mt-4">
                {editingAforo ? 'Actualizar Aforo' : 'Guardar Aforo'}
              </button>
              <button type="button" onClick={() => { setIsModalOpen(false); setEditingAforo(null); setFormData(estadoInicial); }} className="w-full text-slate-400 font-bold text-[10px] uppercase text-center pt-2 hover:text-slate-600 transition-colors">
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AforosLista;
