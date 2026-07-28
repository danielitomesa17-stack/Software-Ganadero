import express from 'express';
import { getAforos, getAforoById, createAforo, updateAforo, deleteAforo } from '../controllers/aforoController.js';

const router = express.Router();

router.get('/', getAforos);
router.get('/:id', getAforoById);
router.post('/', createAforo);
router.put('/:id', updateAforo);
router.delete('/:id', deleteAforo);

export default router;
