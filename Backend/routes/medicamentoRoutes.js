// Backend/routes/medicamentoRoutes.js

import { verificarToken } from '../middlewares/authMiddlewares.js';
import { setTenant } from '../middlewares/setTenant.js';
import {
  getMedicamentos,
  getMedicamento,
  crearMedicamento,
  actualizarMedicamento,
  eliminarMedicamento,
} from '../controllers/medicamentoController.js';

const router = express.Router();

router.get('/', verificarToken, setTenant, getMedicamentos);
router.get('/:id', verificarToken, setTenant, getMedicamento);
router.post('/', verificarToken, setTenant, crearMedicamento);
router.put('/:id', verificarToken, setTenant, actualizarMedicamento);
router.delete('/:id', verificarToken, setTenant, eliminarMedicamento);

export default router;
