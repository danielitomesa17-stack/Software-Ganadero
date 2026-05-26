// Backend/routes/sanidadRoutes.js

import { verificarToken } from '../middlewares/authMiddlewares.js';
import { setTenant } from '../middlewares/setTenant.js';
import { getAllSanidad, crearSanidad, eliminarSanidad } from '../controllers/sanidadController.js';

const router = express.Router();

// GET all sanidad records
router.get('/', verificarToken, setTenant, getAllSanidad);

// POST create new sanidad record
router.post('/', verificarToken, setTenant, crearSanidad);

// DELETE a sanidad record by id
router.delete('/:id', verificarToken, setTenant, eliminarSanidad);

export default router;
