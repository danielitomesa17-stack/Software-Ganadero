import express from 'express';
import { verificarToken, autorizarRoles } from '../middlewares/authMiddlewares.js';
import { crearNuevaHacienda } from '../controllers/adminController.js';

const router = express.Router();

// Ruta protegida: Solo el SuperAdmin puede crear nuevos clientes SaaS
router.post('/crear-cliente', 
    verificarToken, 
    autorizarRoles('SuperAdmin'), 
    crearNuevaHacienda
);

export default router;