import express from 'express';
import {
    getAnimales,
    getAnimalById,
    registrarAnimal,
    actualizarAnimal,
    eliminarAnimal
} from '../controllers/animalController.js';
import { setTenant } from '../middlewares/setTenant.js';
import { verificarToken, autorizarRoles } from '../middlewares/authMiddlewares.js';

const router = express.Router();

// 1. Obtener inventario (Cualquier usuario autenticado de la hacienda)
router.get('/', verificarToken, setTenant, getAnimales);

// 1.5 Obtener un animal específico por ID
router.get('/:id', verificarToken, setTenant, getAnimalById);

// 2. Registrar animal
router.post('/', verificarToken, setTenant, registrarAnimal);

// 3. Actualizar pesaje o datos del animal
router.put('/:id', verificarToken, setTenant, actualizarAnimal);

// 4. Eliminar animal
router.delete('/:id', verificarToken, setTenant, autorizarRoles('Administrador', 'Propietario'), eliminarAnimal);

export default router;