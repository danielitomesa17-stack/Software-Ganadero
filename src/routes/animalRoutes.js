// src/routes/animalRoutes.js
import express from 'express';
// Subimos un nivel (..) para salir de routes y entrar en controllers
import { 
    getAnimales, 
    registrarAnimal, 
    actualizarAnimal, 
    eliminarAnimal 
} from '../controllers/animalController.js'; 

const router = express.Router();

router.get('/', getAnimales);
router.post('/', registrarAnimal);
router.put('/:id', actualizarAnimal);
router.delete('/:id', eliminarAnimal);

export default router;