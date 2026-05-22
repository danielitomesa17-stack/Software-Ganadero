import express from 'express';
import { verificarToken, autorizarRoles } from '../middlewares/authMiddlewares.js';
import { crearNuevaHacienda, obtenerBitacora, obtenerUsuarios } from '../controllers/adminController.js';

const router = express.Router();

// Middleware aplicado a TODAS las rutas de este archivo
router.use(verificarToken, autorizarRoles('SuperAdmin'));

// Rutas usando los controladores
router.post('/crear-cliente', crearNuevaHacienda);
router.get('/bitacora', obtenerBitacora);
router.get('/usuarios', verificarToken, autorizarRoles('SuperAdmin'), obtenerUsuarios);
router.patch('/usuarios/:id/estado', verificarToken, autorizarRoles('SuperAdmin'), cambiarEstadoUsuario);
router.patch('/usuarios/:id/rol', verificarToken, autorizarRoles('SuperAdmin'), actualizarRolUsuario);
export default router;