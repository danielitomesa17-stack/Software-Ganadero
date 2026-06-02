import React, { useMemo, useState } from 'react';
import { TrendingUp, Edit3, Trash2, X, Check } from 'lucide-react';
import { authenticatedFetch } from '../services/api';
import { parseDateString, formatToYYYYMMDD, formatToDDMMYYYY } from '../utils/dateUtils';

const AnimalAnalytics = ({ animal, onUpdate }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({ fecha: '', peso: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!animal || !animal.historial || animal.historial.length === 0) {
    return (
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center text-[10px] font-bold text-slate-400 italic">
        Sin historial de pesajes disponible
      </div>
    );
  }

  // Calcular métricas
  const metrics = useMemo(() => {
    const sorted = [...animal.historial].sort((a, b) => {
      return parseDateString(a.fecha) - parseDateString(b.fecha);
    });

    const primero = sorted[0];
    const ultimo = sorted[sorted.length - 1];

    const fecha1 = parseDateString(primero.fecha);
    const fecha2 = parseDateString(ultimo.fecha);
    const dias = Math.floor((fecha2 - fecha1) / (1000 * 60 * 60 * 24));
    const gananciaTotal = ultimo.peso - primero.peso;
    const gdp = dias > 0 ? (gananciaTotal / dias).toFixed(2) : null;

    return {
      sorted,
      dias,
      gananciaTotal,
      gdp,
      primerPeso: primero.peso,
      ultimoPeso: ultimo.peso,
    };
  }, [animal.historial]);

  // Determinar color del GDP
  const getGDPColor = (gdp) => {
    if (gdp === null) return 'bg-slate-50 text-slate-500';
    if (gdp > 0.7) return 'bg-green-50 text-green-700 border border-green-200';
    if (gdp > 0.3) return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    return 'bg-red-50 text-red-700 border border-red-200';
  };

  // Progreso hacia objetivo
  const progresoPorcentaje = animal.pesoObjetivo
    ? ((animal.pesoActual / animal.pesoObjetivo) * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-4">
      {/* Resumen de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[9px] font-bold uppercase">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <span className="block text-blue-400 mb-0.5">Días Engorde</span>
          <span className="text-lg font-black text-blue-700">{metrics.dias}</span>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
          <span className="block text-green-400 mb-0.5">Ganancia Total</span>
          <span className="text-lg font-black text-green-700">{metrics.gananciaTotal.toFixed(1)} kg</span>
        </div>
        <div className={`p-3 rounded-lg ${getGDPColor(metrics.gdp)}`}>
          <span className="block mb-0.5 text-[8px]">GDP</span>
          <span className="text-lg font-black">{metrics.gdp || 'N/A'} kg/día</span>
        </div>
        {progresoPorcentaje && (
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <span className="block text-purple-400 mb-0.5">Progreso</span>
            <span className="text-lg font-black text-purple-700">{progresoPorcentaje}%</span>
          </div>
        )}
      </div>

      {/* Barra de progreso hacia objetivo */}
      {animal.pesoObjetivo && (
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase">Progreso hacia Objetivo</span>
            <span className="text-xs font-black text-purple-600">{animal.pesoActual}/{animal.pesoObjetivo} kg</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(progresoPorcentaje, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Tabla de Historial Detallado */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-[9px] font-bold uppercase text-slate-700">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="border-b border-slate-100">
                <th className="px-3 py-2 text-left text-slate-400">Fecha</th>
                <th className="px-3 py-2 text-right text-slate-400">Peso</th>
                <th className="px-3 py-2 text-right text-slate-400">Cambio</th>
                <th className="px-3 py-2 text-right text-slate-400">Días</th>
                <th className="px-3 py-2 text-right text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.sorted.map((registro, idx) => {
                const cambio = idx > 0 ? registro.peso - metrics.sorted[idx - 1].peso : null;
                const d1 = parseDateString(metrics.sorted[0].fecha);
                const d2 = parseDateString(registro.fecha);
                const diasDesdeInicio = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
                
                const isEditing = editingIndex === idx;

                const handleEditClick = () => {
                  setEditingIndex(idx);
                  // convertir a YYYY-MM-DD para el input type date
                  setEditForm({ fecha: formatToYYYYMMDD(registro.fecha), peso: registro.peso });
                };

                const handleCancelEdit = () => {
                  setEditingIndex(null);
                  setEditForm({ fecha: '', peso: '' });
                };

                const handleSaveEdit = async () => {
                  if (!editForm.fecha || !editForm.peso) return;
                  try {
                    setIsSubmitting(true);
                    const nuevaFecha = formatToDDMMYYYY(editForm.fecha);
                    
                    const res = await authenticatedFetch(`/animales/${animal.id}/pesaje`, {
                      method: 'PUT',
                      body: JSON.stringify({
                        fechaOriginal: registro.fecha,
                        nuevaFecha: nuevaFecha,
                        nuevoPeso: Number(editForm.peso)
                      })
                    });

                    if (res.ok) {
                      setEditingIndex(null);
                      if (onUpdate) onUpdate();
                    } else {
                      const error = await res.json();
                      alert("Error al actualizar: " + (error.error || "Error desconocido"));
                    }
                  } catch (err) {
                    alert("Error: " + err.message);
                  } finally {
                    setIsSubmitting(false);
                  }
                };

                const handleDeleteClick = async () => {
                  if (!window.confirm(`¿Seguro que deseas eliminar el pesaje del ${registro.fecha}?`)) return;
                  try {
                    setIsSubmitting(true);
                    const res = await authenticatedFetch(`/animales/${animal.id}/pesaje?fecha=${encodeURIComponent(registro.fecha)}`, {
                      method: 'DELETE'
                    });
                    if (res.ok) {
                      if (onUpdate) onUpdate();
                    } else {
                      const error = await res.json();
                      alert("Error al eliminar: " + (error.error || "Error desconocido"));
                    }
                  } catch (err) {
                    alert("Error: " + err.message);
                  } finally {
                    setIsSubmitting(false);
                  }
                };

                if (isEditing) {
                  return (
                    <tr key={idx} className="bg-blue-50/30 transition-colors">
                      <td className="px-3 py-2">
                        <input type="date" value={editForm.fecha} onChange={e => setEditForm({...editForm, fecha: e.target.value})} className="w-full p-1 text-[10px] rounded border border-slate-200 outline-none" />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input type="number" step="0.1" value={editForm.peso} onChange={e => setEditForm({...editForm, peso: e.target.value})} className="w-16 p-1 text-[10px] text-right rounded border border-slate-200 outline-none" />
                      </td>
                      <td className="px-3 py-2 text-right text-slate-400">—</td>
                      <td className="px-3 py-2 text-right text-slate-400">—</td>
                      <td className="px-3 py-2 text-right space-x-1 whitespace-nowrap">
                        <button onClick={handleSaveEdit} disabled={isSubmitting} className="p-1 text-green-600 hover:bg-green-100 rounded disabled:opacity-50"><Check size={14}/></button>
                        <button onClick={handleCancelEdit} disabled={isSubmitting} className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"><X size={14}/></button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 text-slate-900 font-black">{registro.fecha}</td>
                    <td className="px-3 py-2 text-right font-black text-slate-900">{registro.peso} kg</td>
                    <td className={`px-3 py-2 text-right font-black ${
                      cambio === null ? 'text-slate-400' :
                      cambio > 0 ? 'text-green-600' :
                      cambio < 0 ? 'text-red-600' : 'text-slate-400'
                    }`}>
                      {cambio === null ? '—' : (cambio > 0 ? '+' : '') + cambio.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-500">{diasDesdeInicio}</td>
                    <td className="px-3 py-2 text-right space-x-1 whitespace-nowrap">
                      <button onClick={handleEditClick} disabled={isSubmitting} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all disabled:opacity-50"><Edit3 size={14}/></button>
                      <button onClick={handleDeleteClick} disabled={isSubmitting} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all disabled:opacity-50"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnimalAnalytics;
