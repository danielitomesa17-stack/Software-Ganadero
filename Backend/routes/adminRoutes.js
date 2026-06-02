import express from 'express';
import { verificarToken, autorizarRoles } from '../middlewares/authMiddlewares.js';
import { crearNuevaHacienda, obtenerBitacora, obtenerUsuarios, cambiarEstadoUsuario, actualizarRolUsuario, obtenerEstadisticas } from '../controllers/adminController.js';

const router = express.Router();

// adminRoutes.js

// Middleware aplicado a TODAS las rutas de este archivo
router.use(verificarToken, autorizarRoles('SuperAdmin'));

// Rutas usando los controladores
router.get('/estadisticas', obtenerEstadisticas);
router.post('/crear-cliente', crearNuevaHacienda);
router.get('/bitacora', obtenerBitacora);
router.get('/usuarios', obtenerUsuarios); // Ya tiene el middleware aplicado globalmente
router.patch('/usuarios/:id/estado', cambiarEstadoUsuario);
router.patch('/usuarios/:id/rol', actualizarRolUsuario);

export default router;