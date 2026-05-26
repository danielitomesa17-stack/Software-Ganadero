// Backend/routes/medicamentoRoutes.js

import express from 'express';
import {
  getMedicamentos,
  getMedicamento,
  crearMedicamento,
  actualizarMedicamento,
  eliminarMedicamento,
} from '../controllers/medicamentoController.js';

const router = express.Router();

router.get('/', getMedicamentos);
router.get('/:id', getMedicamento);
router.post('/', crearMedicamento);
router.put('/:id', actualizarMedicamento);
router.delete('/:id', eliminarMedicamento);

export default router;
