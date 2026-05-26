// Backend/controllers/medicamentoController.js

import Medicamento from '../models/Medicamento.js';

/**
 * Obtiene la lista completa de medicamentos.
 */
export const getMedicamentos = async (req, res) => {
  try {
    const list = await Medicamento.list();
    res.json({ success: true, data: list });
  } catch (err) {
    console.error('Error obteniendo medicamentos:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

/**
 * Obtiene un medicamento por id.
 */
export const getMedicamento = async (req, res) => {
  const { id } = req.params;
  try {
    const med = await Medicamento.getById(id);
    if (!med) return res.status(404).json({ success: false, error: 'Medicamento no encontrado' });
    res.json({ success: true, data: med });
  } catch (err) {
    console.error('Error obteniendo medicamento:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

/**
 * Crea un nuevo medicamento.
 */
export const crearMedicamento = async (req, res) => {
  try {
    const insertId = await Medicamento.create(req.body);
    res.status(201).json({ success: true, id: insertId });
  } catch (err) {
    console.error('Error creando medicamento:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

/**
 * Actualiza un medicamento existente.
 */
export const actualizarMedicamento = async (req, res) => {
  const { id } = req.params;
  try {
    await Medicamento.update(id, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error('Error actualizando medicamento:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

/**
 * Elimina un medicamento.
 */
export const eliminarMedicamento = async (req, res) => {
  const { id } = req.params;
  try {
    await Medicamento.delete(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error eliminando medicamento:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};
