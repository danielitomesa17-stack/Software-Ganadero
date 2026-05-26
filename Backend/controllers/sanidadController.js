// Backend/controllers/sanidadController.js

import Sanidad from '../models/Sanidad.js';

export const getAllSanidad = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const list = await Sanidad.list(tenantId);
    res.json({ success: true, data: list });
  } catch (err) {
    console.error('Error obteniendo sanidad:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const crearSanidad = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const data = { ...req.body, hacienda_id: tenantId };
    const insertId = await Sanidad.create(data);
    res.status(201).json({ success: true, id: insertId });
  } catch (err) {
    console.error('Error creando registro de sanidad:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const eliminarSanidad = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.tenantId;
  try {
    await Sanidad.delete(id, tenantId);
    res.json({ success: true });
  } catch (err) {
    console.error('Error eliminando registro de sanidad:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};
