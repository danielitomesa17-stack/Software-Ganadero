import Gasto from '../../models/Gasto.js';

const gastoController = {
    // 1. Obtener todos los gastos de MySQL filtrados por hacienda
    getGastos: async (req, res, next) => {
        try {
            const { haciendaId } = req.user;
            const gastos = await Gasto.findAll({ hacienda_id: haciendaId }); // Filtrar por hacienda
            res.status(200).json({
                success: true,
                data: gastos
            });
        } catch (error) {
            next(error); // Lo envía al errorHandler.js que creamos antes
        }
    },

    // 2. Crear un nuevo gasto (Manual o desde Farmacia) con hacienda_id del usuario
    createGasto: async (req, res, next) => {
        try {
            const haciendaId = req.user?.haciendaId || req.user?.hacienda_id;
            const bodyConHacienda = { ...req.body, hacienda_id: haciendaId };
            const nuevoGastoId = await Gasto.create(bodyConHacienda);
            res.status(201).json({
                success: true,
                message: 'Gasto registrado en la base de datos',
                id: nuevoGastoId
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
                message: 'Gasto actualizado correctamente'
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
                message: 'Gasto eliminado de MySQL'
            });
        } catch (error) {
            next(error);
        }
    }
};

export default gastoController;

const gastoController = {
    // 1. Obtener todos los gastos de MySQL
    getGastos: async (req, res, next) => {
        try {
            const { haciendaId } = req.user;
        const gastos = await Gasto.findAll({ where: { hacienda_id: haciendaId } }); // Filtrar por hacienda
            res.status(200).json({
                success: true,
                data: gastos
            });
        } catch (error) {
            next(error); // Lo envía al errorHandler.js que creamos antes
        }
    },

    // 2. Crear un nuevo gasto (Manual o desde Farmacia)
    createGasto: async (req, res, next) => {
        try {
            // El req.body contiene: fecha, concepto, monto, categoria
            // Añadimos hacienda_id desde el token autenticado
            const haciendaId = req.user?.haciendaId || req.user?.hacienda_id;
            const bodyConHacienda = { ...req.body, hacienda_id: haciendaId };
            const nuevoGastoId = await Gasto.create(bodyConHacienda);
            res.status(201).json({
                success: true,
                message: 'Gasto registrado en la base de datos',
                id: nuevoGastoId
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
                message: 'Gasto actualizado correctamente'
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
                message: 'Gasto eliminado de MySQL'
            });
        } catch (error) {
            next(error);
        }
    }
};

export default gastoController;