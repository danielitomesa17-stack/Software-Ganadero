// src/routes/animalRoutes.js
import express from 'express';
// Importamos el controlador de animales
import { 
    getAnimales, 
    registrarAnimal, 
    actualizarAnimal, 
    eliminarAnimal 
} from '../controllers/animalController.js'; 

// 🔒 Importamos el guardián del SaaS desde la carpeta de middlewares
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Añadimos 'verificarToken' como segundo argumento para proteger cada endpoint
router.get('/', verificarToken, getAnimales);
router.post('/', verificarToken, registrarAnimal);
router.put('/:id', verificarToken, actualizarAnimal);
router.delete('/:id', verificarToken, eliminarAnimal);

export default router;