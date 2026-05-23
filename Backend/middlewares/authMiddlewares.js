import jwt from 'jsonwebtoken';

// Backend/middlewares/authMiddleware.js
import pool from '../config/db.js'; // Ajusta según tu ruta de conexión

export const verificarToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token no proporcionado" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // --- LA SEGURIDAD ESTÁ AQUÍ ---
        // Consultamos a la base de datos el estado REAL del usuario
        const [usuarios] = await pool.query("SELECT activo FROM usuarios WHERE id = ?", [decoded.id]);
        
        // Si no existe o su estado es 0 (bloqueado), denegamos el paso
        if (usuarios.length === 0 || usuarios[0].activo === 0) {
            return res.status(403).json({ error: "Cuenta bloqueada. Acceso denegado." });
        }
        
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido" });
    }
};

export const autorizarRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permisos necesarios para realizar esta acción.'
            });
        }
        next();
    };
};