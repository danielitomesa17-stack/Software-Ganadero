import React, { useState, useMemo, useEffect } from 'react';
import { 
  Scale, TrendingUp, AlertCircle, Search, 
  DollarSign, ArrowUpRight, BarChart3, Target, RefreshCw,
  Layers, History, Calendar, LineChart as ChartIcon,
  Milk, Droplets, Zap, Trash2, Edit3, X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PESO_OBJETIVO = 450; 
const PRECIO_KILO_ESTIMADO = 8500;
const API_BASE = 'http://localhost:3000/api';

const ProduccionSistemas = () => {
  const [animales, setAnimales] = useState([]);
  const [registrosHistorial, setRegistrosHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modo, setModo] = useState('peso'); 
  const [editandoId, setEditandoId] = useState(null);

  const [registro, setRegistro] = useState({ 
    animalId: '', 
    valorActual: '', 
    fecha: new Date().toISOString().split('T')[0] 
  });
  const [busqueda, setBusqueda] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // --- CARGA DE DATOS ---
  const cargarDatos = async () => {
    try {
      const resAn = await fetch(`${API_BASE}/animales`);
      const dataAn = await resAn.json();
      setAnimales(Array.isArray(dataAn) ? dataAn : []);

      const resProd = await fetch(`${API_BASE}/produccion`);
      const dataProd = await resProd.json();
      setRegistrosHistorial(Array.isArray(dataProd) ? dataProd : []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- LÓGICA DE SELECCIÓN (CON VALIDACIÓN) ---
  const infoAnimalActual = useMemo(() => {
    if (!registro.animalId) return null;
    return animales.find(a => a.id.toString() === registro.animalId.toString());
  }, [registro.animalId, animales]);

  const animalesSugeridos = useMemo(() => {
    if (busqueda.length < 1) return [];
    return animales.filter(a => 
      (a.caravana_id || "").toLowerCase().includes(busqueda.toLowerCase())
    ).slice(0, 5);
  }, [busqueda, animales]);

  // --- MANEJO DE FORMULARIO ---
  const handleGuardarRegistro = async (e) => {
    e.preventDefault();
    
    // Evita el crash si infoAnimalActual no existe aún
    if (!infoAnimalActual) {
      alert("Por favor, selecciona un animal de la lista de sugerencias.");
      return;
    }

    const payload = {
      id: editandoId,
      animal_id: registro.animalId,
      chapeta: infoAnimalActual.caravana_id,
      valor: Number(registro.valorActual),
      fecha: registro.fecha,
      tipo: modo
    };

    try {
      const response = await fetch(`${API_BASE}/produccion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setEditandoId(null);
        setRegistro({ animalId: '', valorActual: '', fecha: new Date().toISOString().split('T')[0] });
        setBusqueda("");
        cargarDatos();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarRegistro = async (id) => {
    if (!window.confirm("¿Eliminar registro?")) return;
    try {
      await fetch(`${API_BASE}/produccion/${id}`, { method: 'DELETE' });
      cargarDatos();
    } catch (error) {
      console.error(error);
    }
  };

  const prepararEdicion = (item) => {
    setEditandoId(item.id);
    setModo(item.tipo);
    setBusqueda(item.chapeta);
    setRegistro({
      animalId: item.animal_id,
      valorActual: item.valor,
      fecha: item.fecha.split('T')[0]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- CÁLCULOS DE RENDIMIENTO ---
  const analisisRendimiento = useMemo(() => {
    if (!registro.animalId) return null;
    const historialAnimal = registrosHistorial
      .filter(p => p.animal_id === registro.animalId && p.tipo === 'peso')
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (historialAnimal.length < 2) return null;

    const actual = historialAnimal[0];
    const anterior = historialAnimal[1];
    const dias = Math.max(1, (new Date(actual.fecha) - new Date(anterior.fecha)) / (1000 * 60 * 60 * 24));
    const gpd = Number(((actual.valor - anterior.valor) / dias).toFixed(2));

    return { 
      gpd, 
      colorClase: gpd >= 0.7 ? "text-green-400" : (gpd >= 0.4 ? "text-yellow-500" : "text-red-500")
    };
  }, [registro.animalId, registrosHistorial]);

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
         <RefreshCw size={40} className="text-blue-500 animate-spin mb-4" />
         <p className="font-black text-slate-400 uppercase text-xs tracking-widest">Sincronizando Producción...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 font-sans p-4">
      {/* HEADER - DISEÑO ORIGINAL */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Producción</h1>
          <div className="flex items-center gap-2 mt-3">
             <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Estado: Online</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Carga Completa</p>
              <p className="text-2xl font-black text-slate-900">{animales.length} Animales</p>
            </div>
            <button onClick={cargarDatos} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all">
              <RefreshCw size={20} />
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA IZQUIERDA: FORMULARIO ORIGINAL */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`bg-white rounded-[2.5rem] shadow-xl border-4 p-8 relative transition-all ${editandoId ? 'border-blue-500' : 'border-white'}`}>
             <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
                <button type="button" onClick={() => setModo('peso')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${modo === 'peso' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>
                  Peso
                </button>
                <button type="button" onClick={() => setModo('leche')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${modo === 'leche' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
                  Leche
                </button>
             </div>

             <form onSubmit={handleGuardarRegistro} className="space-y-6">
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Buscar Chapeta</label>
                  <input 
                    type="text" 
                    placeholder="Escriba número..." 
                    className="w-full mt-2 p-5 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-blue-500/20 transition-all uppercase" 
                    value={busqueda} 
                    onChange={(e) => { setBusqueda(e.target.value); setMostrarSugerencias(true); }} 
                  />
                  {mostrarSugerencias && animalesSugeridos.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
                      {animalesSugeridos.map(a => (
                        <div key={a.id} onClick={() => { setRegistro({...registro, animalId: a.id}); setBusqueda(a.caravana_id); setMostrarSugerencias(false); }} className="p-5 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-slate-50">
                          <span className="font-black text-slate-800">{a.caravana_id}</span>
                          <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded">{a.peso_actual} Kg</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Registro</label>
                   <input type="date" className="w-full mt-2 p-4 bg-slate-50 rounded-2xl font-bold border-none" value={registro.fecha} onChange={(e) => setRegistro({...registro, fecha: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{modo === 'peso' ? 'Peso (KG)' : 'Leche (LTS)'}</label>
                  <input type="number" step="0.1" className="w-full mt-2 p-6 bg-slate-50 rounded-3xl font-black text-4xl outline-none" value={registro.valorActual} onChange={(e)=>setRegistro({...registro, valorActual: e.target.value})} placeholder="0.0" />
                </div>

                <button type="submit" className={`w-full py-6 text-white font-black rounded-3xl uppercase text-xs tracking-widest shadow-lg transition-transform active:scale-95 ${modo === 'peso' ? 'bg-slate-900' : 'bg-blue-600'}`}>
                  {editandoId ? 'Actualizar Registro' : 'Guardar Datos'}
                </button>
             </form>
          </div>

          {analisisRendimiento && modo === 'peso' && (
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
               <p className="text-[10px] font-black text-blue-400 uppercase mb-2 tracking-widest">Ganancia Diaria (GPD)</p>
               <h4 className={`text-5xl font-black ${analisisRendimiento.colorClase}`}>{analisisRendimiento.gpd} <span className="text-sm opacity-50 uppercase">kg/día</span></h4>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: TABLA ORIGINAL */}
        <div className="lg:col-span-8">
           <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                 <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Registros en Sistema</h3>
                 <History size={16} className="text-slate-400" />
              </div>
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="px-8 py-5">Fecha</th>
                      <th className="px-8 py-5">Animal</th>
                      <th className="px-8 py-5">Resultado</th>
                      <th className="px-8 py-5 text-center">Gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {registrosHistorial.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(p.fecha).toLocaleDateString()}</td>
                        <td className="px-8 py-5 font-black text-slate-800 uppercase tracking-tight">{p.chapeta}</td>
                        <td className={`px-8 py-5 font-black ${p.tipo === 'peso' ? 'text-slate-900' : 'text-blue-600'}`}>
                          {p.valor} <span className="text-[10px] opacity-40">{p.tipo === 'peso' ? 'KG' : 'LTS'}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => prepararEdicion(p)} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Edit3 size={14} /></button>
                            <button onClick={() => eliminarRegistro(p.id)} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                          </div>
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

export default ProduccionSistemas;