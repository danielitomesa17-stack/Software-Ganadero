import React, { useState, useEffect } from 'react';
import { Pill, Plus, Trash2, AlertCircle, Package, Search, DollarSign } from 'lucide-react';

const MedicamentosInventario = () => {
  const [medicamentos, setMedicamentos] = useState(() => {
    const saved = localStorage.getItem('inventario_medicamentos_danubio');
    return saved ? JSON.parse(saved) : [];
  });

  // 1. Agregamos 'precio' al estado inicial
  const [nuevoMed, setNuevoMed] = useState({ nombre: '', stock: '', unidad: 'ml', precio: '' });
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    localStorage.setItem('inventario_medicamentos_danubio', JSON.stringify(medicamentos));
  }, [medicamentos]);

  const agregarMed = (e) => {
    e.preventDefault();
    // Validamos que el precio también esté presente
    if (!nuevoMed.nombre || !nuevoMed.stock || !nuevoMed.precio) {
        alert("Por favor completa Nombre, Cantidad y Precio de compra");
        return;
    }
    
    const idUnico = Date.now();

    // A. Lógica de Inventario (Tu código original)
    const nuevo = { 
        id: idUnico, 
        nombre: nuevoMed.nombre.toUpperCase(), 
        stock: parseFloat(nuevoMed.stock),
        unidad: nuevoMed.unidad 
    };
    setMedicamentos([...medicamentos, nuevo]);

    // B. EL ENLACE: Lógica de Gastos (Lo que conecta las ventanas)
    const nuevoGasto = {
        id: idUnico + 1,
        fecha: new Date().toISOString().split('T')[0],
        concepto: `COMPRA INSUMO: ${nuevoMed.nombre.toUpperCase()}`,
        monto: parseFloat(nuevoMed.precio),
        categoria: 'FARMACIA'
    };

    const gastosActuales = JSON.parse(localStorage.getItem('gastos_danubio') || '[]');
    localStorage.setItem('gastos_danubio', JSON.stringify([nuevoGasto, ...gastosActuales]));

    // Limpiamos todo el formulario incluyendo el precio
    setNuevoMed({ nombre: '', stock: '', unidad: 'ml', precio: '' });
    alert("Insumo guardado y gasto registrado en Finanzas");
  };

  const eliminarMed = (id) => {
    if (window.confirm("¿Eliminar este insumo?")) {
      setMedicamentos(medicamentos.filter(m => m.id !== id));
    }
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      <header>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Farmacia Ganadera</h2>
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Control de Insumos y Stock</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORMULARIO DE INGRESO */}
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
            <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-2">
              <Plus size={16} className="text-blue-600"/> Nuevo Insumo
            </h3>
            <form onSubmit={agregarMed} className="space-y-4">
              <input 
                type="text" 
                placeholder="Nombre (Ej: Ivermectina 1%)" 
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500/10"
                value={nuevoMed.nombre} 
                onChange={e => setNuevoMed({...nuevoMed, nombre: e.target.value.toUpperCase()})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="Cantidad" 
                  className="p-4 bg-slate-50 rounded-2xl font-bold outline-none"
                  value={nuevoMed.stock} 
                  onChange={e => setNuevoMed({...nuevoMed, stock: e.target.value})}
                />
                <select 
                  className="p-4 bg-slate-50 rounded-2xl font-bold text-xs outline-none"
                  value={nuevoMed.unidad}
                  onChange={e => setNuevoMed({...nuevoMed, unidad: e.target.value})}
                >
                  <option value="ml">ml</option>
                  <option value="Dosis">Dosis</option>
                  <option value="Frasco">Frasco</option>
                  <option value="Gramos">Gramos</option>
                </select>
              </div>

              {/* NUEVO CAMPO DE PRECIO (El puente) */}
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={18} />
                <input 
                  type="number" 
                  placeholder="Precio de Compra" 
                  className="w-full p-4 pl-12 bg-green-50 rounded-2xl font-black text-green-700 outline-none border-2 border-transparent focus:border-green-500/20"
                  value={nuevoMed.precio} 
                  onChange={e => setNuevoMed({...nuevoMed, precio: e.target.value})}
                />
              </div>

              <button className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">
                Ingresar a Farmacia
              </button>
            </form>
          </div>
        </div>

        {/* TABLA DE STOCK */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="BUSCAR INSUMO..." 
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl font-black text-[10px] uppercase outline-none"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 text-[9px] font-black uppercase text-slate-400">
                    <Package size={14}/> {medicamentos.length} Productos en inventario
                </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <th className="px-8 py-5">Insumo</th>
                    <th className="px-8 py-5 text-center">Stock Actual</th>
                    <th className="px-8 py-5 text-center">Estado</th>
                    <th className="px-8 py-5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold italic">
                  {medicamentos.filter(m => m.nombre.includes(busqueda.toUpperCase())).map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="px-8 py-6 text-slate-900 font-black">{m.nombre}</td>
                      <td className="px-8 py-6 text-center text-blue-600 font-black text-xl">
                        {m.stock} <span className="text-[10px] text-slate-400 uppercase">{m.unidad}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        {m.stock <= 5 ? (
                          <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-[8px] font-black animate-pulse">STOCK BAJO</span>
                        ) : (
                          <span className="bg-green-50 text-green-500 px-3 py-1 rounded-full text-[8px] font-black">EN EXISTENCIA</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button onClick={() => eliminarMed(m.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicamentosInventario;