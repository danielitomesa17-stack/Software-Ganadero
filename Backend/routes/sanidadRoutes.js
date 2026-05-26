// Backend/routes/sanidadRoutes.js

import express from 'express';
import { getAllSanidad, crearSanidad, eliminarSanidad } from '../controllers/sanidadController.js';

const router = express.Router();

// GET all sanidad records
router.get('/', getAllSanidad);

// POST create new sanidad record
router.post('/', crearSanidad);

// DELETE a sanidad record by id
router.delete('/:id', eliminarSanidad);

export default router;
