import express from 'express';
import { verificarToken } from '../middlewares/authMiddlewares.js';
import { setTenant } from '../middlewares/setTenant.js';
import gastoController from '../controllers/gastoController.js';

const router = express.Router();

// Definimos las rutas (EndPoints)
router.get('/', verificarToken, setTenant, gastoController.getGastos);         // GET /api/gastos
router.post('/', verificarToken, setTenant, gastoController.createGasto);      // POST /api/gastos
router.put('/:id', verificarToken, setTenant, gastoController.updateGasto);    // PUT /api/gastos/1
router.delete('/:id', verificarToken, setTenant, gastoController.deleteGasto); // DELETE /api/gastos/1

export default router;