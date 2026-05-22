import express from 'express';
import { verificarToken, autorizarRoles } from '../middlewares/authMiddlewares.js';
import { crearNuevaHacienda } from '../controllers/adminController.js';

const router = express.Router();
// Middleware aplicado a todas las rutas de este archivo
router.use(verificarToken, autorizarRoles('SuperAdmin'));

// Ruta protegida: Solo el SuperAdmin puede crear nuevos clientes SaaS
router.post('/crear-cliente', 
    verificarToken, 
    autorizarRoles('SuperAdmin'), 
    crearNuevaHacienda
);
// GET para que el Frontend muestre la bitácora
router.get('/bitacora', verificarToken, autorizarRoles('SuperAdmin'), async (req, res) => {
    try {
        const [logs] = await db.execute(`
            SELECT b.*, u.nombre as admin_nombre 
            FROM bitacora_auditoria b
            JOIN usuarios u ON b.admin_id = u.id
            ORDER BY b.fecha_registro DESC
            LIMIT 50
        `);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener la bitácora" });
    }
});

export default router;