import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

/**
 * ExpensesChart
 * Muestra un gráfico de barras y un gráfico de dona con el total de gastos por categoría.
 */
const ExpensesChart = ({ gastos }) => {
  // Agrupar gastos por categoría
  const dataByCategory = useMemo(() => {
    const map = {};
    gastos.forEach(g => {
      const cat = g.categoria || 'SIN CATEGORÍA';
      const monto = parseFloat(g.monto) || 0;
      map[cat] = (map[cat] || 0) + monto;
    });
    return map;
  }, [gastos]);

  const categories = Object.keys(dataByCategory);
  const totals = Object.values(dataByCategory);

  // Paleta de colores moderna y vibrante
  const themeColors = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
  ];
  
  const backgroundColors = categories.map((_, i) => themeColors[i % themeColors.length] + 'E6'); // 90% opacity
  const hoverBackgroundColors = categories.map((_, i) => themeColors[i % themeColors.length]);

  const barData = {
    labels: categories,
    datasets: [
      {
        label: 'Total gastado ($)',
        data: totals,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: hoverBackgroundColors,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const doughnutData = {
    labels: categories,
    datasets: [
      {
        data: totals,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: hoverBackgroundColors,
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const commonOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: 'Inter', size: 12, weight: '600' },
          color: '#64748b' // slate-500
        }
      },
      tooltip: {
        backgroundColor: '#0f172a', // slate-900
        titleFont: { family: 'Inter', size: 13 },
        bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null && context.parsed.y !== undefined) {
              label += '$ ' + context.parsed.y.toLocaleString('es-CO');
            } else if (context.parsed !== null) {
              label += '$ ' + context.parsed.toLocaleString('es-CO');
            }
            return label;
          }
        }
      },
    },
  };

  const barOptions = {
    ...commonOptions,
    scales: {
      y: { 
        beginAtZero: true, 
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }, 
        grid: { color: '#f1f5f9', drawBorder: false }, // slate-100
        border: { display: false }
      },
      x: { 
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11, weight: '600' } }, 
        grid: { display: false },
        border: { display: false }
      },
    },
  };

  const doughnutOptions = {
    ...commonOptions,
    cutout: '70%',
  };

  return (
    <div className="grid gap-8 md:grid-cols-2" style={{ minHeight: '350px' }}>
      <div className="flex flex-col relative">
        <h3 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest text-center">Distribución por Categoría</h3>
        <div className="flex-1 relative">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
      <div className="flex flex-col relative">
        <h3 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest text-center">Proporción de Egresos</h3>
        <div className="flex-1 relative flex justify-center">
          <div className="w-full max-w-[280px]">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesChart;
