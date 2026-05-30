// Backend/routes/medicamentoRoutes.js
import express from 'express';
import { verificarToken } from '../middlewares/authMiddlewares.js';
import { setTenant } from '../middlewares/setTenant.js';
import {
  getMedicamentos,
  getMedicamento,
  buscarMedicamentos,
  obtenerStockBajo,
  obtenerProximosVencer,
  obtenerVencidos,
  obtenerEstadisticas,
  crearMedicamento,
  actualizarMedicamento,
  registrarMovimientoStock,
  obtenerHistorial,
  obtenerHistorialHacienda,
  eliminarMedicamento,
} from '../controllers/medicamentoController.js';

const router = express.Router();

// Rutas básicas CRUD
router.get('/', verificarToken, setTenant, getMedicamentos);
router.get('/:id', verificarToken, setTenant, getMedicamento);
router.post('/', verificarToken, setTenant, crearMedicamento);
router.put('/:id', verificarToken, setTenant, actualizarMedicamento);
router.delete('/:id', verificarToken, setTenant, eliminarMedicamento);

// Rutas de búsqueda y filtros
router.post('/buscar/avanzado', verificarToken, setTenant, buscarMedicamentos);
router.get('/alertas/stock-bajo', verificarToken, setTenant, obtenerStockBajo);
router.get('/alertas/proximo-vencer', verificarToken, setTenant, obtenerProximosVencer);
router.get('/alertas/vencidos', verificarToken, setTenant, obtenerVencidos);

// Rutas de movimientos y historial
router.post('/:id/movimiento-stock', verificarToken, setTenant, registrarMovimientoStock);
router.get('/:id/historial', verificarToken, setTenant, obtenerHistorial);
router.get('/hacienda/historial/completo', verificarToken, setTenant, obtenerHistorialHacienda);

// Rutas de reportes
router.get('/reportes/estadisticas', verificarToken, setTenant, obtenerEstadisticas);

export default router;

