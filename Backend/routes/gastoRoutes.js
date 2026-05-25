import express from 'express';
const router = express.Router();
import gastoController from '../controllers/gastoController.js';

// Definimos las rutas (EndPoints)
router.get('/', gastoController.getGastos);         // GET /api/gastos
router.post('/', gastoController.createGasto);      // POST /api/gastos
router.put('/:id', gastoController.updateGasto);    // PUT /api/gastos/1
router.delete('/:id', gastoController.deleteGasto); // DELETE /api/gastos/1

export default router;