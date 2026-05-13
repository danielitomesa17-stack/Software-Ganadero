import React, { useState, useEffect } from 'react';
import { Pill, Plus, Trash2, Package, DollarSign, Activity } from 'lucide-react';

const MedicamentosInventario = () => {
  const [medicamentos, setMedicamentos] = useState(() => {
    const saved = localStorage.getItem('inventario_medicamentos_danubio');
    return saved ? JSON.parse(saved) : [];
  });

  const [nuevoMed, setNuevoMed] = useState({ 
    nombre: '', 
    stock: '', 
    unidad: 'ml',
    precio: '' // <--- CAMPO PARA ENLAZAR CON GASTOS
  });

  // Guardar en LocalStorage cada vez que cambie la lista
  useEffect(() => {
    localStorage.setItem('inventario_medicamentos_danubio', JSON.stringify(medicamentos));
  }, [medicamentos]);

  const guardarInsumo = (e) => {
    e.preventDefault();
    if (!nuevoMed.nombre || !nuevoMed.stock || !nuevoMed.precio) {
      alert("Por favor rellene nombre, cantidad y precio de compra");
      return;
    }

    const idUnico = Date.now();

    // 1. REGISTRO EN INVENTARIO
    const nuevoItem = {
      id: idUnico,
      nombre: nuevoMed.nombre.toUpperCase(),
      stock: parseFloat(nuevoMed.stock),
      unidad: nuevoMed.unidad
    };
    setMedicamentos([nuevoItem, ...medicamentos]);

    // 2. ENLACE AUTOMÁTICO A GASTOS
    const nuevoGasto = {
      id: idUnico + 1,
      fecha: new Date().toISOString().split('T')[0],
      concepto: `COMPRA INSUMO: ${nuevoMed.nombre.toUpperCase()}`,
      monto: parseFloat(nuevoMed.precio),
      categoria: 'FARMACIA'
    };

    const gastosActuales = JSON.parse(localStorage.getItem('gastos_danubio') || '[]');
    localStorage.setItem('gastos_danubio', JSON.stringify([nuevoGasto, ...gastosActuales]));

    // 3. LIMPIAR FORMULARIO
    setNuevoMed({ nombre: '', stock: '', unidad: 'ml', precio: '' });
    alert("Stock actualizado y gasto registrado en Finanzas");
    
    // Notificar a otros componentes (como el Sidebar o Gastos)
    window.dispatchEvent(new Event('storage'));
  };

  const eliminarMed = (id) => {
    if (window.confirm("¿Eliminar este medicamento? (Esto no borrará el gasto ya registrado)")) {
      setMedicamentos(medicamentos.filter(m => m.id !== id));
    }
  };

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
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nombre del Producto</label>
                <input 
                  type="text" 
                  placeholder="Ej: IVERMECTINA..." 
                  className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-500/20 uppercase"
                  value={nuevoMed.nombre}
                  onChange={(e) => setNuevoMed({...nuevoMed, nombre: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Cantidad</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none"
                    value={nuevoMed.stock}
                    onChange={(e) => setNuevoMed({...nuevoMed, stock: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Unidad</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none appearance-none"
                    value={nuevoMed.unidad}
                    onChange={(e) => setNuevoMed({...nuevoMed, unidad: e.target.value})}
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
                  value={nuevoMed.precio}
                  onChange={(e) => setNuevoMed({...nuevoMed, precio: e.target.value})}
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
                  <th className="px-10 py-6 text-center">Stock Disponible</th>
                  <th className="px-10 py-6 text-center">Estado</th>
                  <th className="px-10 py-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-bold">
                {medicamentos.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-10 py-6">
                      <p className="font-black text-slate-800 text-sm uppercase tracking-tighter">{m.nombre}</p>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="text-xl font-black text-slate-900">{m.stock}</span>
                      <span className="ml-1 text-[10px] text-slate-400 uppercase">{m.unidad}</span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      {m.stock <= 5 ? (
                        <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-[8px] font-black uppercase">Crítico</span>
                      ) : (
                        <span className="bg-green-50 text-green-500 px-3 py-1 rounded-full text-[8px] font-black uppercase">OK</span>
                      )}
                    </td>
                    <td className="px-10 py-6 text-center">
                      <button onClick={() => eliminarMed(m.id)} className="text-slate-200 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {medicamentos.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-20 text-center text-slate-300 italic text-sm">No hay medicamentos en inventario.</td>
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