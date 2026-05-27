import express from 'express';
import { 
    getAnimales, 
    registrarAnimal, 
    actualizarAnimal, 
    eliminarAnimal 
} from '../controllers/animalController.js'; // 💡 Recuerda el .js en producción
import { setTenant } from '../middlewares/setTenant.js'; // 💡 Recuerda el .js en producción
import { verificarToken, autorizarRoles } from '../middlewares/authMiddlewares.js';

const router = express.Router();

// 1. Obtener inventario (Cualquier usuario autenticado de la hacienda)
router.get('/', verificarToken, setTenant, getAnimales);

// 2. Registrar animal (Verifica token y si quieres restringir por rol, puedes usar tu otro middleware)
router.post('/', verificarToken, setTenant, registrarAnimal);

// 3. Actualizar pesaje o datos del animal
router.put('/:id', verificarToken, setTenant, actualizarAnimal);

// 4. Eliminar animal (Por ejemplo, puedes restringir para que solo el "Administrador" borre)
router.delete('/:id', verificarToken, setTenant, autorizarRoles('Administrador', 'Propietario'), eliminarAnimal);

export default router;