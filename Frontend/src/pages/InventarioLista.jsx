import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Trash2, Edit3, Eye, LayoutGrid, List, X, History 
} from 'lucide-react';
import { authenticatedFetch } from '../services/api';

const InventarioLista = () => {
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [viewingAnimal, setViewingAnimal] = useState(null);
  const [vistaTabular, setVistaTabular] = useState(true);
  const [fotoEdit, setFotoEdit] = useState(null);
  const [fotoPrevie, setFotoPreview] = useState(null);

  const estadoInicial = {
    chapeta: '',
    raza: 'Brahman',
    peso: '',
    potrero: 'Levante',
    sexo: 'Hembra',
    estado: 'Sano',
    foto: null
  };

  // Función para comprimir imagen
  const comprimirImagen = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // Función para abrir modal de edición con datos completos del servidor
  const abrirEditarAnimal = async (animal) => {
    try {
      const res = await authenticatedFetch(`/animales/${animal.id}`);
      if (res.ok) {
        const animalActualizado = await res.json();
        setEditingAnimal({
          id: animalActualizado.id,
          chapeta: animalActualizado.caravana_id || 'SIN CAP',
          raza: animalActualizado.raza,
          pesoInicial: Number(animalActualizado.peso_inicial),
          pesoActual: Number(animalActualizado.peso_actual),
          potrero: animalActualizado.lote,
          sexo: animalActualizado.sexo,
          estado: animalActualizado.estado,
          foto: animalActualizado.foto || null,
          historial: typeof animalActualizado.historial === 'string'
            ? JSON.parse(animalActualizado.historial)
            : (animalActualizado.historial || [])
        });
      }
    } catch (err) {
      console.error("Error al cargar animal:", err);
      setEditingAnimal(animal);
    }
  };

  // 1. OBTENER ANIMALES (SaaS - Lee la hacienda directo del Token JWT)
  const cargarAnimales = useCallback(async () => {
    try {
      setCargando(true);
      const res = await authenticatedFetch('/animales');
      
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const datos = await res.json();
      
      // Mapeo seguro adaptado al esquema real de tu Base de Datos en Aiven
      setAnimales(datos.map(a => ({
        id: a.id,
        chapeta: a.caravana_id || 'SIN CAP',
        raza: a.raza || 'Brahman',
        pesoInicial: Number(a.peso_inicial) || 0,
        pesoActual: Number(a.peso_actual) || Number(a.peso_inicial) || 0,
        potrero: a.lote || 'General',
        sexo: a.sexo || 'Hembra',
        estado: a.estado || 'Sano',
        foto: a.foto || null,
        historial: typeof a.historial === 'string' ? JSON.parse(a.historial) : (a.historial || [])
      })));
    } catch (error) {
      console.error("Error al cargar:", error);
    } finally {
      setCargando(false); 
    }
  }, []);

  useEffect(() => { cargarAnimales(); }, [cargarAnimales]);
  
  // 2. REGISTRAR ANIMAL
  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      let fotoBase64 = null;
      if (formData.foto) {
        fotoBase64 = await comprimirImagen(formData.foto);
      }

      const res = await authenticatedFetch('/animales', {
        method: 'POST',
        body: JSON.stringify({
          caravana_id: formData.chapeta.toUpperCase(),
          peso_inicial: Number(formData.peso),
          lote: formData.potrero,
          raza: formData.raza,
          sexo: formData.sexo,
          estado: formData.estado,
          foto: fotoBase64
        })
      });
      if (res.ok) {
        await cargarAnimales();
        setIsModalOpen(false);
        setFormData(estadoInicial);
      }
    } catch { alert("Error de conexión"); }
  };

  const handleActualizar = async (e) => {
    e.preventDefault();

    if (!editingAnimal.pesoActual) {
      alert("El peso es obligatorio");
      return;
    }

    try {
      let fotoBase64 = editingAnimal.foto;
      if (fotoEdit) {
        fotoBase64 = await comprimirImagen(fotoEdit);
      }

      const payload = {
        peso_actual: Number(editingAnimal.pesoActual),
        estado: editingAnimal.estado,
        lote: editingAnimal.potrero,
        foto: fotoBase64
      };

      console.log("Enviando actualización:", payload);

      const res = await authenticatedFetch(`/animales/${editingAnimal.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      console.log("Respuesta del servidor:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("Actualización exitosa:", data);
        await cargarAnimales();
        setEditingAnimal(null);
        setFotoEdit(null);
        setFotoPreview(null);
      } else {
        const error = await res.json();
        console.error("Error del servidor:", error);
        alert("Error al actualizar: " + (error.error || "Error desconocido"));
      }
    } catch (err) {
      console.error("Error en handleActualizar:", err);
      alert("Error al actualizar: " + err.message);
    }
  };

  const eliminarAnimal = async (id) => {
    if (!window.confirm("¿Eliminar este registro?")) return;
    try {
      await authenticatedFetch(`/animales/${id}`, { method: 'DELETE' });
      await cargarAnimales();
    } catch { alert("Error al eliminar"); }
  };

  const filtrados = useMemo(() => {
    return animales.filter(a => 
      a.chapeta.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.raza.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [animales, busqueda]);

  if (cargando) return <div className="p-10 text-center uppercase font-black text-slate-400">Sincronizando...</div>;

  return (
    <div className="p-4 sm:p-8 bg-[#F8FAFC]">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Inventario Bovino</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">Registros en producción real</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => setVistaTabular(!vistaTabular)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all text-slate-600">
            {vistaTabular ? <LayoutGrid size={20}/> : <List size={20}/>}
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase hover:bg-green-600 transition-all shadow-lg shadow-slate-900/10">
            <Plus size={18} className="inline mr-2"/> Registrar Animal
          </button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="p-4 sm:p-8 bg-[#F8FAFC] flex-1">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" placeholder="Buscar por número de chapeta o raza..." 
          className="w-full pl-16 pr-8 py-5 bg-white rounded-2xl outline-none font-bold text-xs shadow-sm border border-transparent focus:border-slate-200 transition-all text-slate-700"
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* RENDERIZADO DE LAS VISTAS */}
      {filtrados.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-xs font-bold text-slate-400 italic">
          No se encontraron animales para el criterio buscado.
        </div>
      ) : vistaTabular ? (
        /* VISTA TABULAR (Responsiva para dispositivos pequeños) */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/70 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-5">Identificación / Lote</th>
                  <th className="px-6 py-5 text-center">P. Inicial</th>
                  <th className="px-6 py-5 text-center">P. Actual</th>
                  <th className="px-6 py-5 text-center">Ganancia</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtrados.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-8 py-5 font-black uppercase">
                      <div className="text-slate-900 text-sm">{a.chapeta}</div>
                      <div className="text-[10px] text-slate-400 font-bold tracking-tight">{a.raza} • Lote: <span className="text-blue-600">{a.potrero}</span></div>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-slate-400 text-xs">{a.pesoInicial} KG</td>
                    <td className="px-6 py-5 text-center font-black text-slate-900 text-xs">
                      <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md border border-green-100">{a.pesoActual} KG</span>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-green-600 text-[10px]">
                      +{(a.pesoActual - a.pesoInicial).toFixed(1)} KG
                    </td>
                    <td className="px-8 py-5 text-right space-x-1 whitespace-nowrap">
                      <button onClick={() => setViewingAnimal(a)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Eye size={16}/></button>
                      <button onClick={() => abrirEditarAnimal(a)} className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"><Edit3 size={16}/></button>
                      <button onClick={() => eliminarAnimal(a.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VISTA DE TARJETAS (CARDS) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map(a => {
            const ganancia = (a.pesoActual - a.pesoInicial).toFixed(1);
            return (
              <div key={a.id} className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col justify-between">
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-[10px] uppercase shadow-md shadow-slate-900/10">
                        {a.chapeta.substring(0, 2)}
                      </div>
                      <div>
                        <span className="block text-[9px] font-black text-blue-600 uppercase tracking-wider">{a.raza}</span>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{a.chapeta}</h3>
                      </div>
                    </div>
                    <button onClick={() => setViewingAnimal(a)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                      <Eye size={18}/>
                    </button>
                  </div>
                  <div className="flex gap-1.5 mb-2 text-[9px] font-black uppercase">
                    <span className={`px-2.5 py-0.5 rounded-full ${a.estado === 'Sano' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{a.estado}</span>
                    <span className="px-2.5 py-0.5 bg-slate-50 text-slate-500 rounded-full">Lote: {a.potrero}</span>
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50/50 flex justify-between items-center border-y border-slate-100">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">Peso Actual</span>
                    <span className="text-2xl font-black text-slate-900">{a.pesoActual}<span className="text-xs ml-0.5 text-slate-400">KG</span></span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">Evolución</span>
                    <span className="text-xs font-black text-green-600">▲ {ganancia} KG</span>
                  </div>
                </div>
                <div className="p-4 px-6 flex justify-between items-center bg-white">
                  <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${a.sexo === 'Hembra' ? 'bg-pink-50 text-pink-500' : 'bg-blue-50 text-blue-500'}`}>{a.sexo}</div>
                  <div className="flex gap-0.5">
                    <button onClick={() => abrirEditarAnimal(a)} className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"><Edit3 size={16}/></button>
                    <button onClick={() => eliminarAnimal(a.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL REGISTRO (ENTRADA ANIMAL) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-xl border border-slate-100">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight text-slate-900">Entrada Animal</h2>
            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Identificación</label>
                <input required placeholder="Número de Chapeta" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-slate-200 transition-all uppercase text-slate-700" value={formData.chapeta} onChange={e => setFormData({...formData, chapeta: e.target.value})} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Raza</label>
                <input required placeholder="Ej: Brahman, Nelore" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-slate-200 transition-all text-slate-700" value={formData.raza} onChange={e => setFormData({...formData, raza: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Peso Entrada (KG)</label>
                  <input required type="number" placeholder="0" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-slate-200 transition-all text-slate-700" value={formData.peso} onChange={e => setFormData({...formData, peso: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Sexo</label>
                  <select className="w-full p-4 bg-slate-50 rounded-xl font-bold text-xs uppercase cursor-pointer border border-transparent focus:border-slate-200 outline-none text-slate-700" value={formData.sexo} onChange={e => setFormData({...formData, sexo: e.target.value})}>
                    <option value="Hembra">Hembra</option>
                    <option value="Macho">Macho</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Lote o Potrero</label>
                <input placeholder="Ej: Levante, Sabana" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-slate-200 transition-all text-slate-700" value={formData.potrero} onChange={e => setFormData({...formData, potrero: e.target.value})} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Foto (Opcional)</label>
                <input type="file" accept="image/jpeg" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-xs outline-none border border-transparent focus:border-slate-200 transition-all text-slate-700 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700" onChange={e => setFormData({...formData, foto: e.target.files?.[0] || null})} />
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-wider mt-2 hover:bg-green-600 transition-all shadow-md shadow-slate-900/10">Guardar Registro</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-wider text-center pt-1">Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR (REGISTRO DE NUEVO PESAJE) */}
      {editingAnimal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-1 uppercase tracking-tight text-slate-900">Control de Pesaje</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-6">Módulo de control de crecimiento</p>
            <form onSubmit={handleActualizar} className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Animal Seleccionado</label>
                <input className="w-full p-4 bg-slate-100 rounded-xl font-bold text-sm text-slate-500 cursor-not-allowed uppercase border border-slate-200/50" value={editingAnimal.chapeta} disabled />
              </div>
              {(editingAnimal.foto || fotoEdit || fotoPrevie) && (
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Foto Actual</label>
                  <img src={fotoPrevie || editingAnimal.foto} alt={editingAnimal.chapeta} className="w-full h-40 object-cover rounded-xl border border-slate-200" />
                </div>
              )}
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Cambiar Foto (Opcional)</label>
                <input type="file" accept="image/jpeg" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-xs outline-none border border-transparent focus:border-slate-200 transition-all text-slate-700 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFotoEdit(file);
                    const reader = new FileReader();
                    reader.onload = () => setFotoPreview(reader.result);
                    reader.readAsDataURL(file);
                  }
                }} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-green-600 uppercase mb-1">Nuevo Peso Registrado (KG)</label>
                <input type="number" step="0.1" autoFocus className="w-full p-4 bg-green-50/50 rounded-xl font-black border-2 border-green-500 text-2xl outline-none text-green-900 text-center" value={editingAnimal.pesoActual} onChange={e => setEditingAnimal({...editingAnimal, pesoActual: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Estado Sanitario</label>
                  <select className="w-full p-4 bg-slate-50 rounded-xl font-bold text-xs uppercase outline-none border border-transparent focus:border-slate-200 text-slate-700" value={editingAnimal.estado} onChange={e => setEditingAnimal({...editingAnimal, estado: e.target.value})}>
                    <option value="Sano">Sano</option>
                    <option value="Tratamiento">Tratamiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Mover a Lote</label>
                  <input className="w-full p-4 bg-slate-50 rounded-xl font-bold text-xs outline-none border border-transparent focus:border-slate-200 text-slate-700" value={editingAnimal.potrero} onChange={e => setEditingAnimal({...editingAnimal, potrero: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-xl font-black uppercase text-xs tracking-wider mt-2 hover:bg-green-700 transition-all shadow-md shadow-green-900/10">Actualizar Pesaje</button>
              <button type="button" onClick={() => { setEditingAnimal(null); setFotoEdit(null); setFotoPreview(null); }} className="w-full text-slate-400 font-bold text-[10px] uppercase text-center pt-1">Cerrar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FICHA TÉCNICA (HISTORIAL Y TRAZABILIDAD) */}
      {viewingAnimal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] w-full max-w-2xl shadow-xl relative max-h-[85vh] overflow-y-auto border border-slate-100">
            <button onClick={() => setViewingAnimal(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"><X size={20}/></button>

            <div className="mb-6">
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">Ficha de Trazabilidad</span>
              <h2 className="text-3xl font-black text-slate-900 uppercase mt-3 tracking-tight">Bovino {viewingAnimal.chapeta}</h2>
            </div>

            {viewingAnimal.foto && (
              <div className="mb-6">
                <img src={viewingAnimal.foto} alt={viewingAnimal.chapeta} className="w-full h-64 object-cover rounded-2xl border border-slate-200 shadow-md" />
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-slate-700">
              <div className="bg-slate-50 p-4 rounded-xl"><span className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">Raza</span><span className="text-xs font-bold">{viewingAnimal.raza}</span></div>
              <div className="bg-slate-50 p-4 rounded-xl"><span className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">Potrero</span><span className="text-xs font-bold">{viewingAnimal.potrero}</span></div>
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50"><span className="block text-[9px] font-black text-blue-400 uppercase mb-0.5">P. Entrada</span><span className="text-sm font-black text-blue-700">{viewingAnimal.pesoInicial} KG</span></div>
              <div className="bg-green-50/50 p-4 rounded-xl border border-green-100/50"><span className="block text-[9px] font-black text-green-400 uppercase mb-0.5">P. Actual</span><span className="text-sm font-black text-green-700">{viewingAnimal.pesoActual} KG</span></div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2 tracking-wider"><History size={14} /> Historial Cronológico de Pesajes</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {viewingAnimal.historial?.length > 0 ? (
                  viewingAnimal.historial.slice().reverse().map((reg, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50/60 p-3.5 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Fecha del Evento</p>
                        <p className="font-bold text-slate-700">{reg.fecha}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Peso Evaluado</p>
                        <p className="font-black text-slate-900 text-sm">{reg.peso} KG</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-[10px] font-bold text-slate-400 italic bg-slate-50/50 rounded-xl">
                    Este animal mantiene únicamente su pesaje de entrada inicial.
                  </p>
                )}
              </div>
            </div>
            <button onClick={() => setViewingAnimal(null)} className="w-full mt-8 py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all hover:bg-slate-800">Cerrar Ficha</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioLista;