import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Acceso denegado. Token no proporcionado.' });
    }

    token = token.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [rows] = await pool.query('SELECT activo FROM usuarios WHERE id = ?', [decoded.id]);
        if (rows.length === 0 || !rows[0].activo) {
            return res.status(403).json({ success: false, error: 'Usuario inactivo. Contacta al administrador.' });
        }
        
        // 🔒 Aquí ya viajan de forma segura: decoded.id, decoded.rol y decoded.haciendaId
        req.user = decoded; 
        
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Token inválido o expirado.' });
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