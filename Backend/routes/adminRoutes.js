import express from 'express';
import { verificarToken, autorizarRoles } from '../middlewares/authMiddlewares.js';
import { crearNuevaHacienda, obtenerBitacora } from '../controllers/adminController.js';

const router = express.Router();

// Middleware aplicado a TODAS las rutas de abajo
router.use(verificarToken, autorizarRoles('SuperAdmin'));

router.post('/crear-cliente', crearNuevaHacienda);
router.get('/bitacora', obtenerBitacora);

export default router;
export default router;