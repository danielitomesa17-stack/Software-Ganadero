import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Trash2, Edit3, Eye, LayoutGrid, List, X, History 
} from 'lucide-react';

const InventarioLista = () => {
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [viewingAnimal, setViewingAnimal] = useState(null);
  const [vistaTabular, setVistaTabular] = useState(true);

  const estadoInicial = {
    chapeta: '', 
    raza: 'Brahman', 
    peso: '', 
    potrero: 'Levante', 
    sexo: 'Hembra', 
    estado: 'Sano'
  };

  const [formData, setFormData] = useState(estadoInicial);

  // 1. OBTENER ANIMALES (Ajustado para SaaS con Token)
  const cargarAnimales = useCallback(async () => {
    try {
      const token = localStorage.getItem('token'); // 🔒 Recuperamos el token seguro
      
      // Llamado limpio a tu API (Render o Local, usa la ruta relativa o variable de entorno)
      const res = await fetch('http://localhost:3000/api/animales', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` // 👈 Pasaporte obligatorio
        }
      });
      
      if (!res.ok) throw new Error("Error servidor");
      const datos = await res.json();
      
      const datosAdaptados = datos.map(a => ({
        id: a.id,
        chapeta: a.caravana_id || a.chapeta, 
        raza: a.raza || 'Brahman',
        pesoInicial: a.peso_inicial,
        pesoActual: a.peso_actual || a.peso_inicial,
        potrero: a.lote, 
        sexo: a.sexo,
        estado: a.estado,
        historial: typeof a.historial === 'string' ? JSON.parse(a.historial) : (a.historial || [])
      }));
      setAnimales(datosAdaptados);
    } catch (error) {
      console.error("Error al cargar el inventario SaaS:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarAnimales();
  }, [cargarAnimales]);

  // 2. REGISTRAR ANIMAL (El backend inyecta la Hacienda automáticamente)
  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!formData.chapeta) return alert("Chapeta obligatoria");

    const nuevoAnimal = {
      caravana_id: formData.chapeta.toUpperCase(),
      peso_inicial: Number(formData.peso),
      lote: formData.potrero,
      raza: formData.raza,
      sexo: formData.sexo,
      estado: formData.estado
      // 🔒 Ya no enviamos hacienda_id en el body, el backend lo sabe por tu Token
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/animales', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 👈 Token de autenticación
        },
        body: JSON.stringify(nuevoAnimal)
      });
      if (res.ok) {
        await cargarAnimales();
        setIsModalOpen(false);
        setFormData(estadoInicial);
      }
    } catch {
      alert("Error de conexión");
    }
  };

  // 3. ACTUALIZAR ANIMAL / PESAJE
  const handleActualizar = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/animales/${editingAnimal.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 👈 Token de autenticación
        },
        body: JSON.stringify({
          peso_actual: Number(editingAnimal.pesoActual),
          estado: editingAnimal.estado,
          lote: editingAnimal.potrero
        })
      });
      if (res.ok) {
        await cargarAnimales();
        setEditingAnimal(null);
      }
    } catch {
      alert("Error al actualizar");
    }
  };

  // 4. ELIMINAR ANIMAL
  const eliminarAnimal = async (id) => {
    if (!window.confirm("¿Eliminar registro?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/animales/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` // 👈 Token de autenticación
        }
      });
      if (res.ok) await cargarAnimales();
    } catch {
      alert("Error al eliminar");
    }
  };

  const filtrados = useMemo(() => {
    return animales.filter(a => 
      a.chapeta.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.raza.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [animales, busqueda]);

  if (cargando) return (
    <div className="flex items-center justify-center min-h-[60vh] bg-slate-100 font-black uppercase text-slate-400 animate-pulse">
      Sincronizando con la Base de Datos...
    </div>
  );

  return (
    <div className="p-4 lg:p-10 bg-[#F1F5F9] min-h-screen font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Hacienda Digital</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest italic">Gestión de Ganado Bovino</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => setVistaTabular(!vistaTabular)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all">
            {vistaTabular ? <LayoutGrid size={20}/> : <List size={20}/>}
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase hover:bg-green-600 transition-all shadow-lg shadow-slate-900/20">
            <Plus size={18} className="inline mr-2"/> Registrar Animal
          </button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="relative mb-10">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" placeholder="Buscar por chapeta o raza..." 
          className="w-full pl-16 pr-8 py-6 bg-white rounded-[2rem] outline-none font-bold text-sm shadow-sm border border-transparent focus:border-slate-900/10 transition-all"
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* VISTA DE TABLA */}
      {vistaTabular ? (
        <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-6">Identificación</th>
                <th className="px-6 py-6 text-center">P. Inicial</th>
                <th className="px-6 py-6 text-center">P. Actual</th>
                <th className="px-6 py-6 text-center">Ganancia</th>
                <th className="px-8 py-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtrados.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-black uppercase">
                    <div className="text-slate-900">{a.chapeta}</div>
                    <div className="text-[10px] text-slate-400">{a.raza}</div>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-slate-400 text-xs">{a.pesoInicial} KG</td>
                  <td className="px-6 py-5 text-center font-black text-slate-900 text-xs">
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100">{a.pesoActual} KG</span>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-green-600 text-[10px]">
                    +{(a.pesoActual - a.pesoInicial).toFixed(1)} KG
                  </td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <button onClick={() => setViewingAnimal(a)} className="p-2 text-slate-300 hover:text-blue-500 transition-colors"><Eye size={18}/></button>
                    <button onClick={() => setEditingAnimal(a)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><Edit3 size={18}/></button>
                    <button onClick={() => eliminarAnimal(a.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtrados.map(a => {
            const ganancia = (a.pesoActual - a.pesoInicial).toFixed(1);
            return (
              <div key={a.id} className="group bg-white rounded-[3rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden">
                <div className="p-8 pb-4">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-slate-900/20">
                        {a.chapeta.substring(0, 2)}
                      </div>
                      <div>
                        <span className="block text-[10px] font-black text-blue-600 uppercase tracking-widest">{a.raza}</span>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{a.chapeta}</h3>
                      </div>
                    </div>
                    <button onClick={() => setViewingAnimal(a)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                      <Eye size={20}/>
                    </button>
                  </div>
                  <div className="flex gap-2 mb-6 text-[9px] font-black uppercase">
                    <span className={`px-3 py-1 rounded-full ${a.estado === 'Sano' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{a.estado}</span>
                    <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full">Lote: {a.potrero}</span>
                  </div>
                </div>
                <div className="px-8 py-6 bg-slate-50/50 flex justify-between items-center border-y border-slate-50">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase mb-1">Peso Actual</span>
                    <span className="text-3xl font-black text-slate-900">{a.pesoActual}<span className="text-sm ml-1 text-slate-400">KG</span></span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] font-black text-slate-400 uppercase mb-1">Evolución</span>
                    <span className="text-sm font-black text-green-600 flex items-center justify-end">▲ {ganancia} KG</span>
                  </div>
                </div>
                <div className="p-6 px-8 flex justify-between items-center bg-white">
                   <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${a.sexo === 'Hembra' ? 'bg-pink-50 text-pink-500' : 'bg-blue-50 text-blue-500'}`}>{a.sexo}</div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingAnimal(a)} className="p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"><Edit3 size={18}/></button>
                    <button onClick={() => eliminarAnimal(a.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL REGISTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl">
            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Entrada Animal</h2>
            <form onSubmit={handleGuardar} className="space-y-4">
              <input required placeholder="Número de Chapeta" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-slate-900 transition-all uppercase" value={formData.chapeta} onChange={e => setFormData({...formData, chapeta: e.target.value})} />
              <input required placeholder="Raza" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-slate-900 transition-all" value={formData.raza} onChange={e => setFormData({...formData, raza: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Peso Inicial" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-slate-900 transition-all" value={formData.peso} onChange={e => setFormData({...formData, peso: e.target.value})} />
                <select className="p-5 bg-slate-50 rounded-2xl font-bold text-xs uppercase cursor-pointer" value={formData.sexo} onChange={e => setFormData({...formData, sexo: e.target.value})}>
                  <option value="Hembra">Hembra</option>
                  <option value="Macho">Macho</option>
                </select>
              </div>
              <input placeholder="Lote de Destino" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-slate-900 transition-all" value={formData.potrero} onChange={e => setFormData({...formData, potrero: e.target.value})} />
              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest mt-4 hover:bg-green-600">Guardar</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase mt-2">Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR (PESAJE) */}
      {editingAnimal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl">
            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter text-green-600">Actualizar Pesaje</h2>
            <form onSubmit={handleActualizar} className="space-y-4">
              <input className="w-full p-5 bg-slate-100 rounded-2xl font-bold text-slate-500 cursor-not-allowed" value={editingAnimal.chapeta} disabled />
              <input type="number" step="0.1" autoFocus className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-green-500 text-2xl" value={editingAnimal.pesoActual} onChange={e => setEditingAnimal({...editingAnimal, pesoActual: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select className="p-5 bg-slate-50 rounded-2xl font-bold text-xs uppercase" value={editingAnimal.estado} onChange={e => setEditingAnimal({...editingAnimal, estado: e.target.value})}>
                  <option value="Sano">Sano</option>
                  <option value="Tratamiento">Tratamiento</option>
                </select>
                <input className="p-5 bg-slate-50 rounded-2xl font-bold outline-none text-xs" value={editingAnimal.potrero} onChange={e => setEditingAnimal({...editingAnimal, potrero: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-5 bg-green-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest mt-4">Actualizar</button>
              <button type="button" onClick={() => setEditingAnimal(null)} className="w-full text-slate-400 font-bold text-[10px] uppercase mt-2">Cerrar</button>
            </form>
          </div>
        </div>
      )}

      {/* FICHA TÉCNICA */}
      {viewingAnimal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setViewingAnimal(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"><X size={24}/></button>
            <div className="mb-8">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Hacienda Danubio</span>
              <h2 className="text-4xl font-black text-slate-900 uppercase mt-2">{viewingAnimal.chapeta}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 p-5 rounded-[1.5rem]"><span className="block text-[9px] font-black text-slate-400 uppercase mb-1">Raza</span><span className="text-sm font-bold">{viewingAnimal.raza}</span></div>
              <div className="bg-slate-50 p-5 rounded-[1.5rem]"><span className="block text-[9px] font-black text-slate-400 uppercase mb-1">Potrero</span><span className="text-sm font-bold">{viewingAnimal.potrero}</span></div>
              <div className="bg-blue-50 p-5 rounded-[1.5rem]"><span className="block text-[9px] font-black text-blue-400 uppercase mb-1">P. Entrada</span><span className="text-lg font-black text-blue-700">{viewingAnimal.pesoInicial} KG</span></div>
              <div className="bg-green-50 p-5 rounded-[1.5rem]"><span className="block text-[9px] font-black text-green-400 uppercase mb-1">P. Actual</span><span className="text-lg font-black text-green-700">{viewingAnimal.pesoActual} KG</span></div>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-8">
              <h3 className="text-xs font-black uppercase text-slate-400 mb-6 flex items-center gap-2"><History size={14} /> Trazabilidad</h3>
              <div className="space-y-3">
                {viewingAnimal.historial?.length > 0 ? viewingAnimal.historial.slice().reverse().map((reg, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div><p className="text-[9px] font-black text-slate-400 uppercase">Fecha</p><p className="text-sm font-bold">{reg.fecha}</p></div>
                    <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase">Peso</p><p className="text-lg font-black">{reg.peso} KG</p></div>
                  </div>
                )) : <p className="text-center py-10 text-[10px] font-bold text-slate-400 italic">Sin registros</p>}
              </div>
            </div>
            <button onClick={() => setViewingAnimal(null)} className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioLista;