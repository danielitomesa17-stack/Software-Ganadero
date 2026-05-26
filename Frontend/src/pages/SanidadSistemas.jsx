import React, { useState, useEffect } from 'react';
import { Pill, Plus, Trash2, Package, DollarSign, Activity } from 'lucide-react';
import { authenticatedFetch } from '../services/api';

const MedicamentosInventario = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nuevoReg, setNuevoReg] = useState({ 
    animalId: '',
    chapeta: '',
    nombre: '', 
    stock: '', 
    unidad: 'ml',
    precio: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await authenticatedFetch('/api/sanidad');
        setRegistros(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const guardarInsumo = async (e) => {
    e.preventDefault();
    if (!nuevoReg.nombre || !nuevoReg.stock || !nuevoReg.precio) {
      alert("Por favor rellene nombre, cantidad y precio de compra");
      return;
    }
    try {
      const nuevoRegistro = {
        animal_id: parseInt(nuevoReg.animalId) || null,
        chapeta: nuevoReg.chapeta,
        medicamento: nuevoReg.nombre.toUpperCase(),
        dosis: nuevoReg.stock,
        fecha: new Date().toISOString().split('T')[0],
        proximaDosis: null,
        observacion: ''
      };
      const response = await authenticatedFetch('/api/sanidad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoRegistro)
      });
      const created = await response.json();
      setRegistros([created, ...registros]);
      setNuevoReg({ animalId: '', chapeta: '', nombre: '', stock: '', unidad: 'ml', precio: '' });
      alert("Registro guardado exitosamente");
    } catch (err) {
      alert('Error al guardar registro: ' + err.message);
    }
  };

  const eliminarMed = async (id) => {
    if (window.confirm("¿Eliminar este registro?")) {
      try {
        await authenticatedFetch(`/api/sanidad/${id}`, { method: 'DELETE' });
        setRegistros(registros.filter(r => r.id !== id));
      } catch (err) {
        alert('Error al eliminar: ' + err.message);
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER DE SECCIÓN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
            <Pill className="text-amber-500" size={32} /> Farmacia Danubio
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Control de Insumos y Costos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORMULARIO DE INGRESO */}
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 sticky top-24">
            <h3 className="text-xs font-black uppercase mb-6 text-amber-600 flex items-center gap-2">
              <Plus size={16}/> Registrar Compra
            </h3>
            
            <form onSubmit={guardarInsumo} className="space-y-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase ml-2">ID del Animal</label>
                 <input 
                   type="number" 
                   placeholder="ID del animal (numérico)" 
                   className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none"
                   value={nuevoReg.animalId}
                   onChange={(e) => setNuevoReg({...nuevoReg, animalId: e.target.value})}
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Chapeta</label>
                 <input 
                   type="text" 
                   placeholder="Ej: CH-001" 
                   className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none"
                   value={nuevoReg.chapeta}
                   onChange={(e) => setNuevoReg({...nuevoReg, chapeta: e.target.value})}
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nombre del Medicamento</label>
                 <input 
                   type="text" 
                   placeholder="Ej: IVERMECTINA..." 
                   className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-500/20 uppercase"
                   value={nuevoReg.nombre}
                   onChange={(e) => setNuevoReg({...nuevoReg, nombre: e.target.value})}
                 />
               </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Cantidad</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none"
                    value={nuevoReg.stock}
                    onChange={(e) => setNuevoReg({...nuevoReg, stock: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Unidad</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none appearance-none"
                    value={nuevoReg.unidad}
                    onChange={(e) => setNuevoReg({...nuevoReg, unidad: e.target.value})}
                  >
                    <option value="ml">Mililitros (ml)</option>
                    <option value="frascos">Frascos</option>
                    <option value="dosis">Dosis</option>
                    <option value="kg">Kilos (kg)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-amber-600 uppercase ml-2 flex items-center gap-1">
                  <DollarSign size={10} /> Costo de Compra (Total)
                </label>
                <input 
                  type="number" 
                  placeholder="$ 0.00" 
                  className="w-full p-4 bg-amber-50 rounded-2xl font-black text-amber-700 outline-none border-2 border-amber-100 focus:border-amber-500/40"
                  value={nuevoReg.precio}
                  onChange={(e) => setNuevoReg({ ...nuevoReg, precio: e.target.value })}
                />
              </div>

              <button type="submit" className="w-full py-5 bg-amber-500 text-white font-black rounded-[2rem] uppercase text-xs tracking-widest shadow-lg shadow-amber-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                <Package size={18} /> Guardar y Contabilizar
              </button>
            </form>
          </div>
        </div>

        {/* LISTADO DE STOCK ACTUAL */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[3.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="px-10 py-6">Insumo</th>
                  <th className="px-10 py-6 text-center">Cantidad</th>
                  <th className="px-10 py-6 text-center">Fecha</th>
                  <th className="px-10 py-6 text-center">Prox. Dosis</th>
                  <th className="px-10 py-6 text-center">Obs</th>
                  <th className="px-10 py-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-bold">
                 {registros.map(r => (
                   <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                     <td className="px-10 py-6">
                       <p className="font-black text-slate-800 text-sm uppercase tracking-tighter">{r.chapeta} - {r.medicamento}</p>
                     </td>
                     <td className="px-10 py-6 text-center">
                       <span className="text-xl font-black text-slate-900">{r.dosis}</span>
                       <span className="ml-1 text-[10px] text-slate-400 uppercase">{r.unidad || ''}</span>
                     </td>
                     <td className="px-10 py-6 text-center">
                       {r.fecha}
                     </td>
                     <td className="px-10 py-6 text-center">
                       {r.proximaDosis || '-'}
                     </td>
                     <td className="px-10 py-6 text-center">
                       {r.observacion || '-'}
                     </td>
                     <td className="px-10 py-6 text-center">
                       <button onClick={() => eliminarMed(r.id)} className="text-slate-200 hover:text-red-500 transition-colors">
                         <Trash2 size={18} />
                       </button>
                     </td>
                   </tr>
                 ))}
                 {registros.length === 0 && (
                   <tr>
                     <td colSpan="6" className="py-20 text-center text-slate-300 italic text-sm">No hay registros de sanidad.</td>
                   </tr>
                 )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicamentosInventario;