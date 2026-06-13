import React, { useState, useMemo, useCallback } from 'react';
import { Download, Filter, BarChart3, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../services/api';
import { parseDateString } from '../utils/dateUtils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportesInventario = () => {
  const navigate = useNavigate();
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroLote, setFiltroLote] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cargar animales
  React.useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const res = await authenticatedFetch('/animales');
        if (res.ok) {
          const datos = await res.json();
          setAnimales(datos);
        }
      } catch (err) {
        console.error("Error al cargar:", err);
        alert("Error al cargar animales");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // Filtrar animales
  const animalesFiltrados = useMemo(() => {
    return animales.filter(a => {
      const matchLote = filtroLote === '' || a.lote.toLowerCase().includes(filtroLote.toLowerCase());
      const matchEstado = filtroEstado === '' || a.estado === filtroEstado;
      return matchLote && matchEstado;
    });
  }, [animales, filtroLote, filtroEstado]);

  // Calcular GDP para cada animal
  const animalesConAnalisis = useMemo(() => {
    return animalesFiltrados.map(a => {
      let gdp = null;
      if (a.historial && a.historial.length >= 2) {
        const sorted = [...a.historial].sort((x, y) => {
          return parseDateString(x.fecha) - parseDateString(y.fecha);
        });
        const primero = sorted[0];
        const ultimo = sorted[sorted.length - 1];
        const d1 = parseDateString(primero.fecha);
        const d2 = parseDateString(ultimo.fecha);
        const dias = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
        if (dias > 0) gdp = ((ultimo.peso - primero.peso) / dias).toFixed(2);
      }

      const progreso = a.peso_objetivo ? ((a.pesoActual / a.peso_objetivo) * 100).toFixed(1) : null;

      return { ...a, gdp: Number(gdp), progreso };
    });
  }, [animalesFiltrados]);

  const totalPages = Math.ceil(animalesConAnalisis.length / itemsPerPage);
  const currentAnimales = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return animalesConAnalisis.slice(start, start + itemsPerPage);
  }, [animalesConAnalisis, currentPage, itemsPerPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filtroLote, filtroEstado]);

  // Estadísticas generales
  const estadisticas = useMemo(() => {
    const total = animalesConAnalisis.length;
    const pesoPromedio = total > 0 ? (animalesConAnalisis.reduce((s, a) => s + a.pesoActual, 0) / total).toFixed(1) : 0;
    const gdpPromedio = animalesConAnalisis
      .filter(a => a.gdp !== null)
      .reduce((s, a) => s + a.gdp, 0) / (animalesConAnalisis.filter(a => a.gdp !== null).length || 1);

    return { total, pesoPromedio, gdpPromedio: gdpPromedio.toFixed(2) };
  }, [animalesConAnalisis]);

  // Descargar CSV
  const descargarCSV = () => {
    let csv = 'Chapeta,Raza,Sexo,Lote,Peso Inicial,Peso Actual,Objetivo,Progreso (%),GDP (kg/día),Estado,Fecha Entrada\n';

    animalesConAnalisis.forEach(a => {
      const primerPesaje = a.historial && a.historial.length > 0 ? a.historial[0].fecha : 'N/A';
      csv += `"${a.chapeta}","${a.raza}","${a.sexo}","${a.lote}",${a.pesoInicial},${a.pesoActual},"${a.peso_objetivo || 'N/A'}","${a.progreso || 'N/A'}","${a.gdp || 'N/A'}","${a.estado}","${primerPesaje}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Inventario_${new Date().toLocaleDateString('es-CO').replace(/\//g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Descargar PDF de tabla resumen
  const descargarPDFResumen = () => {
    const doc = new jsPDF();
    const hoy = new Date().toLocaleDateString('es-CO');

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('Reporte de Inventario Bovino', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Fecha: ${hoy} | Total de Animales: ${estadisticas.total}`, 14, 28);

    // Tabla de resumen
    const tableData = animalesConAnalisis.map(a => [
      a.chapeta,
      a.raza,
      a.pesoActual,
      a.peso_objetivo || 'N/A',
      a.progreso ? `${a.progreso}%` : 'N/A',
      a.gdp || 'N/A',
      a.estado
    ]);

    doc.autoTable({
      head: [['Chapeta', 'Raza', 'Peso Actual', 'Objetivo', 'Progreso', 'GDP', 'Estado']],
      body: tableData,
      startY: 35,
      margin: 14,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 18 },
        6: { cellWidth: 20 }
      }
    });

    doc.save(`Reporte_Resumen_${hoy.replace(/\//g, '-')}.pdf`);
  };

  if (cargando) return <div className="p-10 text-center uppercase font-black text-slate-400">Cargando datos...</div>;

  const lottes = [...new Set(animales.map(a => a.lote))];

  return (
    <div className="p-4 sm:p-8 bg-[#F8FAFC]">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Reportes de Inventario</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">Análisis y exportación de datos</p>
        </div>
        <button onClick={() => navigate('/app/inventario')} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
          <ArrowLeft size={16} /> Volver a Inventario
        </button>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase block mb-2">Total de Animales</span>
          <span className="text-4xl font-black text-slate-900">{estadisticas.total}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase block mb-2">Peso Promedio</span>
          <span className="text-4xl font-black text-blue-700">{estadisticas.pesoPromedio} kg</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase block mb-2">GDP Promedio</span>
          <span className={`text-4xl font-black ${estadisticas.gdpPromedio > 0.7 ? 'text-green-700' : estadisticas.gdpPromedio > 0.3 ? 'text-yellow-700' : 'text-red-700'}`}>
            {estadisticas.gdpPromedio} kg/día
          </span>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2"><Filter size={16} /> Filtros</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Filtrar por Lote</label>
            <select
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-slate-200"
              value={filtroLote}
              onChange={e => setFiltroLote(e.target.value)}
            >
              <option value="">Todos los lotes</option>
              {lottes.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Filtrar por Estado</label>
            <select
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-slate-200"
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="Sano">Sano</option>
              <option value="Tratamiento">Tratamiento</option>
            </select>
          </div>
        </div>
      </div>

      {/* BOTONES DE DESCARGA */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={descargarCSV}
          className="flex-1 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
        >
          <Download size={18} /> Descargar CSV (Excel)
        </button>
        <button
          onClick={descargarPDFResumen}
          className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
        >
          <Download size={18} /> Descargar PDF Resumen
        </button>
      </div>

      {/* TABLA DE DATOS */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/70 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-5">Chapeta</th>
                <th className="px-6 py-5">Raza</th>
                <th className="px-6 py-5 text-center">Peso Actual</th>
                <th className="px-6 py-5 text-center">Objetivo</th>
                <th className="px-6 py-5 text-center">Progreso</th>
                <th className="px-6 py-5 text-center">GDP</th>
                <th className="px-6 py-5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentAnimales.length > 0 ? (
                currentAnimales.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-black uppercase text-slate-900">{a.chapeta}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{a.raza}</td>
                    <td className="px-6 py-4 text-center font-black text-green-600">{a.pesoActual} kg</td>
                    <td className="px-6 py-4 text-center text-slate-500">{a.peso_objetivo ? `${a.peso_objetivo} kg` : 'N/A'}</td>
                    <td className="px-6 py-4 text-center">
                      {a.progreso ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(a.progreso, 100)}%` }} />
                          </div>
                          <span className="text-[9px] font-bold text-purple-600">{a.progreso}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-center font-bold text-xs ${
                      a.gdp === null ? 'text-slate-400' :
                      a.gdp > 0.7 ? 'text-green-600 bg-green-50/50' :
                      a.gdp > 0.3 ? 'text-yellow-600 bg-yellow-50/50' :
                      'text-red-600 bg-red-50/50'
                    }`}>
                      {a.gdp ? `${a.gdp} kg/día` : '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                        a.estado === 'Sano' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {a.estado}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm font-bold text-slate-400 italic">
                    No hay animales que coincidan con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <p className="text-xs font-medium text-slate-500">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, animalesConAnalisis.length)} de {animalesConAnalisis.length} animales
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
      </div>
    </div>
  );
};

export default ReportesInventario;
