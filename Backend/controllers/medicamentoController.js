// Backend/controllers/medicamentoController.js

import Medicamento from '../models/Medicamento.js';
import HistorialMedicamentos from '../models/HistorialMedicamentos.js';

/**
 * Obtiene la lista completa de medicamentos.
 */
export const getMedicamentos = async (req, res) => {
  try {
    const tenantId = req.user?.hacienda_id || req.user?.haciendaId;
    const list = await Medicamento.list(tenantId);
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
 * Búsqueda avanzada de medicamentos.
 */
export const buscarMedicamentos = async (req, res) => {
  try {
    const tenantId = req.user?.hacienda_id || req.user?.haciendaId;
    const filtros = req.body;
    const medicamentos = await Medicamento.buscar(tenantId, filtros);
    res.json({ success: true, data: medicamentos });
  } catch (err) {
    console.error('Error buscando medicamentos:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

/**
 * Obtiene medicamentos con stock bajo.
 */
export const obtenerStockBajo = async (req, res) => {
  try {
    const tenantId = req.user?.hacienda_id || req.user?.haciendaId;
    const medicamentos = await Medicamento.obtenerStockBajo(tenantId);
    res.json({ success: true, data: medicamentos });
  } catch (err) {
    console.error('Error obteniendo stock bajo:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

/**
 * Obtiene medicamentos próximos a vencer.
 */
export const obtenerProximosVencer = async (req, res) => {
  try {
    const tenantId = req.user?.hacienda_id || req.user?.haciendaId;
    const { dias = 30 } = req.query;
    const medicamentos = await Medicamento.obtenerProximosVencer(tenantId, parseInt(dias, 10));
    res.json({ success: true, data: medicamentos });
  } catch (err) {
    console.error('Error obteniendo próximos a vencer:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

/**
 * Obtiene medicamentos vencidos.
 */
export const obtenerVencidos = async (req, res) => {
  try {
    const tenantId = req.user?.hacienda_id || req.user?.haciendaId;
    const medicamentos = await Medicamento.obtenerVencidos(tenantId);
    res.json({ success: true, data: medicamentos });
  } catch (err) {
    console.error('Error obteniendo vencidos:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

/**
 * Obtiene estadísticas de inventario.
 */
export const obtenerEstadisticas = async (req, res) => {
  try {
    const tenantId = req.user?.hacienda_id || req.user?.haciendaId;
    const estadisticas = await Medicamento.obtenerEstadisticas(tenantId);
    res.json({ success: true, data: estadisticas });
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

/**
 * Crea un nuevo medicamento.
 */
export const crearMedicamento = async (req, res) => {
  try {
    const tenantId = req.user?.hacienda_id || req.user?.haciendaId;
    const userId = req.user?.id;
    const payload = { ...req.body, hacienda_id: tenantId };

    // Validaciones
    const errores = Medicamento.validar(payload);
    if (errores.length > 0) {
      return res.status(400).json({ success: false, error: 'Validación fallida', errores });
    }

    const insertId = await Medicamento.create(payload);

    // Registrar en historial
    await HistorialMedicamentos.registrar({
      medicamento_id: insertId,
      hacienda_id: tenantId,
      usuario_id: userId,
      tipo_movimiento: 'crear',
      cantidad_nueva: payload.stock || 0,
      descripcion: `Medicamento creado: ${payload.nombre}`,
    });

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
    const tenantId = req.user?.hacienda_id || req.user?.haciendaId;
    const userId = req.user?.id;
    const payload = { ...req.body, hacienda_id: tenantId };

    // Validaciones
    const errores = Medicamento.validar(payload);
    if (errores.length > 0) {
      return res.status(400).json({ success: false, error: 'Validación fallida', errores });
    }

    // Obtener datos anteriores para registrar cambios
    const medicamentoAnterior = await Medicamento.getById(id);
    if (!medicamentoAnterior) {
      return res.status(404).json({ success: false, error: 'Medicamento no encontrado' });
    }

    await Medicamento.update(id, payload);

    // Registrar cambios en historial
    const cambios = {};
    Object.keys(payload).forEach((key) => {
      if (medicamentoAnterior[key] !== payload[key] && key !== 'hacienda_id') {
        cambios[key] = {
          anterior: medicamentoAnterior[key],
          nueva: payload[key],
        };
      }
    });

    if (Object.keys(cambios).length > 0) {
      await HistorialMedicamentos.registrar({
        medicamento_id: id,
        hacienda_id: tenantId,
        usuario_id: userId,
        tipo_movimiento: 'actualizar',
        cantidad_anterior: medicamentoAnterior.stock,
        cantidad_nueva: payload.stock,
        cambios_otros: cambios,
        descripcion: `Medicamento actualizado: ${medicamentoAnterior.nombre}`,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error actualizando medicamento:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

/**
 * Registra un movimiento de stock (entrada o salida).
 */
export const registrarMovimientoStock = async (req, res) => {
  const { id } = req.params;
  try {
    const tenantId = req.user?.hacienda_id || req.user?.haciendaId;
    const userId = req.user?.id;
    const { cantidad, tipo, motivo } = req.body;

    if (!cantidad || cantidad === 0) {
      return res.status(400).json({ success: false, error: 'Cantidad inválida' });
    }

    if (!['entrada', 'salida'].includes(tipo)) {
      return res.status(400).json({ success: false, error: 'Tipo de movimiento inválido' });
    }

    const medicamento = await Medicamento.getById(id);
    if (!medicamento) {
      return res.status(404).json({ success: false, error: 'Medicamento no encontrado' });
    }

    const stockAnterior = medicamento.stock;
    const stockNuevo = tipo === 'entrada' ? stockAnterior + parseFloat(cantidad) : stockAnterior - parseFloat(cantidad);

    if (stockNuevo < 0) {
      return res.status(400).json({ success: false, error: 'Stock insuficiente para realizar la salida' });
    }

    await Medicamento.update(id, { stock: stockNuevo });

    // Registrar movimiento en historial
    await HistorialMedicamentos.registrar({
      medicamento_id: id,
      hacienda_id: tenantId,
      usuario_id: userId,
      tipo_movimiento: tipo === 'entrada' ? 'entrada_stock' : 'salida_stock',
      cantidad_anterior: stockAnterior,
      cantidad_nueva: stockNuevo,
      descripcion: `${tipo === 'entrada' ? 'Entrada' : 'Salida'} de stock: ${cantidad} ${medicamento.unidad}. Motivo: ${motivo || 'N/A'}`,
    });

    res.json({ success: true, stock_anterior: stockAnterior, stock_nuevo: stockNuevo });
  } catch (err) {
    console.error('Error registrando movimiento:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

/**
 * Obtiene el historial de un medicamento.
 */
export const obtenerHistorial = async (req, res) => {
  const { id } = req.params;
  try {
    const { limit = 50, offset = 0 } = req.query;
    const historial = await HistorialMedicamentos.obtenerPorMedicamento(id, parseInt(limit, 10), parseInt(offset, 10));
    res.json({ success: true, data: historial });
  } catch (err) {
    console.error('Error obteniendo historial:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

/**
 * Obtiene el historial de la hacienda.
 */
export const obtenerHistorialHacienda = async (req, res) => {
  try {
    const tenantId = req.user?.hacienda_id || req.user?.haciendaId;
    const { limit = 100, offset = 0 } = req.query;
    const historial = await HistorialMedicamentos.obtenerPorHacienda(tenantId, parseInt(limit, 10), parseInt(offset, 10));
    res.json({ success: true, data: historial });
  } catch (err) {
    console.error('Error obteniendo historial:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

/**
 * Elimina un medicamento (marcar como inactivo).
 */
export const eliminarMedicamento = async (req, res) => {
  const { id } = req.params;
  try {
    const tenantId = req.user?.hacienda_id || req.user?.haciendaId;
    const userId = req.user?.id;

    const medicamento = await Medicamento.getById(id);
    if (!medicamento) {
      return res.status(404).json({ success: false, error: 'Medicamento no encontrado' });
    }

    await Medicamento.delete(id);

    // Registrar eliminación en historial
    await HistorialMedicamentos.registrar({
      medicamento_id: id,
      hacienda_id: tenantId,
      usuario_id: userId,
      tipo_movimiento: 'eliminar',
      descripcion: `Medicamento eliminado: ${medicamento.nombre}`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error eliminando medicamento:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

