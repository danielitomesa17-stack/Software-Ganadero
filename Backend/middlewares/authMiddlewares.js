import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

/**
 * Middleware para verificar el token JWT y el estado activo del usuario en la base de datos.
 */
export const verificarToken = async (req, res, next) => {
    // 1. Obtener el token del encabezado Authorization (Bearer token)
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({ success: false, error: "Token no proporcionado" });
    }

    try {
        // 2. Verificar la firma del JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Consultar el estado REAL del usuario en la base de datos
        // Usamos una consulta preparada para mayor seguridad
        const [usuarios] = await pool.query("SELECT id, activo, rol FROM usuarios WHERE id = ?", [decoded.id]);
        
        // 4. Validar si el usuario existe y está activo
        if (usuarios.length === 0) {
            return res.status(401).json({ success: false, error: "Usuario no encontrado" });
        }

        if (usuarios[0].activo === 0) {
            return res.status(403).json({ success: false, error: "Cuenta bloqueada. Acceso denegado." });
        }
        
        // 5. Inyectar la información del usuario en el objeto request
        req.user = {
            id: usuarios[0].id,
            rol: usuarios[0].rol,
            hacienda_id: decoded.hacienda_id || decoded.haciendaId,
            haciendaId: decoded.haciendaId
        };

        console.log('🔍 Decoded JWT:', decoded);
        console.log('🧭 req.user set to:', req.user);
        
        next();
    } catch (err) {
        // Identificar el tipo de error de JWT para mejor depuración
        const message = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
        console.error(`❌ Error de autenticación: ${err.message}`);
        return res.status(401).json({ success: false, error: message });
    }
};

/**
 * Middleware para restringir rutas según el rol del usuario.
 */
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