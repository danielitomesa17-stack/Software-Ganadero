import React, { useState, useEffect } from 'react';
import { getMedicamentos, crearMedicamento, eliminarMedicamento, actualizarMedicamento } from '../services/api';
import { Pill, Plus, Trash2, AlertCircle, Package, Search, DollarSign, Edit3, TrendingDown, Clock, AlertTriangle, Eye, Loader } from 'lucide-react';

const MedicamentosInventario = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [alertas, setAlertas] = useState({ stockBajo: [], vencidos: [], proximosVencer: [] });
  const [nuevoMed, setNuevoMed] = useState({
    nombre: '',
    stock: '',
    unidad: 'ml',
    precio: '',
    stock_minimo: '10',
    stock_maximo: '1000',
    fecha_vencimiento: '',
    numero_lote: '',
    fabricante: '',
    categoria: 'general',
  });
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [vista, setVista] = useState('inventario'); // 'inventario', 'alertas', 'historial'
  const [cargando, setCargando] = useState(false);

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [dataMeds, dataEstadisticas] = await Promise.all([
        getMedicamentos(),
        obtenerEstadisticas(),
      ]);

      if (dataMeds.success) {
        setMedicamentos(dataMeds.data);
        calcularAlertas(dataMeds.data);
      }

      if (dataEstadisticas?.success) {
        setEstadisticas(dataEstadisticas.data);
      }
    } catch (e) {
      console.error('Error al cargar datos:', e);
    } finally {
      setCargando(false);
    }
  };

  const calcularAlertas = (meds) => {
    const stockBajo = meds.filter(m => m.stock <= (m.stock_minimo || 10));
    const vencidos = meds.filter(m => m.fecha_vencimiento && new Date(m.fecha_vencimiento) < new Date());
    const proximosVencer = meds.filter(m => {
      if (!m.fecha_vencimiento) return false;
      const diasParaVencer = (new Date(m.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24);
      return diasParaVencer > 0 && diasParaVencer <= 30;
    });

    setAlertas({ stockBajo, vencidos, proximosVencer });
  };

  const validarMedicamento = () => {
    if (!nuevoMed.nombre?.trim()) {
      alert('El nombre es requerido');
      return false;
    }
    if (!nuevoMed.stock || parseFloat(nuevoMed.stock) < 0) {
      alert('Stock debe ser un número no negativo');
      return false;
    }
    if (!nuevoMed.precio || parseFloat(nuevoMed.precio) < 0) {
      alert('Precio debe ser un número no negativo');
      return false;
    }
    if (parseInt(nuevoMed.stock_minimo) >= parseInt(nuevoMed.stock_maximo)) {
      alert('Stock mínimo debe ser menor que stock máximo');
      return false;
    }
    return true;
  };

  const agregarMed = async (e) => {
    e.preventDefault();
    if (!validarMedicamento()) return;

    try {
      const payload = {
        nombre: nuevoMed.nombre.trim(),
        stock: parseFloat(nuevoMed.stock),
        unidad: nuevoMed.unidad,
        precio_compra: parseFloat(nuevoMed.precio),
        stock_minimo: parseInt(nuevoMed.stock_minimo),
        stock_maximo: parseInt(nuevoMed.stock_maximo),
        fecha_vencimiento: nuevoMed.fecha_vencimiento || null,
        numero_lote: nuevoMed.numero_lote || null,
        fabricante: nuevoMed.fabricante || null,
        categoria: nuevoMed.categoria,
      };

      if (editandoId) {
        await actualizarMedicamento(editandoId, payload);
        setEditandoId(null);
        alert('Medicamento actualizado');
      } else {
        await crearMedicamento(payload);
        alert('Medicamento guardado');
      }

      // Resetear formulario y recargar
      setNuevoMed({
        nombre: '',
        stock: '',
        unidad: 'ml',
        precio: '',
        stock_minimo: '10',
        stock_maximo: '1000',
        fecha_vencimiento: '',
        numero_lote: '',
        fabricante: '',
        categoria: 'general',
      });

      await cargarDatos();
    } catch (err) {
      console.error('Error guardando medicamento:', err);
      alert('Error al guardar el medicamento');
    }
  };

  const iniciarEdicion = (med) => {
    setEditandoId(med.id);
    setNuevoMed({
      nombre: med.nombre,
      stock: med.stock.toString(),
      unidad: med.unidad,
      precio: med.precio_compra ? med.precio_compra.toString() : '',
      stock_minimo: med.stock_minimo?.toString() || '10',
      stock_maximo: med.stock_maximo?.toString() || '1000',
      fecha_vencimiento: med.fecha_vencimiento ? med.fecha_vencimiento.split('T')[0] : '',
      numero_lote: med.numero_lote || '',
      fabricante: med.fabricante || '',
      categoria: med.categoria || 'general',
    });
  };

  const eliminarMed = async (id) => {
    if (window.confirm('¿Eliminar este medicamento?')) {
      try {
        await eliminarMedicamento(id);
        alert('Medicamento eliminado');
        await cargarDatos();
      } catch (err) {
        console.error('Error eliminando:', err);
        alert('No se pudo eliminar');
      }
    }
  };

  const obtenerEstadisticas = async () => {
    try {
      const res = await fetch('/api/medicamentos/reportes/estadisticas', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.json();
    } catch {
      return null;
    }
  };

  const medicamentosFiltrados = medicamentos.filter((m) => {
    const matchBusqueda = m.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = !filtroCategoria || m.categoria === filtroCategoria;
    return matchBusqueda && matchCategoria;
  });

  const tieneAlerta = (med) => {
    return (med.stock <= (med.stock_minimo || 10)) ||
           (med.fecha_vencimiento && new Date(med.fecha_vencimiento) < new Date()) ||
           (med.fecha_vencimiento && (new Date(med.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24) <= 30);
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      <header>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Farmacia Ganadera</h2>
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Control Profesional de Medicamentos</p>
      </header>

      {/* SELECTOR DE VISTA */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setVista('inventario')}
          className={`px-6 py-2 rounded-xl font-bold text-sm uppercase transition-all ${
            vista === 'inventario' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          📦 Inventario
        </button>
        <button
          onClick={() => setVista('alertas')}
          className={`px-6 py-2 rounded-xl font-bold text-sm uppercase transition-all ${
            vista === 'alertas' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          ⚠️ Alertas ({alertas.stockBajo.length + alertas.vencidos.length + alertas.proximosVencer.length})
        </button>
        <button
          onClick={() => setVista('historial')}
          className={`px-6 py-2 rounded-xl font-bold text-sm uppercase transition-all ${
            vista === 'historial' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          📊 Reportes
        </button>
      </div>

      {/* VISTA: INVENTARIO */}
      {vista === 'inventario' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FORMULARIO */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 sticky top-8">
              <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-2">
                <Plus size={16} className="text-blue-600" /> {editandoId ? 'Editar Medicamento' : 'Nuevo Medicamento'}
              </h3>
              <form onSubmit={agregarMed} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre (Ej: Ivermectina 1%)"
                  className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500"
                  value={nuevoMed.nombre}
                  onChange={(e) => setNuevoMed({ ...nuevoMed, nombre: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Cantidad"
                    className="p-4 bg-slate-50 rounded-2xl font-bold outline-none"
                    value={nuevoMed.stock}
                    onChange={(e) => setNuevoMed({ ...nuevoMed, stock: e.target.value })}
                  />
                  <select
                    className="p-4 bg-slate-50 rounded-2xl font-bold text-xs outline-none"
                    value={nuevoMed.unidad}
                    onChange={(e) => setNuevoMed({ ...nuevoMed, unidad: e.target.value })}
                  >
                    <option value="ml">ml</option>
                    <option value="L">L</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="Dosis">Dosis</option>
                    <option value="Frasco">Frasco</option>
                  </select>
                </div>

                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={18} />
                  <input
                    type="number"
                    placeholder="Precio de Compra"
                    className="w-full p-4 pl-12 bg-green-50 rounded-2xl font-bold outline-none"
                    value={nuevoMed.precio}
                    onChange={(e) => setNuevoMed({ ...nuevoMed, precio: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Stock Mín"
                    className="p-4 bg-slate-50 rounded-2xl font-bold text-xs outline-none"
                    value={nuevoMed.stock_minimo}
                    onChange={(e) => setNuevoMed({ ...nuevoMed, stock_minimo: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Stock Máx"
                    className="p-4 bg-slate-50 rounded-2xl font-bold text-xs outline-none"
                    value={nuevoMed.stock_maximo}
                    onChange={(e) => setNuevoMed({ ...nuevoMed, stock_maximo: e.target.value })}
                  />
                </div>

                <input
                  type="date"
                  placeholder="Fecha Vencimiento"
                  className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs outline-none"
                  value={nuevoMed.fecha_vencimiento}
                  onChange={(e) => setNuevoMed({ ...nuevoMed, fecha_vencimiento: e.target.value })}
                />

                <input
                  type="text"
                  placeholder="Número Lote"
                  className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs outline-none"
                  value={nuevoMed.numero_lote}
                  onChange={(e) => setNuevoMed({ ...nuevoMed, numero_lote: e.target.value })}
                />

                <button
                  type="submit"
                  className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all hover:bg-slate-800"
                >
                  {editandoId ? 'Actualizar' : 'Ingresar a Farmacia'}
                </button>
                {editandoId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoId(null);
                      setNuevoMed({
                        nombre: '', stock: '', unidad: 'ml', precio: '', stock_minimo: '10',
                        stock_maximo: '1000', fecha_vencimiento: '', numero_lote: '', fabricante: '', categoria: 'general',
                      });
                    }}
                    className="w-full py-3 bg-slate-300 text-slate-700 font-black rounded-2xl uppercase text-xs"
                  >
                    Cancelar
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* TABLA */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="BUSCAR MEDICAMENTO..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl font-bold text-[10px] uppercase outline-none"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
                <div className="text-[9px] font-black text-slate-400">
                  {medicamentosFiltrados.length} de {medicamentos.length} medicamentos
                </div>
              </div>

              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr className="text-[9px] font-black text-slate-400 uppercase border-b border-slate-200">
                      <th className="px-6 py-4">Medicamento</th>
                      <th className="px-6 py-4 text-center">Stock</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                      <th className="px-6 py-4 text-center">Vencimiento</th>
                      <th className="px-6 py-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicamentosFiltrados.map((m) => (
                      <tr key={m.id} className={`hover:bg-slate-50 ${tieneAlerta(m) ? 'bg-red-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="font-black text-slate-900">{m.nombre}</div>
                          <div className="text-[8px] text-slate-500">{m.numero_lote ? `Lote: ${m.numero_lote}` : ''}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-blue-600 font-black">{m.stock}</span>
                          <span className="text-[8px] text-slate-400 ml-1">{m.unidad}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {m.stock <= (m.stock_minimo || 10) ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-[7px] font-black animate-pulse">
                              ⚠️ STOCK BAJO
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-[7px] font-black">
                              ✓ OK
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-[9px]">
                          {m.fecha_vencimiento ? (
                            new Date(m.fecha_vencimiento) < new Date() ? (
                              <span className="text-red-600 font-black">❌ VENCIDO</span>
                            ) : (new Date(m.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24) <= 30 ? (
                              <span className="text-orange-600 font-black">⏰ PRÓXIMO</span>
                            ) : (
                              <span className="text-slate-500">{m.fecha_vencimiento.split('T')[0]}</span>
                            )
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => iniciarEdicion(m)} className="text-slate-400 hover:text-blue-600 mr-3 transition-colors">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => eliminarMed(m.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
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
      )}

      {/* VISTA: ALERTAS */}
      {vista === 'alertas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Bajo */}
          <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200 shadow-lg">
            <h3 className="text-sm font-black text-red-700 mb-4 flex items-center gap-2">
              <TrendingDown size={20} /> Stock Bajo ({alertas.stockBajo.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alertas.stockBajo.length === 0 ? (
                <p className="text-red-600 text-sm">✓ No hay medicamentos con stock bajo</p>
              ) : (
                alertas.stockBajo.map((m) => (
                  <div key={m.id} className="bg-white p-3 rounded-lg border-l-4 border-red-500">
                    <div className="font-bold text-slate-900">{m.nombre}</div>
                    <div className="text-[12px] text-slate-600">
                      Stock: {m.stock} {m.unidad} (Mínimo: {m.stock_minimo || 10})
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Próximos a Vencer */}
          <div className="bg-orange-50 p-6 rounded-2xl border-2 border-orange-200 shadow-lg">
            <h3 className="text-sm font-black text-orange-700 mb-4 flex items-center gap-2">
              <Clock size={20} /> Próximos a Vencer ({alertas.proximosVencer.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alertas.proximosVencer.length === 0 ? (
                <p className="text-orange-600 text-sm">✓ Sin medicamentos próximos a vencer</p>
              ) : (
                alertas.proximosVencer.map((m) => (
                  <div key={m.id} className="bg-white p-3 rounded-lg border-l-4 border-orange-500">
                    <div className="font-bold text-slate-900">{m.nombre}</div>
                    <div className="text-[12px] text-slate-600">Vence: {m.fecha_vencimiento.split('T')[0]}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Vencidos */}
          <div className="bg-red-100 p-6 rounded-2xl border-2 border-red-600 shadow-lg">
            <h3 className="text-sm font-black text-red-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} /> Vencidos ({alertas.vencidos.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alertas.vencidos.length === 0 ? (
                <p className="text-red-700 text-sm">✓ Sin medicamentos vencidos</p>
              ) : (
                alertas.vencidos.map((m) => (
                  <div key={m.id} className="bg-white p-3 rounded-lg border-l-4 border-red-600">
                    <div className="font-bold text-slate-900">{m.nombre}</div>
                    <div className="text-[12px] text-red-600">⚠️ Vencido: {m.fecha_vencimiento.split('T')[0]}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VISTA: REPORTES */}
      {vista === 'historial' && estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200">
            <div className="text-3xl font-black text-blue-600">{estadisticas.total_medicamentos}</div>
            <div className="text-sm text-blue-700">Medicamentos Activos</div>
          </div>
          <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
            <div className="text-3xl font-black text-red-600">{estadisticas.en_stock_bajo}</div>
            <div className="text-sm text-red-700">En Stock Bajo</div>
          </div>
          <div className="bg-orange-50 p-6 rounded-2xl border-2 border-orange-200">
            <div className="text-3xl font-black text-orange-600">{estadisticas.proximo_vencer}</div>
            <div className="text-sm text-orange-700">Próximos a Vencer</div>
          </div>
          <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200 lg:col-span-2">
            <div className="text-sm text-green-700 font-bold">Valor Total del Inventario</div>
            <div className="text-3xl font-black text-green-600">
              ${estadisticas.valor_inventario ? estadisticas.valor_inventario.toLocaleString() : 0}
            </div>
          </div>
        </div>
      )}

      {cargando && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center rounded-lg">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      )}
    </div>
  );
};

export default MedicamentosInventario;