import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { parseDateString } from '../utils/dateUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const GraficoGananciaAnimal = ({ historial, pesoObjetivo, chapeta }) => {
  if (!historial || historial.length === 0) {
    return (
      <div className="w-full h-64 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold italic">
        No hay datos de peso para mostrar gráfica
      </div>
    );
  }

  // Ordenar historial cronológicamente
  const sorted = [...historial].sort((a, b) => {
    return parseDateString(a.fecha) - parseDateString(b.fecha);
  });

  // Preparar datos para la gráfica
  const labels = sorted.map(r => r.fecha);
  const pesos = sorted.map(r => r.peso);
  const primerPeso = pesos[0];
  const ultimoPeso = pesos[pesos.length - 1];

  // Datos de la gráfica
  const datasets = [
    {
      label: 'Evolución de Peso',
      data: pesos,
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14, 165, 233, 0.1)',
      borderWidth: 3,
      pointRadius: 5,
      pointBackgroundColor: pesos.map((p, i) =>
        i === 0 ? '#3b82f6' : (i === pesos.length - 1 ? '#10b981' : '#0ea5e9')
      ),
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      fill: true,
      tension: 0.4,
      pointHoverRadius: 7,
    }
  ];

  // Agregar línea de objetivo si existe
  if (pesoObjetivo) {
    datasets.push({
      label: 'Objetivo',
      data: Array(pesos.length).fill(pesoObjetivo),
      borderColor: '#a78bfa',
      borderWidth: 2,
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false,
      tension: 0,
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12, weight: 'bold' },
          usePointStyle: true,
          padding: 15,
          color: '#475569',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        borderColor: '#0ea5e9',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.y + ' kg';
          },
          afterLabel: function(context) {
            if (context.datasetIndex === 0 && context.dataIndex > 0) {
              const cambio = (pesos[context.dataIndex] - pesos[context.dataIndex - 1]).toFixed(1);
              return 'Cambio: ' + (cambio > 0 ? '+' : '') + cambio + ' kg';
            }
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#94a3b8' },
      },
      y: {
        beginAtZero: false,
        grid: { color: '#f1f5f9', drawBorder: false },
        ticks: {
          font: { size: 11 },
          color: '#94a3b8',
          callback: function(value) { return value + ' kg'; }
        },
      },
    },
  };

  return (
    <div className="w-full">
      <div className="h-64 bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
        <Line data={{ labels, datasets }} options={options} />
      </div>

      {/* Métricas debajo de la gráfica */}
      <div className="grid grid-cols-3 gap-2 mt-3 text-center text-[9px] font-bold uppercase">
        <div className="bg-blue-50 px-3 py-2 rounded-lg">
          <span className="block text-blue-400">Inicial</span>
          <span className="text-blue-700 text-sm">{primerPeso} kg</span>
        </div>
        <div className="bg-green-50 px-3 py-2 rounded-lg">
          <span className="block text-green-400">Actual</span>
          <span className="text-green-700 text-sm">{ultimoPeso} kg</span>
        </div>
        <div className={`px-3 py-2 rounded-lg ${(ultimoPeso - primerPeso) > 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <span className={`block ${(ultimoPeso - primerPeso) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>Ganancia</span>
          <span className={`text-sm font-black ${(ultimoPeso - primerPeso) > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {(ultimoPeso - primerPeso) > 0 ? '+' : ''}{(ultimoPeso - primerPeso).toFixed(1)} kg
          </span>
        </div>
      </div>
    </div>
  );
};

export default GraficoGananciaAnimal;
