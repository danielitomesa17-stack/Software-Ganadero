import React, { useMemo } from 'react';
import { 
  BarChart3, PieChart, TrendingDown, 
  AlertCircle, Activity, ChevronRight 
} from 'lucide-react';

const ReportesSistemas = () => {
  // Cargar datos
  const sanidad = useMemo(() => JSON.parse(localStorage.getItem('sanidad_danubio') || '[]'), []);
  const inventario = useMemo(() => JSON.parse(localStorage.getItem('inventario_ganado') || '[]'), []);

  // LÓGICA: Animales más tratados
  const topAnimales = useMemo(() => {
    const conteo = {};
    sanidad.forEach(reg => {
      conteo[reg.chapeta] = (conteo[reg.chapeta] || 0) + 1;
    });
    return Object.entries(conteo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Los 5 principales
  }, [sanidad]);

  // LÓGICA: Medicamentos más usados
  const topMedicamentos = useMemo(() => {
    const conteo = {};
    sanidad.forEach(reg => {
      conteo[reg.medicamento] = (conteo[reg.medicamento] || 0) + 1;
    });
    return Object.entries(conteo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [sanidad]);

  return (
    <div className="animate-in fade-in duration-1000 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Análisis Lago</h2>
          <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.3em] mt-2">Estadísticas de Gestión Real</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <Activity className="text-blue-500 animate-pulse" size={20} />
          <span className="text-[10px] font-black uppercase">Sistema Activo</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* TARJETA: TOP ANIMALES PROBLEMA */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
              <TrendingDown size={20} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Animales con más registros</h3>
          </div>
          
          <div className="space-y-4">
            {topAnimales.length > 0 ? topAnimales.map(([chapeta, total], index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-300">#0{index + 1}</span>
                  <span className="text-lg font-black text-slate-800 tracking-tighter uppercase">{chapeta}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-red-500">{total}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Tratamientos</span>
                </div>
              </div>
            )) : <p className="text-center text-slate-400 py-10 italic">No hay registros suficientes</p>}
          </div>
        </div>

        {/* TARJETA: USO DE MEDICAMENTOS */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-violet-50 text-violet-500 rounded-2xl">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Medicamentos más aplicados</h3>
          </div>

          <div className="space-y-4">
            {topMedicamentos.length > 0 ? topMedicamentos.map(([med, total], index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                  <span className="text-slate-700">{med}</span>
                  <span className="text-violet-600">{total} veces</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-violet-500 rounded-full" 
                    style={{ width: `${(total / sanidad.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )) : <p className="text-center text-slate-400 py-10 italic">Cargando datos farmacéuticos...</p>}
          </div>
        </div>

      </div>

      {/* RESUMEN RÁPIDO ABAJO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Censo Total', value: inventario.length, color: 'text-green-500' },
          { label: 'Dosis Aplicadas', value: sanidad.length, color: 'text-blue-500' },
          { label: 'Alertas Mes', value: sanidad.filter(r => r.proximaDosis).length, color: 'text-amber-500' },
          { label: 'Efectividad', value: '94%', color: 'text-slate-900' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
            <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportesSistemas;