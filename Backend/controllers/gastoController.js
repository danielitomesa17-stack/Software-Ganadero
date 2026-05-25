import Gasto from '../models/Gasto.js';

/**
 * Controlador para manejar operaciones CRUD de gastos.
 * Cada operación asume que el middleware de autenticación ha agregado
 * `req.user` con la información del usuario, incluyendo `haciendaId` o `hacienda_id`.
 */
const gastoController = {
  // 1. Obtener todos los gastos filtrados por hacienda del usuario
  getGastos: async (req, res, next) => {
    try {
      const haciendaId = req.user?.haciendaId || req.user?.hacienda_id;
      // Llamamos al modelo pasando directamente el filtro esperado (hacienda_id)
      const gastos = await Gasto.findAll({ hacienda_id: haciendaId });
      res.status(200).json({ success: true, data: gastos });
    } catch (error) {
      next(error);
    }
  },

  // 2. Crear un nuevo gasto (manual o desde farmacia) adjuntando hacienda_id
  createGasto: async (req, res, next) => {
    try {
      const haciendaId = req.user?.haciendaId || req.user?.hacienda_id;
      const bodyConHacienda = { ...req.body, hacienda_id: haciendaId };
      const nuevoGastoId = await Gasto.create(bodyConHacienda);
      res.status(201).json({
        success: true,
        message: 'Gasto registrado en la base de datos',
        id: nuevoGastoId,
      });
    } catch (error) {
      next(error);
    }
  },

  // 3. Actualizar un gasto existente
  updateGasto: async (req, res, next) => {
    try {
      const { id } = req.params;
      await Gasto.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Gasto actualizado correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  // 4. Eliminar un gasto
  deleteGasto: async (req, res, next) => {
    try {
      const { id } = req.params;
      await Gasto.delete(id);
      res.status(200).json({
        success: true,
        message: 'Gasto eliminado de MySQL',
      });
    } catch (error) {
      next(error);
    }
  },
};

export default gastoController;