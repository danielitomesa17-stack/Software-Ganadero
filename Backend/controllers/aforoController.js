import Aforo from '../models/Aforo.js';

export const getAforos = async (req, res) => {
  try {
    const haciendaId = req.user?.hacienda_id || 1; // Fallback for dev if needed
    const aforos = await Aforo.list(haciendaId);
    res.json(aforos);
  } catch (error) {
    console.error("Error al obtener aforos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getAforoById = async (req, res) => {
  try {
    const haciendaId = req.user?.hacienda_id || 1;
    const aforo = await Aforo.getById(req.params.id, haciendaId);
    if (!aforo) return res.status(404).json({ error: "Aforo no encontrado" });
    res.json(aforo);
  } catch (error) {
    console.error("Error al obtener aforo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const createAforo = async (req, res) => {
  try {
    const haciendaId = req.user?.hacienda_id || 1;
    
    // Extracción de datos y cálculos base si el front no los envía completos
    const { 
      nombre_potrero, fecha, 
      peso_muestra_1, peso_muestra_2, peso_muestra_3, 
      area_total_ha, observaciones 
    } = req.body;

    if (!nombre_potrero || !fecha || !area_total_ha) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const p1 = Number(peso_muestra_1) || 0;
    const p2 = Number(peso_muestra_2) || 0;
    const p3 = Number(peso_muestra_3) || 0;

    // Calcular promedio por m2
    const muestrasValidas = [p1, p2, p3].filter(p => p > 0);
    const promedio_kg_m2 = muestrasValidas.length > 0 
      ? muestrasValidas.reduce((a, b) => a + b, 0) / muestrasValidas.length 
      : 0;

    // Calcular totales
    // 1 hectárea = 10,000 m2
    const area_total_m2 = Number(area_total_ha) * 10000;
    const forraje_total_kg = promedio_kg_m2 * area_total_m2;
    
    // Asumimos un factor de aprovechamiento del 70% (0.7) si no se especifica otra cosa.
    const factor_aprovechamiento = 0.7;
    const forraje_aprovechable_kg = forraje_total_kg * factor_aprovechamiento;

    const newId = await Aforo.create({
      hacienda_id: haciendaId,
      nombre_potrero, 
      fecha, 
      peso_muestra_1: p1, 
      peso_muestra_2: p2, 
      peso_muestra_3: p3, 
      promedio_kg_m2, 
      area_total_ha: Number(area_total_ha), 
      forraje_total_kg, 
      forraje_aprovechable_kg, 
      observaciones
    });

    res.status(201).json({ 
      message: "Aforo creado exitosamente", 
      id: newId 
    });
  } catch (error) {
    console.error("Error al crear aforo:", error);
    res.status(500).json({ error: "Error interno del servidor al crear aforo" });
  }
};

export const updateAforo = async (req, res) => {
  try {
    const haciendaId = req.user?.hacienda_id || 1;
    const id = req.params.id;
    
    // Si envían nuevos pesos o áreas, recalcular
    let dataToUpdate = { ...req.body, hacienda_id: haciendaId };

    if (dataToUpdate.peso_muestra_1 !== undefined || dataToUpdate.area_total_ha !== undefined) {
       // Buscar aforo actual para tener los valores anteriores si no se envían todos
       const current = await Aforo.getById(id, haciendaId);
       if (!current) return res.status(404).json({ error: "Aforo no encontrado" });

       const p1 = dataToUpdate.peso_muestra_1 !== undefined ? Number(dataToUpdate.peso_muestra_1) : Number(current.peso_muestra_1);
       const p2 = dataToUpdate.peso_muestra_2 !== undefined ? Number(dataToUpdate.peso_muestra_2) : Number(current.peso_muestra_2);
       const p3 = dataToUpdate.peso_muestra_3 !== undefined ? Number(dataToUpdate.peso_muestra_3) : Number(current.peso_muestra_3);
       const area_ha = dataToUpdate.area_total_ha !== undefined ? Number(dataToUpdate.area_total_ha) : Number(current.area_total_ha);

       const muestrasValidas = [p1, p2, p3].filter(p => p > 0);
       const promedio_kg_m2 = muestrasValidas.length > 0 
         ? muestrasValidas.reduce((a, b) => a + b, 0) / muestrasValidas.length 
         : 0;
       
       const forraje_total_kg = promedio_kg_m2 * (area_ha * 10000);
       const factor_aprovechamiento = 0.7;
       const forraje_aprovechable_kg = forraje_total_kg * factor_aprovechamiento;

       dataToUpdate = {
         ...dataToUpdate,
         peso_muestra_1: p1,
         peso_muestra_2: p2,
         peso_muestra_3: p3,
         promedio_kg_m2,
         area_total_ha: area_ha,
         forraje_total_kg,
         forraje_aprovechable_kg
       };
    }

    await Aforo.update(id, dataToUpdate);
    res.json({ message: "Aforo actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar aforo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const deleteAforo = async (req, res) => {
  try {
    const haciendaId = req.user?.hacienda_id || 1;
    await Aforo.delete(req.params.id, haciendaId);
    res.json({ message: "Aforo eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar aforo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
