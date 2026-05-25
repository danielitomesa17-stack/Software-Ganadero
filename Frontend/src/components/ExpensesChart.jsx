import React, { useMemo } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
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
 * Muestra un gráfico de barras y un gráfico de pastel con el total de gastos por categoría.
 * @param {Object[]} gastos - Array de objetos gasto (debe contener `categoria` y `monto`).
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

  // Paleta de colores alineada con el tema de la aplicación (Tailwind teal, amber, rose, violet, emerald)
  const themeColors = [
    '#0ea5e9', // teal-500
    '#f59e0b', // amber-500
    '#f43f5e', // rose-500
    '#8b5cf6', // violet-500
    '#10b981', // emerald-500
  ];
  const backgroundColors = categories.map((_, i) => themeColors[i % themeColors.length] + '66'); // 40% opacity
  const borderColors = categories.map((_, i) => themeColors[i % themeColors.length]);

  const barData = {
    labels: categories,
    datasets: [
      {
        label: 'Total gastado ($)',
        data: totals,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: categories,
    datasets: [
      {
        data: totals,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 12 } } },
      tooltip: { enabled: true },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2" style={{ minHeight: '400px' }}>
      <div className="bg-slate-900/60 backdrop-blur-lg rounded-2xl p-4 shadow-xl flex flex-col">
        <h3 className="text-sm font-medium text-gray-200 mb-2">Gastos por Categoría (Barras)</h3>
        <div className="flex-1">
          <Bar data={barData} options={options} />
        </div>
      </div>
      <div className="bg-slate-900/60 backdrop-blur-lg rounded-2xl p-4 shadow-xl flex flex-col">
        <h3 className="text-sm font-medium text-gray-200 mb-2">Gastos por Categoría (Pastel)</h3>
        <div className="flex-1">
          <Pie data={pieData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default ExpensesChart;
