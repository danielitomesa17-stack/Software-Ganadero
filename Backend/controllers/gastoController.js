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
      // Guardar que el cuerpo de la petición exista
      if (!req.body) {
        console.warn('⚠️ createGasto llamado sin body');
        return res.status(400).json({
          success: false,
          message: 'Datos del gasto faltantes',
          error: 'req.body es undefined'
        });
      }
      console.log('🔧 crear gasto - req.body:', req.body);
      const payload = {
        concepto: req.body.concepto.toUpperCase(),
        monto: parseFloat(req.body.monto),
        categoria: req.body.categoria,
        hacienda_id: req.user?.hacienda_id || req.user?.haciendaId
      };
      const nuevoGastoId = await Gasto.create(payload);
      res.status(201).json({
        success: true,
        message: 'Gasto registrado en la base de datos',
        id: nuevoGastoId,
      });
    } catch (error) {
      console.error('Error al crear gasto:', error);
      // Enviar respuesta clara con mensaje del backend para depuración
      const msg = error?.sqlMessage || error?.message || 'Error al crear el gasto';
      res.status(500).json({ success: false, message: msg });
    }
  },

  // 3. Actualizar un gasto existente
  updateGasto: async (req, res, next) => {
    try {
      const { id } = req.params;
      // Normalizar datos provenientes del formulario
      // Guardar que el cuerpo de la petición exista
      if (!req.body) {
        console.warn('⚠️ updateGasto llamado sin body');
        return res.status(400).json({
          success: false,
          message: 'Datos de actualización faltantes',
          error: 'req.body es undefined'
        });
      }
      console.log('🔧 actualizar gasto - req.body:', req.body);
      const payload = {
        concepto: req.body.concepto ? req.body.concepto.toUpperCase() : undefined,
        monto: req.body.monto ? parseFloat(req.body.monto) : undefined,
        categoria: req.body.categoria,
        // Añadir hacienda_id del token para que la actualización tenga referencia
        hacienda_id: req.user?.hacienda_id || req.user?.haciendaId
      };
      // Eliminar propiedades undefined para evitar actualizar con NULL
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
      console.log('Actualizar gasto payload:', payload);
      await Gasto.update(id, payload);

      res.status(200).json({
        success: true,
        message: 'Gasto actualizado correctamente'
      });
    } catch (error) {
      console.error('Error al actualizar gasto:', error);
      // Enviamos respuesta clara con mensaje de error del backend
      const msg = error?.sqlMessage || error?.message || 'Error al actualizar el gasto';
      res.status(500).json({ success: false, message: msg });
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