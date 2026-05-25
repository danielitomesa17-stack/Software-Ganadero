import React from 'react';
// Importamos algunos iconos rápidos de Lucide (o puedes usar emojis si prefieres)
import { Users, Thermometer, Droplets, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
        {trend > 0 ? `+${trend}%` : `${trend}%`}
      </span>
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        <span className="text-xs text-gray-400">{subtitle}</span>
      </div>
    </div>
    <div className="mt-4 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color.split(' ')[0]}`} style={{ width: '70%' }}></div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Resumen del Hato</h1>
        <p className="text-gray-500">Estado general de la finca al día de hoy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Animales" 
          value="124" 
          icon={Users} 
          color="bg-green-500" 
          trend={12}
          subtitle="Cabezas"
        />
        <StatCard 
          title="Producción Leche" 
          value="850" 
          icon={Droplets} 
          color="bg-blue-500" 
          trend={5}
          subtitle="Litros/día"
        />
        <StatCard 
          title="Peso Promedio" 
          value="420" 
          icon={TrendingUp} 
          color="bg-orange-500" 
          trend={2}
          subtitle="Kg/novillo"
        />
        <StatCard 
          title="Estado Salud" 
          value="98" 
          icon={Thermometer} 
          color="bg-red-500" 
          trend={0}
          subtitle="% Óptimo"
        />
      </div>

      {/* Espacio para un gráfico futuro */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-64 flex items-center justify-center text-gray-400 border-dashed border-2">
        Aquí irá el gráfico de producción mensual
      </div>
    </div>
  );
};

export default Dashboard;