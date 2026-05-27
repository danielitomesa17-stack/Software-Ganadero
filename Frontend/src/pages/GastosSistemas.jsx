import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Search, Trash2, Edit3, LayoutGrid, List, X, FileText, BadgeDollarSign, CalendarDays, TrendingUp, PieChart } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExpensesChart from '../components/ExpensesChart';
import { authenticatedFetch } from '../services/api';

const GastosSistemas = () => {
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('TODOS');
  
  // Por defecto, este mes
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [fechaDesde, setFechaDesde] = useState(primerDiaMes);
  const [fechaHasta, setFechaHasta] = useState(ultimoDiaMes);

  // Modal y formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const estadoInicialForm = { concepto: '', monto: '', categoria: 'GENERAL', fecha: new Date().toISOString().split('T')[0] };
  const [formData, setFormData] = useState(estadoInicialForm);

  // Vista
  const [vistaTabular, setVistaTabular] = useState(false);

  const categorias = ['TODOS', 'GENERAL', 'NOMINA', 'ALIMENTO', 'MANTENIMIENTO', 'FARMACIA'];
  const categoriasForm = ['GENERAL', 'NOMINA', 'ALIMENTO', 'MANTENIMIENTO', 'FARMACIA'];

  const cargarGastos = useCallback(async () => {
    try {
      setCargando(true);
      const queryParams = new URLSearchParams();
      if (fechaDesde) queryParams.append('fechaDesde', fechaDesde);
      if (fechaHasta) queryParams.append('fechaHasta', fechaHasta);
      
      const res = await authenticatedFetch(`/gastos?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Error al obtener gastos');
      const data = await res.json();
      setGastos(data.data || []);
    } catch (err) {
      console.error('Error al cargar gastos', err);
    } finally {
      setCargando(false);
    }
  }, [fechaDesde, fechaHasta]);

  useEffect(() => {
    cargarGastos();
  }, [cargarGastos]);

  // Filtros locales
  const gastosFiltrados = useMemo(() => {
    return gastos.filter(g => {
      const cumpleCategoria = filtroCategoria === 'TODOS' || g.categoria === filtroCategoria;
      const term = busqueda.toLowerCase();
      const cumpleBusqueda = g.concepto?.toLowerCase().includes(term) || g.categoria?.toLowerCase().includes(term) || `${g.monto}`.includes(term);
      return cumpleCategoria && cumpleBusqueda;
    });
  }, [gastos, filtroCategoria, busqueda]);

  // KPIs
  const totalEgresos = useMemo(() => gastosFiltrados.reduce((acc, g) => acc + (parseFloat(g.monto) || 0), 0), [gastosFiltrados]);
  const promedioGasto = gastosFiltrados.length > 0 ? totalEgresos / gastosFiltrados.length : 0;
  
  const categoriaTop = useMemo(() => {
    if (gastosFiltrados.length === 0) return 'N/A';
    const sumas = {};
    gastosFiltrados.forEach(g => {
      sumas[g.categoria] = (sumas[g.categoria] || 0) + (parseFloat(g.monto) || 0);
    });
    return Object.keys(sumas).reduce((a, b) => sumas[a] > sumas[b] ? a : b);
  }, [gastosFiltrados]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!formData.concepto || !formData.monto) return;
    
    try {
      const payload = {
        concepto: formData.concepto,
        monto: parseFloat(formData.monto),
        categoria: formData.categoria,
        fecha: formData.fecha || new Date().toISOString().split('T')[0]
      };

      let res;
      if (editandoId) {
        res = await authenticatedFetch(`/gastos/${editandoId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await authenticatedFetch('/gastos', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error('Error al guardar el gasto');
      
      await cargarGastos();
      cerrarModal();
    } catch (err) {
      alert(err.message || 'Error al guardar');
    }
  };

  const prepararEdicion = (gasto) => {
    setEditandoId(gasto.id);
    setFormData({
      concepto: gasto.concepto,
      monto: gasto.monto,
      categoria: gasto.categoria || 'GENERAL',
      fecha: gasto.fecha ? new Date(gasto.fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setEditandoId(null);
    setFormData(estadoInicialForm);
  };

  const eliminarGasto = async (id) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      const res = await authenticatedFetch(`/gastos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      await cargarGastos();
    } catch (err) {
      alert(err.message || 'Error al eliminar el gasto');
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Reporte de Egresos', 14, 22);
    doc.setFontSize(11);
    doc.text(`Periodo: ${fechaDesde} al ${fechaHasta}`, 14, 30);
    doc.text(`Total: $ ${totalEgresos.toLocaleString('es-CO')}`, 14, 36);

    const tableColumn = ["Fecha", "Concepto", "Categoría", "Monto ($)"];
    const tableRows = [];

    gastosFiltrados.forEach(g => {
      const rowData = [
        new Date(g.fecha).toLocaleDateString(),
        g.concepto,
        g.categoria,
        parseFloat(g.monto).toLocaleString('es-CO')
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      startY: 42,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] } // slate-900
    });

    doc.save(`Reporte_Gastos_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="p-4 sm:p-8 bg-[#F8FAFC] min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Módulo Financiero</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic mt-1">Gestión de Egresos y Costos</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
            <input type="date" className="px-3 py-2 text-xs font-bold text-slate-600 outline-none cursor-pointer" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} title="Fecha Desde" />
            <div className="w-px bg-slate-200 mx-1"></div>
            <input type="date" className="px-3 py-2 text-xs font-bold text-slate-600 outline-none cursor-pointer" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} title="Fecha Hasta" />
          </div>

          <button onClick={exportarPDF} className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 font-black text-[10px] uppercase flex items-center gap-2">
            <FileText size={16}/> PDF
          </button>
          
          <button onClick={() => setVistaTabular(!vistaTabular)} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 flex items-center justify-center">
            {vistaTabular ? <LayoutGrid size={18}/> : <List size={18}/>}
          </button>
          
          <button onClick={() => setIsModalOpen(true)} className="flex-1 lg:flex-none bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center">
            <Plus size={18} className="inline mr-2"/> Registrar Gasto
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10 border border-slate-800">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Egresos</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-blue-400">$ {totalEgresos.toLocaleString('es-CO')}</h2>
          </div>
          <BadgeDollarSign size={100} className="absolute right-[-10px] bottom-[-10px] text-white/5 rotate-12" />
        </div>
        
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Gasto Promedio</p>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><TrendingUp size={18} /></div>
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900">$ {promedioGasto.toLocaleString('es-CO', {maximumFractionDigits: 0})}</h2>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Top Categoría</p>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl"><PieChart size={18} /></div>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase truncate">{categoriaTop}</h2>
        </div>
      </div>

      {/* FILTROS Y BUSCADOR */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Buscar concepto o monto..." 
            className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl outline-none font-bold text-xs shadow-sm border border-transparent focus:border-slate-200 transition-all text-slate-700"
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="flex overflow-x-auto pb-2 sm:pb-0 hide-scrollbar gap-2">
          {categorias.map(cat => (
            <button 
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-wider whitespace-nowrap transition-all shadow-sm ${filtroCategoria === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* GRÁFICAS */}
        <div className="lg:col-span-12 mb-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <ExpensesChart gastos={gastosFiltrados} />
        </div>

        {/* LISTA DE GASTOS */}
        <div className="lg:col-span-12">
          {cargando ? (
            <div className="p-10 text-center uppercase font-black text-slate-400">Cargando datos...</div>
          ) : gastosFiltrados.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-xs font-bold text-slate-400 italic">
              No hay egresos registrados en este periodo o filtro.
            </div>
          ) : vistaTabular ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50/70 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-8 py-5">Fecha</th>
                      <th className="px-6 py-5">Concepto</th>
                      <th className="px-6 py-5">Categoría</th>
                      <th className="px-6 py-5 text-right">Monto</th>
                      <th className="px-8 py-5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {gastosFiltrados.map(g => (
                      <tr key={g.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-8 py-5 font-bold text-slate-500 text-xs">{new Date(g.fecha).toLocaleDateString()}</td>
                        <td className="px-6 py-5 font-black uppercase text-slate-900 text-sm">{g.concepto}</td>
                        <td className="px-6 py-5">
                          <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200/50">{g.categoria}</span>
                        </td>
                        <td className="px-6 py-5 text-right font-black text-slate-900 text-sm">$ {parseFloat(g.monto).toLocaleString('es-CO')}</td>
                        <td className="px-8 py-5 text-right space-x-1 whitespace-nowrap">
                          <button onClick={() => prepararEdicion(g)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={16}/></button>
                          <button onClick={() => eliminarGasto(g.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {gastosFiltrados.map(g => (
                <div key={g.id} className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col justify-between">
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <CalendarDays size={18} className="text-slate-400" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(g.fecha).toLocaleDateString()}</span>
                    </div>
                    <span className="block text-[9px] font-black text-blue-600 uppercase tracking-wider mb-1">{g.categoria}</span>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight line-clamp-2">{g.concepto}</h3>
                  </div>
                  <div className="px-6 py-5 bg-slate-50/50 flex justify-between items-center border-t border-slate-100 mt-auto">
                    <span className="text-xl font-black text-slate-900">$ {parseFloat(g.monto).toLocaleString('es-CO')}</span>
                    <div className="flex gap-1">
                      <button onClick={() => prepararEdicion(g)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-white rounded-lg transition-all shadow-sm"><Edit3 size={16}/></button>
                      <button onClick={() => eliminarGasto(g.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-all shadow-sm"><Trash2 size={16}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL REGISTRO / EDICIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-xl border border-slate-100 relative">
            <button onClick={cerrarModal} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors"><X size={20}/></button>
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight text-slate-900">
              {editandoId ? 'Modificar Egreso' : 'Registrar Egreso'}
            </h2>
            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Concepto / Descripción</label>
                <input required placeholder="Ej. Compra de Vacunas" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-slate-200 transition-all uppercase text-slate-700" value={formData.concepto} onChange={e => setFormData({...formData, concepto: e.target.value.toUpperCase()})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Monto ($)</label>
                  <input required type="number" step="0.01" placeholder="0" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-slate-200 transition-all text-slate-700" value={formData.monto} onChange={e => setFormData({...formData, monto: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Fecha</label>
                  <input required type="date" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-xs uppercase cursor-pointer border border-transparent focus:border-slate-200 outline-none text-slate-700" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Categoría</label>
                <select className="w-full p-4 bg-slate-50 rounded-xl font-bold text-xs uppercase outline-none border border-transparent focus:border-slate-200 text-slate-700" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                  {categoriasForm.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-wider mt-4 hover:bg-blue-600 transition-all shadow-md shadow-slate-900/10">
                {editandoId ? 'Actualizar Registro' : 'Guardar Egreso'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GastosSistemas;