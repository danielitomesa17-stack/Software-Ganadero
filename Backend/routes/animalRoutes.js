import express from 'express';
import { 
    getAnimales, 
    registrarAnimal, 
    actualizarAnimal, 
    eliminarAnimal 
} from '../controllers/animalController.js'; // 💡 Recuerda el .js en producción
import { verificarToken, autorizarRoles } from '../middlewares/authMiddlewares.js'; // 💡 Recuerda el .js en producción

const router = express.Router();

// 1. Obtener inventario (Cualquier usuario autenticado de la hacienda)
router.get('/animales', verificarToken, getAnimales);

// 2. Registrar animal (Verifica token y si quieres restringir por rol, puedes usar tu otro middleware)
router.post('/animales', verificarToken, registrarAnimal);

// 3. Actualizar pesaje o datos del animal
router.put('/animales/:id', verificarToken, actualizarAnimal);

// 4. Eliminar animal (Por ejemplo, puedes restringir para que solo el "Administrador" borre)
router.delete('/animales/:id', verificarToken, autorizarRoles('Administrador', 'Propietario'), eliminarAnimal);

export default router;